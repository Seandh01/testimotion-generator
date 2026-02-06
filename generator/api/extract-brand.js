import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import * as cheerio from 'cheerio';

// =============================================================================
// CONSTANTS
// =============================================================================

// Third-party domains that are NEVER the site's own logo
const THIRD_PARTY_DOMAINS = new Set([
  'google.com', 'gstatic.com', 'googleapis.com', 'googleusercontent.com',
  'facebook.com', 'fbcdn.net', 'fb.com',
  'twitter.com', 'twimg.com', 'x.com',
  'youtube.com', 'ytimg.com',
  'linkedin.com', 'licdn.com',
  'trustpilot.com',
  'intercom.io', 'intercomcdn.com',
  'hubspot.com', 'hsforms.com', 'hs-scripts.com',
  'drift.com', 'driftt.com',
  'crisp.chat',
  'zendesk.com', 'zdassets.com',
  'cloudflare.com', 'cloudflareinsights.com',
  'segment.com', 'segment.io',
  'hotjar.com',
  'amplitude.com',
  'mixpanel.com',
  'optimizely.com',
  'sentry.io',
  'newrelic.com',
  'datadoghq.com',
  'gravatar.com',
  'wp.com', 'wordpress.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com'
]);

// Neutral CDN domains - images here could belong to ANY site (not inherently third-party)
const NEUTRAL_CDN_DOMAINS = new Set([
  'ctfassets.net',        // Contentful CDN (used by many sites for their own content)
  'imgix.net',
  'cloudinary.com',
  'fastly.net',
  'akamaized.net',
  'shopifycdn.com',       // Shopify's CDN for shop content
  'stripeassets.com',     // Stripe's own asset CDN
  'images.prismic.io',
  'sanity.io',
  'storyblok.com'
]);

const DEFAULT_COLORS = {
  primary: '#635BFF',    // Stripe purple as sensible default
  secondary: '#00D4FF',  // Cyan complement
  background: '#0A2540',
  backgroundAlt: '#000000'
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
  const trimmed = name.trim();
  // Skip generic font families
  if (/^(system-ui|sans-serif|serif|monospace|cursive|fantasy|inherit|initial|unset|-apple-system|BlinkMacSystemFont|ui-sans-serif|ui-serif|ui-monospace)$/i.test(trimmed)) {
    return true;
  }
  // Skip CSS variable references
  if (/^var\(/.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Normalize hex color to #RRGGBB format
 * Handles: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba()
 */
function normalizeHex(color) {
  if (!color) return null;
  color = color.trim().toLowerCase();

  // Handle 3-char hex (#RGB → #RRGGBB)
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
  }

  // Handle 8-char hex (#RRGGBBAA → #RRGGBB)
  if (/^#[0-9a-f]{8}$/i.test(color)) {
    return color.slice(0, 7).toUpperCase();
  }

  // Handle 6-char hex
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toUpperCase();
  }

  // Handle rgb(r, g, b) and rgba(r, g, b, a)
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1])).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(rgbMatch[2])).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(rgbMatch[3])).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  return null;
}

const validHex = (c) => /^#[0-9A-Fa-f]{6}$/i.test(c);

/**
 * Convert hex to HSL
 */
