import { GoogleGenAI } from '@google/genai';
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { websiteUrl, prompt, language = 'nl' } = req.body;

    if (!websiteUrl || !prompt) {
      return res.status(400).json({ error: 'Website URL and prompt are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
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

    const ai = new GoogleGenAI({ apiKey });
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: copyPrompt
    });

    const text = response.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const copyData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json({
      sourceUrl: websiteUrl,
      language,
      ...copyData
    });

  } catch (error) {
    console.error('Copy generation error:', error);
    res.status(500).json({ error: friendlyError(error) });
  }
}
