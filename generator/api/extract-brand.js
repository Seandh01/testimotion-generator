import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandExtractor/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract colors from inline styles and stylesheets
    const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const colors = new Set();

    $('style').each((_, el) => {
      const styleText = $(el).text();
      const matches = styleText.match(colorRegex) || [];
      matches.forEach(c => colors.add(c));
    });

    $('[style]').each((_, el) => {
      const styleAttr = $(el).attr('style') || '';
      const matches = styleAttr.match(colorRegex) || [];
      matches.forEach(c => colors.add(c));
    });

    // Use Gemini to analyze and extract brand info
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this website HTML and extract brand colors. Return JSON only:
    {
      "primary": "#hex",
      "secondary": "#hex",
      "background": "#hex",
      "backgroundAlt": "#hex"
    }

    Colors found: ${[...colors].slice(0, 20).join(', ')}

    Pick the most likely brand colors based on frequency and prominence.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const brandColors = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Extract logo
    let logo = null;
    const logoSelectors = ['img[alt*="logo"]', 'img[src*="logo"]', '.logo img', '#logo img', 'header img'];
    for (const selector of logoSelectors) {
      const img = $(selector).first();
      if (img.length) {
        logo = img.attr('src');
        if (logo && !logo.startsWith('http')) {
          logo = new URL(logo, url).href;
        }
        break;
      }
    }

    res.json({
      sourceUrl: url,
      colors: brandColors,
      logo,
      fonts: {
        heading: 'system-ui, sans-serif',
        body: 'system-ui, sans-serif'
      }
    });

  } catch (error) {
    console.error('Brand extraction error:', error);
    res.status(500).json({ error: error.message });
  }
}