function hexToHsl(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = ((rgb >> 0) & 0xff) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; // Normalize hue
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Derive a complementary/analogous color (shift hue by 30°)
 */
function deriveComplementary(hex) {
  if (!validHex(hex)) return null;
  const { h, s, l } = hexToHsl(hex);
  // Shift hue by 30° for analogous harmony (less jarring than 180° complement)
  return hslToHex(h + 30, s, l);
}

function getColorInfo(hex) {
  if (!validHex(hex)) return { luminance: 0.5, saturation: 0 };
  const { s, l } = hexToHsl(hex);
  return { luminance: l, saturation: s };
}

function isVibrant(hex) {
  if (!validHex(hex)) return false;
  const { luminance, saturation } = getColorInfo(hex);
  if (luminance > 0.9 || luminance < 0.08) return false;
  if (saturation < 0.15) return false;
  return true;
}

/**
 * Check if two colors are in similar hue range (within 40° hue difference)
 */
function colorsAreSimilar(hex1, hex2) {
  if (!validHex(hex1) || !validHex(hex2)) return false;
  const hsl1 = hexToHsl(hex1);
  const hsl2 = hexToHsl(hex2);
  const hueDiff = Math.abs(hsl1.h - hsl2.h);
  return hueDiff < 40 || hueDiff > 320; // Handle wraparound at 360°
}

// =============================================================================
// DOMAIN VALIDATION
// =============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Get root domain (e.g., sub.example.com → example.com)
 */
function getRootDomain(hostname) {
  if (!hostname) return null;
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

/**
 * Check if URL is from a third-party domain
 * Returns true for known third-party services (Google, Facebook, etc.)
 * Returns false for neutral CDNs (could host anyone's content)
 */
function isThirdPartyLogo(src, targetDomain) {
  if (!src || src.startsWith('data:')) return false;

  const srcDomain = extractDomain(src);
  if (!srcDomain) return false;

  const srcRoot = getRootDomain(srcDomain);
  const targetRoot = getRootDomain(targetDomain);

  // Allow if same root domain
  if (srcRoot === targetRoot) return false;

  // Neutral CDNs can host anyone's content - don't block them
  if (NEUTRAL_CDN_DOMAINS.has(srcRoot) || NEUTRAL_CDN_DOMAINS.has(srcDomain)) {
    return false;
  }

  // Check blocklist for known third-party services
  return THIRD_PARTY_DOMAINS.has(srcRoot) || THIRD_PARTY_DOMAINS.has(srcDomain);
}

/**
 * Check if logo URL domain matches target site
 */
function isDomainRelated(src, targetDomain) {
  if (!src) return false;
  if (src.startsWith('data:') || src.startsWith('/')) return true; // Relative or data URI

  const srcDomain = extractDomain(src);
  if (!srcDomain) return false;

  const srcRoot = getRootDomain(srcDomain);
  const targetRoot = getRootDomain(targetDomain);

  return srcRoot === targetRoot || srcDomain.includes(targetRoot) || targetRoot.includes(srcRoot);
}

/**
 * Get bonus score for same-domain logos
 */
function domainBonus(src, targetDomain) {
  return isDomainRelated(src, targetDomain) ? 5 : 0;
}

/**
 * Resolve relative URLs to absolute
 */
function resolveUrl(src, baseUrl) {
  if (!src) return null;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Join element attributes for logo detection
 */
function joinAttrs($, el) {
  return [
    $(el).attr('alt'),
    $(el).attr('class'),
    $(el).attr('id'),
    $(el).attr('src'),
    $(el).attr('aria-label'),
    $(el).attr('title')
  ].filter(Boolean).join(' ').toLowerCase();
}

// =============================================================================
// LOGO EXTRACTION (Multi-Source with Scoring)
// =============================================================================

function extractLogoFromHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const targetDomain = extractDomain(baseUrl);
  const candidates = [];

  // Source 1: Favicon and apple-touch-icon (guaranteed site brand)
  $('link[rel*="icon"]').each((_, el) => {
    const href = $(el).attr('href');
    const sizes = $(el).attr('sizes') || '';
    const rel = $(el).attr('rel') || '';

    if (href) {
      const resolved = resolveUrl(href, baseUrl);
      if (resolved && !isThirdPartyLogo(resolved, targetDomain)) {
        // Prefer larger icons
        let score = rel.includes('apple-touch-icon') ? 60 : 50;
        const sizeMatch = sizes.match(/(\d+)/);
        if (sizeMatch) {
          const size = parseInt(sizeMatch[1]);
          if (size >= 180) score += 10;
          else if (size >= 128) score += 5;
        }
        candidates.push({ src: resolved, score, source: 'favicon' });
      }
    }
  });

  // Source 2: <img> in header/nav with "logo" in attributes (most common placement)
  // Only take the FIRST logo in header - it's almost always the site's own logo
  let foundHeaderLogo = false;
  $('header img, nav img, [class*="header"] img, [class*="navbar"] img').each((_, el) => {
    if (foundHeaderLogo) return; // Only take first header logo

    const src = $(el).attr('src');
    const attrs = joinAttrs($, el);

    if (src && /logo/i.test(attrs)) {
      const resolved = resolveUrl(src, baseUrl);
      if (resolved && !isThirdPartyLogo(resolved, targetDomain)) {
        const score = 95 + domainBonus(resolved, targetDomain); // Highest score for first header logo
        candidates.push({ src: resolved, score, source: 'header-img' });
        foundHeaderLogo = true;
      }
    }
  });

  // Also check for first img in header WITHOUT "logo" attribute (some sites don't label it)
  if (!foundHeaderLogo) {
    $('header img, nav img').first().each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const resolved = resolveUrl(src, baseUrl);
        if (resolved && !isThirdPartyLogo(resolved, targetDomain)) {
          // Lower score since no "logo" attribute, but still valuable
          const score = 75 + domainBonus(resolved, targetDomain);
          candidates.push({ src: resolved, score, source: 'header-first-img' });
        }
      }
    });
  }

  // Source 3: <svg> in header/nav (modern sites like claude.ai, shopify)
  $('header svg, nav svg, [class*="header"] svg, [class*="nav"] svg, [class*="logo"] svg').each((_, el) => {
    const svg = $(el);
    const outerHtml = $.html(el);

    // Skip tiny SVGs (likely icons, not logos)
    const width = parseInt(svg.attr('width') || '0');
    const height = parseInt(svg.attr('height') || '0');
    if (width > 0 && width < 20 && height > 0 && height < 20) return;

    // Convert to data URI (cap at 50KB)
    if (outerHtml.length < 50000) {
      const cleanSvg = outerHtml.replace(/[\n\r\t]+/g, ' ').trim();
      const base64 = Buffer.from(cleanSvg).toString('base64');
      const dataUri = `data:image/svg+xml;base64,${base64}`;
      candidates.push({ src: dataUri, score: 80, source: 'header-svg' });
    }
  });

  // Source 4: og:image meta tag (social preview as fallback)
  $('meta[property="og:image"], meta[name="og:image"]').each((_, el) => {
    const content = $(el).attr('content');
    if (content) {
      const resolved = resolveUrl(content, baseUrl);
      if (resolved && !isThirdPartyLogo(resolved, targetDomain)) {
        candidates.push({ src: resolved, score: 40 + domainBonus(resolved, targetDomain), source: 'og-image' });
      }
    }
  });

  // Source 5: Any <img> with "logo" in attributes BUT only if domain-related
  // This prevents grabbing partner logos from client/testimonial sections
  const knownBrandNames = ['figma', 'slack', 'dropbox', 'asana', 'trello', 'zoom', 'salesforce',
    'hubspot', 'mailchimp', 'stripe', 'shopify', 'squarespace', 'wix', 'wordpress', 'hertz',
    'airbnb', 'uber', 'lyft', 'doordash', 'instacart', 'netflix', 'spotify', 'discord'];

  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const attrs = joinAttrs($, el);

    if (src && /logo/i.test(attrs)) {
      const resolved = resolveUrl(src, baseUrl);
      const resolvedLower = (resolved || '').toLowerCase();
      const targetName = targetDomain.split('.')[0].toLowerCase();

      // STRICT: Only accept if same domain OR URL contains target domain name
      const srcContainsTarget = resolved && (
        isDomainRelated(resolved, targetDomain) ||
        resolvedLower.includes(targetName)
      );

      // Reject if URL contains other known brand names (partner logos)
      const containsOtherBrand = knownBrandNames.some(brand =>
        brand !== targetName && resolvedLower.includes(brand)
      );

      if (resolved && !isThirdPartyLogo(resolved, targetDomain) && srcContainsTarget && !containsOtherBrand) {
        const score = 35 + domainBonus(resolved, targetDomain);
        // Avoid duplicates
        if (!candidates.some(c => c.src === resolved)) {
          candidates.push({ src: resolved, score, source: 'any-img-strict' });
        }
      }
    }
  });

  // Sort by score descending, return best candidate
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    console.log(`Logo candidates: ${candidates.length}, best: ${candidates[0].source} (score: ${candidates[0].score})`);
    return candidates[0].src;
  }

  return null;
}

