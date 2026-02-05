import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import * as cheerio from 'cheerio';

function friendlyError(error) {
  const msg = error.message || '';
  if (msg.includes('"code":429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (msg.includes('"code":500') || msg.includes('INTERNAL')) {
    return 'AI service temporarily unavailable. Please try again.';
  }
  if (msg.includes('"code":403') || msg.includes('PERMISSION_DENIED')) {
    return 'API key error. Please check configuration.';
  }
  if (msg.startsWith('{') || msg.startsWith('[')) {
    return 'AI analysis failed. Please try again.';
  }
  return msg;
}

function isGenericFont(name) {
  return /^(system-ui|sans-serif|serif|monospace|cursive|fantasy|inherit|initial|unset|-apple-system|BlinkMacSystemFont)$/i.test(name.trim());
}

function extractFontsFromHtml(html) {
  const $ = cheerio.load(html);
  const fonts = [];

  // 1. Google Fonts <link> tags (most reliable)
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const familyMatches = href.matchAll(/family=([^:&]+)/g);
    for (const m of familyMatches) {
      fonts.push(decodeURIComponent(m[1]).replace(/\+/g, ' '));
    }
  });

  // 2. @font-face in <style> tags
  $('style').each((_, el) => {
    const css = $(el).html() || '';
    const faceMatches = css.matchAll(/font-family\s*:\s*['"]?([^'";},]+)/g);
    for (const m of faceMatches) {
      const name = m[1].trim();
      if (!isGenericFont(name)) fonts.push(name);
    }
  });

  // Deduplicate, first = heading, second = body (convention)
  const unique = [...new Set(fonts)];
  return {
    heading: unique[0] || null,
    body: unique[1] || unique[0] || null
  };
}

function extractLogoFromHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const logoImg = $('img').filter((_, el) => {
    const attrs = [$(el).attr('alt'), $(el).attr('class'), $(el).attr('id'), $(el).attr('src')].join(' ');
    return /logo/i.test(attrs);
  }).first();

  const src = logoImg.attr('src');
  if (!src) return null;
  return src.startsWith('http') ? src : new URL(src, baseUrl).href;
}

function getColorInfo(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = ((rgb >> 0) & 0xff) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { luminance: l, saturation: s };
}

function isVibrant(hex) {
  if (!validHex(hex)) return false;
  const { luminance, saturation } = getColorInfo(hex);
  if (luminance > 0.9 || luminance < 0.08) return false;
  if (saturation < 0.15) return false;
  return true;
}

