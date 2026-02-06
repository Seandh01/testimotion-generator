# Brand Extractor Redesign - Implementation Summary

**Date**: 2025-02-05
**File Modified**: `generator/api/extract-brand.js` (302 lines → 921 lines)

## Objectives Achieved

### 1. Logo Detection Improvements
- **Third-party blocklist**: Added comprehensive blocklist of 30+ third-party domains (Google, Facebook, Twitter, analytics services, etc.)
- **Neutral CDN handling**: Added whitelist for neutral CDNs (ctfassets.net, imgix.net, cloudinary.com) that can host any site's content
- **Multi-source scoring system**: Logos are now scored from 5 sources:
  - Favicon/apple-touch-icon (score: 50-70)
  - First `<img>` in header/nav with "logo" attribute (score: 95+) - takes ONLY first match
  - Header SVGs converted to data URI (score: 80)
  - og:image meta tag (score: 40-45)
  - Any `<img>` with "logo" - strict domain validation (score: 35)
- **Known brand filter**: Blocks images containing other brand names (Figma, Slack, Dropbox, etc.) to prevent partner logos
- **Domain bonus**: +5 points for same-domain logos

### 2. HTML-First Color Extraction (NEW)
Added `extractColorsFromHtml()` function with 4 strategies:
1. **CSS Custom Properties** (confidence 0.9): `--primary`, `--brand`, `--accent`, etc.
2. **`<meta name="theme-color">`** (confidence 0.85): Direct brand declaration
3. **Button/CTA inline styles** (confidence 0.7): Background colors from buttons
4. **CSS class declarations** (confidence 0.75): `.btn-primary`, `.cta` styles

### 3. Improved Gemini Prompt
- Now includes target domain name for context
- Explicit instructions on WHERE to look (nav bar, logo, CTAs)
- Explicit instructions on what to IGNORE (third-party widgets, partner logos)
- Added confidence reporting (high/medium/low)

### 4. Cross-Validation & Smart Fallbacks
New `resolveColors()` function with priority chain:
1. HTML-extracted color (deterministic, highest trust)
2. Gemini color (AI-based, good but non-deterministic)
3. Derived color using color theory (30° hue shift for analogous harmony)
4. Default fallback (only if nothing else works)

### 5. Color Theory Helpers
- `hexToHsl()` / `hslToHex()` - HSL conversions
- `deriveComplementary()` - Creates analogous color by shifting hue 30°
- `colorsAreSimilar()` - Checks if two colors are within 40° hue range
- `normalizeHex()` - Handles #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba()

### 6. Parallelized Fetch Flow
HTML fetch and screenshot capture now run concurrently using `Promise.allSettled()`, saving 2-5 seconds per extraction.

### 7. Font Improvements
- Skip CSS variable references (e.g., `var(--font-monospace)`)
- Skip generic font families

## Test Results

| Site | Logo | Primary Color | Notes |
|------|------|---------------|-------|
| stripe.com | ✅ SVG data URI | ✅ #673AB7 (purple) | SVG detection working |
| shopify.com | ✅ cdn.shopify.com | ✅ #55a630 (green) | Domain validation working |
| vercel.com | ✅ vercel.com domain | ⚠️ Fallback | Fonts detected: Inter |
| linear.app | ⚠️ null | ✅ #2091FF (blue) | Inline SVG not captured |
| claude.ai | ⚠️ null | ⚠️ Fallback | Site uses inline SVG |

## Known Limitations

1. **Inline SVGs without wrapper**: Some sites (Claude, Linear) embed SVGs directly without a containing element with "logo" in attributes - these may not be detected
2. **Gemini rate limits**: Frequent testing triggers 429 errors
3. **Color accuracy**: Still depends on Gemini for sites without CSS variables

## API Response Shape (Unchanged)
```json
{
  "sourceUrl": "https://example.com",
  "colors": {
    "primary": "#RRGGBB",
    "secondary": "#RRGGBB",
    "background": "#RRGGBB",
    "backgroundAlt": "#RRGGBB"
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name"
  },
  "logo": "URL or data:image/svg+xml;base64,..."
}
```

## Files Changed

| File | Change |
|------|--------|
| `generator/api/extract-brand.js` | Complete rewrite with all improvements |

No changes to frontend files - response contract unchanged.