// =============================================================================
// FONT EXTRACTION
// =============================================================================

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

  // 2. @font-face and font-family in <style> tags
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

// =============================================================================
// HTML COLOR EXTRACTION (NEW - Deterministic)
// =============================================================================

function extractColorsFromHtml(html) {
  const $ = cheerio.load(html);
  const colors = [];

  // Strategy 1: CSS Custom Properties (confidence 0.9)
  const cssVarPatterns = [
    /--(?:primary|brand-primary|color-primary|accent|main|brand)\s*:\s*([^;}\n]+)/gi,
    /--(?:secondary|brand-secondary|color-secondary)\s*:\s*([^;}\n]+)/gi,
    /--(?:bg|background|bg-color|background-color)\s*:\s*([^;}\n]+)/gi
  ];

  const allStyles = [];
  $('style').each((_, el) => allStyles.push($(el).html() || ''));
  $('[style]').each((_, el) => allStyles.push($(el).attr('style') || ''));
  const combinedCss = allStyles.join('\n');

  for (const pattern of cssVarPatterns) {
    const matches = combinedCss.matchAll(pattern);
    for (const m of matches) {
      const normalized = normalizeHex(m[1]);
      if (normalized && isVibrant(normalized)) {
        const isPrimary = /primary|brand|accent|main/i.test(m[0]);
        colors.push({
          hex: normalized,
          confidence: 0.9,
          source: 'css-variable',
          type: isPrimary ? 'primary' : 'secondary'
        });
      }
    }
  }

  // Strategy 2: <meta name="theme-color"> (confidence 0.85)
  $('meta[name="theme-color"]').each((_, el) => {
    const content = $(el).attr('content');
    const normalized = normalizeHex(content);
    if (normalized && isVibrant(normalized)) {
      colors.push({
        hex: normalized,
        confidence: 0.85,
        source: 'theme-color',
        type: 'primary'
      });
    }
  });

  // Strategy 3: Button/CTA inline styles (confidence 0.7)
  $('button, a.btn, [class*="cta"], [class*="btn-primary"], [class*="button-primary"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    if (bgMatch) {
      const normalized = normalizeHex(bgMatch[1]);
      if (normalized && isVibrant(normalized)) {
        colors.push({
          hex: normalized,
          confidence: 0.7,
          source: 'button-style',
          type: 'primary'
        });
      }
    }
  });

  // Strategy 4: CSS class declarations for buttons (confidence 0.75)
  const buttonPatterns = [
    /\.(?:btn-primary|cta|button-primary|primary-button)[^{]*\{[^}]*background(?:-color)?\s*:\s*([^;}\n]+)/gi,
    /\.(?:btn|button)[^{]*\{[^}]*background(?:-color)?\s*:\s*([^;}\n]+)/gi
  ];

  for (const pattern of buttonPatterns) {
    const matches = combinedCss.matchAll(pattern);
    for (const m of matches) {
      const normalized = normalizeHex(m[1]);
      if (normalized && isVibrant(normalized)) {
        colors.push({
          hex: normalized,
          confidence: 0.75,
          source: 'css-class',
          type: 'primary'
        });
      }
    }
  }

  // Sort by confidence, deduplicate
  colors.sort((a, b) => b.confidence - a.confidence);

  // Group by type
  const primary = colors.find(c => c.type === 'primary');
  const secondary = colors.find(c => c.type === 'secondary' && c.hex !== primary?.hex);

  console.log(`HTML colors extracted: ${colors.length} candidates`);

  return {
    primary: primary?.hex || null,
    secondary: secondary?.hex || null,
    primaryConfidence: primary?.confidence || 0,
    secondaryConfidence: secondary?.confidence || 0
  };
}

