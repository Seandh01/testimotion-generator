// In-memory cache for fonts data (shared across requests in same process)
let fontsCache = null;
let fontsCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PLACES_AND_FONTS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Fonts API key not configured' });
    }

    // Check in-memory cache
    const now = Date.now();
    if (fontsCache && (now - fontsCacheTime) < CACHE_TTL) {
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
      res.setHeader('X-Cache', 'HIT');
      return res.json(fontsCache);
    }

    // Fetch from Google Fonts API
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
    );

    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to minimal payload (~200KB vs ~2MB)
    const fonts = (data.items || []).map(font => ({
      family: font.family,
      category: font.category,
      variants: font.variants,
      subsets: font.subsets
    }));

    // Update in-memory cache
    fontsCache = fonts;
    fontsCacheTime = now;

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('X-Cache', 'MISS');
    res.json(fonts);

  } catch (error) {
    console.error('Fonts API error:', error);
    res.status(500).json({ error: error.message });
  }
}
