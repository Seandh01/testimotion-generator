import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy-load Playwright only when needed
let chromium = null;

/**
 * Lightweight brand extraction using Playwright screenshot + Gemini Vision
 *
 * Flow: URL → Screenshot → Gemini Analysis → Brand Data
 * Cost: ~$0.0001-0.0003 per extraction (Gemini Flash)
 */
export async function extractBrandFromURL(url) {
  console.log('Starting brand extraction for:', url);

  // 1. Take screenshot with Playwright
  const screenshot = await captureScreenshot(url);

  if (!screenshot) {
    console.log('Screenshot failed, returning defaults');
    return getDefaultBrand(url);
  }

  // 2. Analyze with Gemini
  const brandData = await analyzeWithGemini(screenshot);

  return {
    colors: {
      primary: brandData.primary || '#635BFF',
      secondary: brandData.secondary || '#00D4FF',
      background: brandData.bg_start || '#0A2540',
      backgroundAlt: brandData.bg_end || '#000000'
    },
    fonts: {
      heading: brandData.heading_font || 'system-ui, -apple-system, sans-serif',
      body: brandData.body_font || 'system-ui, -apple-system, sans-serif'
    },
    logo: brandData.logo_url || null,
    sourceUrl: url
  };
}

/**
 * Capture above-the-fold screenshot using Playwright
 */
async function captureScreenshot(url) {
  // Lazy-load Playwright
  if (!chromium) {
    try {
      // Try playwright-core first (for production/Vercel)
      const pw = await import('playwright-core');
      chromium = pw.chromium;
    } catch {
      // Fall back to full playwright (local dev)
      const pw = await import('playwright');
      chromium = pw.chromium;
    }
  }

  let browser = null;

  try {
    // Minimal browser args for lightweight operation
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Important for serverless
        '--disable-extensions'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait a bit for any animations to settle
    await page.waitForTimeout(500);

    // Capture screenshot as JPEG (smaller than PNG)
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 85,
      fullPage: false // Just viewport (above-the-fold)
    });

    console.log('Screenshot captured:', Math.round(screenshot.length / 1024), 'KB');

    return screenshot;

  } catch (error) {
    console.error('Screenshot failed:', error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Analyze screenshot with Gemini Vision API
 */
async function analyzeWithGemini(screenshot) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, using defaults');
    return {};
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const base64Image = screenshot.toString('base64');

  const prompt = `Analyze this website screenshot and extract the brand identity.

Look for:
1. PRIMARY COLOR: The main accent/brand color (buttons, links, highlights) - NOT white/black/grey
2. SECONDARY COLOR: Supporting accent color if visible - NOT white/black/grey
3. BACKGROUND: If dark theme, identify the gradient start/end colors. If light, use #FFFFFF
4. HEADING FONT: The font used for headlines (e.g., "Inter", "Montserrat", "Poppins")
5. BODY FONT: The font used for body text (often same as heading)
6. LOGO URL: If you can see a logo image, describe it (we can't extract URLs from screenshots)

IMPORTANT:
- Colors must be vibrant brand colors, not neutral tones
- If you can't determine a color with confidence, return null
- For fonts, give your best guess based on visual appearance

Return ONLY valid JSON (no markdown, no explanation):
{
  "primary": "#RRGGBB or null",
  "secondary": "#RRGGBB or null",
  "bg_start": "#RRGGBB",
  "bg_end": "#RRGGBB",
  "heading_font": "Font Name, sans-serif",
  "body_font": "Font Name, sans-serif",
  "logo_description": "brief description or null"
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const text = result.response.text().trim();
    // Clean markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Gemini response:', cleanedText);

    const parsed = JSON.parse(cleanedText);

    // Validate and clean colors
    return {
      primary: isValidHex(parsed.primary) ? parsed.primary : null,
      secondary: isValidHex(parsed.secondary) ? parsed.secondary : null,
      bg_start: isValidHex(parsed.bg_start) ? parsed.bg_start : '#0A2540',
      bg_end: isValidHex(parsed.bg_end) ? parsed.bg_end : '#000000',
      heading_font: parsed.heading_font || 'system-ui, -apple-system, sans-serif',
      body_font: parsed.body_font || 'system-ui, -apple-system, sans-serif',
      logo_url: null // Can't extract from screenshot
    };

  } catch (error) {
    console.error('Gemini analysis failed:', error.message);
    return {};
  }
}

/**
 * Validate hex color format
 */
function isValidHex(color) {
  if (!color || color === 'null') return false;
  return /^#[0-9A-Fa-f]{6}$/i.test(color);
}

/**
 * Return default brand values when extraction fails
 */
function getDefaultBrand(url) {
  return {
    colors: {
      primary: '#635BFF',
      secondary: '#00D4FF',
      background: '#0A2540',
      backgroundAlt: '#000000'
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif'
    },
    logo: null,
    sourceUrl: url
  };
}