// =============================================================================
// COLOR RESOLUTION (Cross-Validation)
// =============================================================================

function resolveColors(geminiColors, htmlColors) {
  const result = {
    primary: null,
    secondary: null,
    background: null,
    backgroundAlt: null
  };

  // PRIMARY: HTML first (deterministic), then Gemini, then derive, then default
  if (htmlColors.primary && isVibrant(htmlColors.primary)) {
    result.primary = htmlColors.primary;
    console.log(`Primary from HTML: ${result.primary}`);
  } else if (geminiColors.primary && isVibrant(geminiColors.primary)) {
    result.primary = geminiColors.primary;
    console.log(`Primary from Gemini: ${result.primary}`);
  } else {
    result.primary = DEFAULT_COLORS.primary;
    console.log(`Primary fallback: ${result.primary}`);
  }

  // Cross-validate: If both HTML and Gemini have primaries, prefer HTML but log agreement
  if (htmlColors.primary && geminiColors.primary) {
    if (colorsAreSimilar(htmlColors.primary, geminiColors.primary)) {
      console.log(`Primary cross-validation: HTML and Gemini agree (similar hues)`);
    } else {
      console.log(`Primary cross-validation: HTML (${htmlColors.primary}) differs from Gemini (${geminiColors.primary}), preferring HTML`);
    }
  }

  // SECONDARY: HTML first, then Gemini, then derive from primary
  if (htmlColors.secondary && isVibrant(htmlColors.secondary) && htmlColors.secondary !== result.primary) {
    result.secondary = htmlColors.secondary;
    console.log(`Secondary from HTML: ${result.secondary}`);
  } else if (geminiColors.secondary && isVibrant(geminiColors.secondary) && geminiColors.secondary !== result.primary) {
    result.secondary = geminiColors.secondary;
    console.log(`Secondary from Gemini: ${result.secondary}`);
  } else {
    // Derive from primary using color theory
    result.secondary = deriveComplementary(result.primary) || DEFAULT_COLORS.secondary;
    console.log(`Secondary derived from primary: ${result.secondary}`);
  }

  // BACKGROUND: Gemini is better at detecting dark/light themes from screenshot
  result.background = validHex(geminiColors.background) ? geminiColors.background : DEFAULT_COLORS.background;
  result.backgroundAlt = validHex(geminiColors.backgroundAlt) ? geminiColors.backgroundAlt : DEFAULT_COLORS.backgroundAlt;

  // Handle identical backgrounds
  if (result.background === result.backgroundAlt) {
    const { luminance } = getColorInfo(result.background);
    if (luminance > 0.9) {
      result.backgroundAlt = '#F5F5F5';
    } else if (luminance < 0.1) {
      result.backgroundAlt = '#1A1A2E';
    }
  }

  return result;
}

