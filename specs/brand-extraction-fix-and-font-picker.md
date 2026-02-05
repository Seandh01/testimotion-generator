# Brand Extraction Fix + Google Fonts Picker

## Date: 2026-02-05

## Summary
Fixed brand extraction (which never worked - only parsed HTML with regex and always returned `system-ui` for fonts) and added a Google Fonts picker with weight selection.

## Phase 1: Brand Extraction Fix

### Problem
- `api/extract-brand.js` only fetched HTML and used regex to find colors in CSS
- Never took screenshots, so visual analysis was impossible
- Always returned `system-ui, sans-serif` for fonts
- Used old `@google/generative-ai` SDK

### Solution
- **ScreenshotOne API** captures real JPEG screenshots with `block_cookie_banners`, `block_ads`, `block_chats` enabled
- **Gemini 2.0 Flash Vision** analyzes the screenshot with structured JSON schema (enforced output)
- Signed URLs via HMAC-SHA256 for ScreenshotOne security
- Logo extraction via quick HTML fetch (best-effort)

### SDK Migration
- `@google/generative-ai` (old) -> `@google/genai` (new)
- New API pattern: `ai.models.generateContent({ model, contents, config })`
- `response.text` (getter property, not method)
- `Type.OBJECT` / `Type.STRING` for structured schemas
- Applied to: `api/extract-brand.js`, `api/generate-copy.js`, `copywriting-generator.js`

## Phase 2: Google Fonts Picker

### New Files
- `api/fonts.js` - Google Fonts API proxy (24h cache, minimal payload ~200KB)
- `font-picker.js` - FontPicker class with:
  - Dropdown with search/filter (debounced 150ms)
  - Lazy-load font CSS on hover/scroll
  - Keyboard navigation (arrows, Enter, Escape)
  - Click outside to close
  - localStorage cache for font list (24h expiry)
  - Max 50 items rendered at once
  - Weight selector integration

### Weight Selectors
- Added pill-style weight buttons after heading/body font inputs
- Weights: 300 (Light), 400 (Regular), 600 (Semi), 700 (Bold), 900 (Black)
- Unavailable weights are grayed out based on font's available variants
- Selected weights flow through to Google Fonts `<link>` in generated HTML

## Files Modified

| File | Change |
|------|--------|
| `generator/package.json` | `@google/generative-ai` -> `@google/genai` |
| `generator/api/extract-brand.js` | Complete rewrite (ScreenshotOne + Gemini Vision) |
| `generator/api/generate-copy.js` | SDK migration |
| `generator/copywriting-generator.js` | SDK migration (lazy init) |
| `generator/server.js` | Removed brand-extractor.js import, added fonts route |
| `generator/app.js` | Added font-picker import + init |
| `generator/index.html` | Added weight selector HTML, autocomplete=off on font inputs |
| `generator/style.css` | Added font picker + weight selector styles |
| `generator/template.js` | Updated Google Fonts link with weight params |

## Files Created

| File | Purpose |
|------|---------|
| `generator/api/fonts.js` | Google Fonts API proxy |
| `generator/font-picker.js` | Font picker component |

## Files Deleted

| File | Reason |
|------|--------|
| `generator/brand-extractor.js` | Dead code (Playwright-based, never ran on Vercel) |

## Environment Variables Used
- `GEMINI_API_KEY` - Gemini AI
- `SCREENSHOTONE_ACCESS_KEY` - Screenshot capture
- `SCREENSHOTONE_SECRET_KEY` - Signed URL generation
- `PLACES_AND_FONTS_API_KEY` - Google Fonts API