const validHex = (c) => /^#[0-9A-Fa-f]{6}$/.test(c);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const ssAccessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
    const ssSecretKey = process.env.SCREENSHOTONE_SECRET_KEY;

    if (!geminiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    if (!ssAccessKey || !ssSecretKey) {
      return res.status(500).json({ error: 'ScreenshotOne keys not configured' });
    }

    // 1. Capture screenshot via ScreenshotOne (with retry for transient 5xx)
    const screenshotUrl = buildScreenshotUrl(url, ssAccessKey, ssSecretKey);
    let ssResponse = await fetch(screenshotUrl);
    if (ssResponse.status >= 500) {
      console.log('ScreenshotOne returned 500, retrying in 2s...');
      await new Promise(r => setTimeout(r, 2000));
      ssResponse = await fetch(screenshotUrl);
    }

    if (!ssResponse.ok) {
      throw new Error(`Screenshot capture failed: ${ssResponse.status}`);
    }

    const screenshotBuffer = Buffer.from(await ssResponse.arrayBuffer());
    const base64Screenshot = screenshotBuffer.toString('base64');

    console.log(`Screenshot captured: ${Math.round(screenshotBuffer.length / 1024)}KB`);

    // 2. Analyze with Gemini Vision
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [
          {
            text: `Analyze this website screenshot and extract the brand identity.

FOCUS ON:
- HEADER, HERO SECTION, BUTTONS, LINKS for the PRIMARY color (the main accent/brand color)
- Look for a SECONDARY accent color used on hover states, badges, or secondary buttons
- BACKGROUND: Identify if it's a dark or light theme. For dark themes, identify gradient start (lighter) and end (darker) colors. For light themes, use #FFFFFF.
- HEADING FONT: Identify the actual typeface name for headlines (e.g., "Montserrat", "Poppins", "Inter"). Look at letterforms carefully.
- BODY FONT: Identify the body text typeface. Often different from heading font.

IGNORE COMPLETELY:
- Cookie consent banners
- Chat widgets / chatbots
- Pop-ups or modals
- Advertisement banners
- Browser chrome

RULES:
- Return ONLY vibrant brand colors, NOT neutral grays/whites/blacks for primary/secondary
- Colors must be in #RRGGBB hex format
- For fonts, identify the specific Google Font or web font name (not generic "sans-serif")
- If you cannot determine a font with confidence, return "system-ui"
- Be specific with font identification based on letterform characteristics`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Screenshot
            }
          }
        ]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary: {
              type: Type.STRING,
              description: 'Primary brand/accent color in #RRGGBB hex format'
            },
            secondary: {
              type: Type.STRING,
              description: 'Secondary accent color in #RRGGBB hex format'
            },
            background: {
              type: Type.STRING,
              description: 'Background color or gradient start in #RRGGBB hex format'
            },
            backgroundAlt: {
              type: Type.STRING,
              description: 'Background gradient end or alternate background in #RRGGBB hex format'
            },
            headingFont: {
              type: Type.STRING,
              description: 'Heading font name (e.g. "Montserrat", "Inter", "Poppins")'
            },
            bodyFont: {
              type: Type.STRING,
              description: 'Body text font name (e.g. "Open Sans", "Lato", "Roboto")'
            }
          },
          required: ['primary', 'secondary', 'background', 'backgroundAlt', 'headingFont', 'bodyFont']
        }
      }
    });

    const brandData = JSON.parse(response.text);
    console.log('Gemini raw response:', JSON.stringify(brandData));

    // 3. Fetch HTML for font + logo extraction (Cheerio-based)
    let htmlFonts = { heading: null, body: null };
    let logo = null;
    try {
      const htmlRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/2.0)' },
        signal: AbortSignal.timeout(5000)
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        htmlFonts = extractFontsFromHtml(html);
        logo = extractLogoFromHtml(html, url);
      }
    } catch {
      // HTML extraction is best-effort
    }

    // Clean font names - strip fallback stacks if Gemini included them
    const cleanFont = (f) => {
      if (!f || f === 'system-ui' || f === 'sans-serif') return null;
      return f.split(',')[0].trim().replace(/['"]/g, '');
    };

    // Prefer HTML-extracted fonts over Gemini's guess
    const fonts = {
      heading: htmlFonts.heading || cleanFont(brandData.headingFont) || 'system-ui',
      body: htmlFonts.body || cleanFont(brandData.bodyFont) || 'system-ui'
    };

    // Validate colors — reject neutrals for primary/secondary
    const colors = {
      primary: isVibrant(brandData.primary) ? brandData.primary : '#635BFF',
      secondary: isVibrant(brandData.secondary) ? brandData.secondary : '#00D4FF',
      background: validHex(brandData.background) ? brandData.background : '#0A2540',
      backgroundAlt: validHex(brandData.backgroundAlt) ? brandData.backgroundAlt : '#000000'
    };

    // If both backgrounds are identical white/near-white, add subtle differentiation
    if (colors.background === colors.backgroundAlt) {
      const { luminance } = getColorInfo(colors.background);
      if (luminance > 0.9) {
        colors.backgroundAlt = '#F5F5F5';
      }
    }

    console.log('Validated brand:', { colors, fonts, fontSource: htmlFonts.heading ? 'html' : 'gemini' });

    res.json({
      sourceUrl: url,
      colors,
      fonts,
      logo
    });

  } catch (error) {
    console.error('Brand extraction error:', error);
    res.status(500).json({ error: friendlyError(error) });
  }
}

/**
 * Build a signed ScreenshotOne URL
 */
function buildScreenshotUrl(targetUrl, accessKey, secretKey) {
  const params = new URLSearchParams({
    access_key: accessKey,
    url: targetUrl,
    viewport_width: '1280',
    viewport_height: '800',
    format: 'jpeg',
    image_quality: '80',
    block_cookie_banners: 'true',
    block_ads: 'true',
    block_chats: 'true',
    delay: '2',
    timeout: '30'
  });

  // Sign the URL with HMAC-SHA256
  const queryString = params.toString();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');

  return `https://api.screenshotone.com/take?${queryString}&signature=${signature}`;
}