// =============================================================================
// GEMINI VISION ANALYSIS
// =============================================================================

async function analyzeWithGemini(base64Screenshot, targetDomain, geminiKey) {
  const ai = new GoogleGenAI({ apiKey: geminiKey });

  const prompt = `You are a brand identity analyst. Analyze this screenshot of "${targetDomain}" and extract ONLY the brand colors belonging to ${targetDomain} itself.

WHERE TO LOOK (priority order):
1. NAVIGATION BAR and LOGO area — logo color IS the brand color
2. PRIMARY CTA BUTTONS — main call-to-action button color
3. LINKS and INTERACTIVE ELEMENTS
4. HERO SECTION accent colors (highlights, underlines)

WHAT TO IGNORE:
- Third-party widget colors (Google, Facebook, Twitter, chat widgets)
- Partner/client logos on the page
- Stock photos or product images
- Gray/neutral UI chrome (borders, shadows, dividers)
- Cookie banners, ads, embedded content

RULES:
- primary = Single most prominent brand accent (CTA button, logo, link color)
- secondary = Different secondary accent (hover state, badges). MUST differ from primary
- background/backgroundAlt = Page background gradient endpoints
- ALL colors in #RRGGBB hex format
- primary/secondary MUST be vibrant (not gray/white/black)
- Rate confidence as "high", "medium", or "low"

FONT IDENTIFICATION:
- headingFont = Exact typeface name for headlines (e.g., "Montserrat", "Inter", "Poppins")
- bodyFont = Exact typeface name for body text
- Look at letterform characteristics: x-height, stroke contrast, terminals
- If uncertain, return "system-ui"`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
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
          primaryConfidence: {
            type: Type.STRING,
            description: 'Confidence level: "high", "medium", or "low"'
          },
          secondary: {
            type: Type.STRING,
            description: 'Secondary accent color in #RRGGBB hex format'
          },
          secondaryConfidence: {
            type: Type.STRING,
            description: 'Confidence level: "high", "medium", or "low"'
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

  return JSON.parse(response.text);
}

// =============================================================================
// SCREENSHOT URL BUILDER
// =============================================================================

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

  const queryString = params.toString();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');

  return `https://api.screenshotone.com/take?${queryString}&signature=${signature}`;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    // Step 1: Validate input
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const targetDomain = parsedUrl.hostname.replace(/^www\./, '');

    const geminiKey = process.env.GEMINI_API_KEY;
    const ssAccessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
    const ssSecretKey = process.env.SCREENSHOTONE_SECRET_KEY;

    if (!geminiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    if (!ssAccessKey || !ssSecretKey) {
      return res.status(500).json({ error: 'ScreenshotOne keys not configured' });
    }

    console.log(`Extracting brand from: ${url} (domain: ${targetDomain})`);

    // Step 2: PARALLEL fetch - HTML and Screenshot concurrently
    const screenshotUrl = buildScreenshotUrl(url, ssAccessKey, ssSecretKey);

    const [htmlResult, screenshotResult] = await Promise.allSettled([
      // HTML fetch with timeout
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/2.0)' },
        signal: AbortSignal.timeout(8000)
      }).then(r => r.ok ? r.text() : null),

      // Screenshot fetch with retry
      (async () => {
        let ssResponse = await fetch(screenshotUrl);
        if (ssResponse.status >= 500) {
          console.log('ScreenshotOne returned 5xx, retrying in 2s...');
          await new Promise(r => setTimeout(r, 2000));
          ssResponse = await fetch(screenshotUrl);
        }
        if (!ssResponse.ok) {
          throw new Error(`Screenshot capture failed: ${ssResponse.status}`);
        }
        const buffer = Buffer.from(await ssResponse.arrayBuffer());
        console.log(`Screenshot captured: ${Math.round(buffer.length / 1024)}KB`);
        return buffer.toString('base64');
      })()
    ]);

    const html = htmlResult.status === 'fulfilled' ? htmlResult.value : null;
    const base64Screenshot = screenshotResult.status === 'fulfilled' ? screenshotResult.value : null;

    if (!base64Screenshot) {
      throw new Error('Screenshot capture failed');
    }

    // Step 3: Extract colors from HTML (deterministic)
    let htmlColors = { primary: null, secondary: null, primaryConfidence: 0, secondaryConfidence: 0 };
    if (html) {
      htmlColors = extractColorsFromHtml(html);
    }

    // Step 4: Extract fonts from HTML
    let htmlFonts = { heading: null, body: null };
    if (html) {
      htmlFonts = extractFontsFromHtml(html);
    }

    // Step 5: Extract logo from HTML (rewritten with scoring)
    let logo = null;
    if (html) {
      logo = extractLogoFromHtml(html, url);
    }

    // Step 6: Gemini Vision analysis (improved prompt) with retry logic
    let geminiData = null;
    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini analysis attempt ${attempt}/${maxRetries}...`);
        geminiData = await analyzeWithGemini(base64Screenshot, targetDomain, geminiKey);
        console.log('Gemini raw response:', JSON.stringify(geminiData));
        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');

        if (isRateLimit && attempt < maxRetries) {
          console.log(`Rate limited. Retrying in 5 seconds... (attempt ${attempt}/${maxRetries})`);
          await new Promise(r => setTimeout(r, 5000));
        } else if (!isRateLimit) {
          // Non-rate-limit error, don't retry
          throw error;
        }
      }
    }

    if (!geminiData) {
      throw new Error(`Rate limit exceeded after ${maxRetries} attempts. Please wait a minute and try again.`);
    }

    // Step 7: Cross-validate and resolve colors
    const colors = resolveColors(
      {
        primary: geminiData.primary,
        secondary: geminiData.secondary,
        background: geminiData.background,
        backgroundAlt: geminiData.backgroundAlt
      },
      htmlColors
    );

    // Step 8: Font resolution (HTML > Gemini)
    const cleanFont = (f) => {
      if (!f || f === 'system-ui' || f === 'sans-serif') return null;
      return f.split(',')[0].trim().replace(/['"]/g, '');
    };

    const fonts = {
      heading: htmlFonts.heading || cleanFont(geminiData.headingFont) || 'system-ui',
      body: htmlFonts.body || cleanFont(geminiData.bodyFont) || 'system-ui'
    };

    console.log('Final brand:', {
      colors,
      fonts,
      fontSource: htmlFonts.heading ? 'html' : 'gemini',
      logo: logo ? (logo.startsWith('data:') ? 'SVG data URI' : logo) : null
    });

    // Step 9: Return response (unchanged shape)
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
