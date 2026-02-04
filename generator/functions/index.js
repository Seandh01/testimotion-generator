/**
 * Firebase Cloud Functions for TESTIMOTION Generator
 * Handles API endpoints for brand extraction and copy generation
 */

import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

// Define the API key parameter
const geminiApiKey = defineString('GEMINI_API_KEY');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Brand extraction endpoint
app.post('/api/extract-brand', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const apiKey = geminiApiKey.value();
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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
});

// Copy generation endpoint
app.post('/api/generate-copy', async (req, res) => {
  try {
    const { websiteUrl, prompt, language = 'nl' } = req.body;

    if (!websiteUrl || !prompt) {
      return res.status(400).json({ error: 'Website URL and prompt are required' });
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Fetch website content for context
    let websiteContent = '';
    try {
      const response = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CopyWriter/1.0)' }
      });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header').remove();
        websiteContent = $('body').text().replace(/\s+/g, ' ').slice(0, 3000);
      }
    } catch (e) {
      console.log('Could not fetch website, continuing without context');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const langName = language === 'nl' ? 'Dutch' : 'English';

    const copyPrompt = `Generate landing page copy in ${langName} for this business:

Business description: ${prompt}
Website context: ${websiteContent.slice(0, 1000)}

Return ONLY valid JSON with these fields:
{
  "hero_headline": "compelling headline",
  "hero_subheadline": "supporting text",
  "cta_button_text": "action button text",
  "cta_button_secondary_text": "secondary CTA",
  "mini_testimonial_1": "short quote 1",
  "mini_testimonial_2": "short quote 2",
  "mini_testimonial_3": "short quote 3",
  "process_headline": "process section headline",
  "step_1_title": "step 1 title",
  "step_1_description": "step 1 description",
  "step_2_title": "step 2 title",
  "step_2_description": "step 2 description",
  "step_3_title": "step 3 title",
  "step_3_description": "step 3 description",
  "guarantee_text": "guarantee statement",
  "reviews_headline": "reviews section headline",
  "reviews_subheadline": "reviews subheadline",
  "footer_headline": "footer CTA headline",
  "footer_subheadline": "footer CTA subtext"
}`;

    const result = await model.generateContent(copyPrompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const copyData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json({
      sourceUrl: websiteUrl,
      language,
      ...copyData
    });

  } catch (error) {
    console.error('Copy generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
export const api = onRequest({ cors: true }, app);
