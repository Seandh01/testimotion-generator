import { GoogleGenAI } from '@google/genai';
import * as cheerio from 'cheerio';

// Lazy-init to avoid crash before dotenv loads
let ai = null;
function getAI() {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

/**
 * Generate landing page copy using Gemini AI
 * Extracts business context from website and generates all text fields
 * @param {string} websiteUrl - URL to analyze
 * @param {string} userPrompt - User's business description
 * @param {string} language - Output language: 'nl' (Dutch) or 'en' (English)
 */
export async function generateLandingPageCopy(websiteUrl, userPrompt, language = 'nl') {
  console.log('Starting copy generation for:', websiteUrl, 'in language:', language);

  // 1. Fetch and analyze the website
  const businessContext = await extractBusinessContext(websiteUrl);
  console.log('Business context extracted:', businessContext.businessName);

  // 2. Generate copy using Gemini
  const copy = await generateCopyWithGemini(businessContext, userPrompt, language);

  return {
    ...copy,
    sourceUrl: websiteUrl
  };
}

/**
 * Extract business context from a website
 */
async function extractBusinessContext(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract various pieces of business context
  const context = {
    businessName: '',
    tagline: '',
    description: '',
    services: [],
    benefits: [],
    testimonials: [],
    rawText: ''
  };

  // Get business name from title or logo alt
  context.businessName = $('title').text().split('|')[0].split('-')[0].trim() ||
                         $('meta[property="og:site_name"]').attr('content') ||
                         $('img.logo, .logo img, header img').first().attr('alt') || '';

  // Get description from meta tags
  context.tagline = $('meta[property="og:title"]').attr('content') || '';
  context.description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';

  // Extract headings (often contain key benefits/services)
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 200) {
      context.services.push(text);
    }
  });

  // Extract any testimonial-like content
  $('.testimonial, .review, [class*="testimonial"], [class*="review"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20 && text.length < 500) {
      context.testimonials.push(text);
    }
  });

  // Extract main content for additional context (limit length)
  const mainContent = $('main, article, .content, #content').first().text() ||
                     $('body').text();
  context.rawText = mainContent.replace(/\s+/g, ' ').trim().slice(0, 3000);

  return context;
}

/**
 * Generate copy using Gemini
 */
async function generateCopyWithGemini(businessContext, userPrompt, language = 'nl') {
  const ai = getAI();

  const langConfig = {
    nl: {
      name: 'Dutch (Nederlands)',
      instruction: 'Written in conversational Dutch'
    },
    en: {
      name: 'English',
      instruction: 'Written in conversational English'
    }
  };

  const lang = langConfig[language] || langConfig.nl;

  const systemPrompt = `You are an expert copywriter specializing in high-converting landing pages.
You write persuasive, benefit-focused copy that builds trust and drives action.

Business Information:
- Business Name: ${businessContext.businessName}
- Tagline: ${businessContext.tagline}
- Description: ${businessContext.description}
- Key Services/Features: ${businessContext.services.slice(0, 5).join('; ')}
- Sample Testimonials: ${businessContext.testimonials.slice(0, 2).join(' | ')}

User's Description of their business/offer:
${userPrompt}

Generate landing page copy in ${lang.name} for a video testimonial service that helps this business collect and showcase customer success stories.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "hero_headline": "A powerful headline that speaks to the transformation (max 10 words)",
  "hero_subheadline": "Supporting text explaining the value proposition (max 30 words)",
  "cta_button_text": "Primary call-to-action button text (2-4 words)",
  "cta_button_secondary_text": "Secondary CTA for process section (3-5 words)",
  "mini_testimonial_1": "Short praise quote (max 8 words)",
  "mini_testimonial_2": "Short praise quote (max 8 words)",
  "mini_testimonial_3": "Short praise quote (max 8 words)",
  "process_headline": "Headline for the how-it-works section (max 15 words)",
  "step_1_title": "Step 1 name (2-3 words)",
  "step_1_description": "Step 1 explanation (max 25 words)",
  "step_2_title": "Step 2 name (2-3 words)",
  "step_2_description": "Step 2 explanation (max 25 words)",
  "step_3_title": "Step 3 name (2-3 words)",
  "step_3_description": "Step 3 explanation (max 25 words)",
  "guarantee_text": "Risk-reversal guarantee statement (max 15 words)",
  "reviews_headline": "Section headline for video testimonials (max 12 words)",
  "reviews_subheadline": "Supporting text for testimonials section (max 15 words)",
  "footer_headline": "Final CTA headline (max 12 words)",
  "footer_subheadline": "Final supporting text to encourage action (max 25 words)"
}

Make the copy:
- Benefit-focused, not feature-focused
- Emotionally compelling
- Specific to the business's industry/niche
- ${lang.instruction}
- Focused on how video testimonials will help THEIR customers trust them`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: systemPrompt
  });
  const text = result.text.trim();

  // Clean up any markdown formatting
  const cleanedText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    const copy = JSON.parse(cleanedText);

    // Validate required fields exist
    const requiredFields = [
      'hero_headline', 'hero_subheadline', 'cta_button_text',
      'process_headline', 'footer_headline', 'footer_subheadline'
    ];

    for (const field of requiredFields) {
      if (!copy[field]) {
        console.warn(`Missing field in generated copy: ${field}`);
      }
    }

    return copy;
  } catch (err) {
    console.error('Failed to parse Gemini response:', cleanedText);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export default generateLandingPageCopy;
