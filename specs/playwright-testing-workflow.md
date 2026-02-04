# TESTIMOTION Landing Page - Playwright Testing Workflow

## Summary

Implemented a complete visual regression testing workflow for the TESTIMOTION GHL landing page template, enabling preview and iteration until the HTML matches the SVG design 1:1.

## Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `package.json` | NPM configuration with Playwright and utility scripts |
| `playwright.config.ts` | Playwright test configuration (1440px viewport, visual testing settings) |
| `tests/extract-images.js` | Script to extract 50 base64 images from SVG to PNG files |
| `tests/create-placeholders.js` | Script to create SVG placeholder images for fallbacks |
| `tests/visual.spec.ts` | Playwright visual regression tests (12 tests) |
| `preview/index.html` | Preview HTML with hardcoded mock data (not GHL tokens) |
| `preview/assets/*.png/jpg` | 50 extracted images from SVG |
| `preview/assets/placeholders/*.svg` | 4 placeholder images (logo, avatar, thumbnail, step) |
| `tests/visual.spec.ts-snapshots/*.png` | 11 baseline screenshots for visual comparison |

### Modified Files

| File | Changes |
|------|---------|
| `testimotion-landing.html` | Added `data-ghl-token` and `data-ghl-container` attributes, plus conditional hiding JavaScript |

## Features Implemented

### 1. Image Extraction from SVG
- Extracts all embedded base64 PNG/JPG images from the master SVG template
- Saves to `preview/assets/` with sequential naming
- Creates `image-mapping.json` for reference

### 2. Preview HTML with Mock Data
- Replaces all `{{ custom_values.* }}` tokens with actual values
- Uses extracted images from SVG
- Maintains identical structure to production template
- Includes form embed placeholders

### 3. Conditional Hiding JavaScript (Pro Feature A)
```javascript
// Hides containers when Custom Values are empty
document.querySelectorAll('[data-ghl-token]').forEach(el => {
  if (src.includes('{{') || !src) {
    el.closest('[data-ghl-container]').style.display = 'none';
  }
});
```

### 4. Image Error Fallback Handler (Pro Feature C)
```javascript
// Falls back to placeholder on 404 or hides container
img.addEventListener('error', function() {
  container.style.display = 'none';
});
```

### 5. Placeholder Images
- `placeholder-logo.svg` - Generic logo placeholder
- `placeholder-avatar.svg` - Generic person avatar
- `placeholder-thumbnail.svg` - Video thumbnail with play button
- `placeholder-step.svg` - Step image placeholder

### 6. Playwright Visual Tests
- **Full page test** - 1440x4875px full landing page
- **Section tests** - Hero, Process Steps, Reviews, Footer CTA
- **Responsive tests** - Mobile (375px), Tablet (768px)
- **Component tests** - CTA button, testimonial card, review card, step card
- **Conditional hiding test** - Verifies JS works correctly

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run extract-images` | `node tests/extract-images.js` | Extract images from SVG |
| `npm run create-placeholders` | `node tests/create-placeholders.js` | Create placeholder images |
| `npm test` | `npx playwright test` | Run all visual tests |
| `npm run test:update` | `npx playwright test --update-snapshots` | Update baseline screenshots |
| `npm run test:ui` | `npx playwright test --ui` | Run with Playwright UI |
| `npm run test:report` | `npx playwright show-report` | View HTML test report |
| `npm run test:debug` | `npx playwright test --debug` | Run in debug mode |
| `npm run preview` | `open preview/index.html` | Open preview in browser |

## Iteration Workflow

```bash
# 1. Make changes to preview/index.html
# 2. Run tests
npm test

# 3. View diff report
npm run test:report

# 4. Repeat until pixel diff ≈ 0

# 5. When satisfied, update baselines
npm run test:update
```

## Color Palette (from SVG)

| Color | Hex | CSS Variable |
|-------|-----|--------------|
| Primary Yellow | `#ffcc03` | `--brand-primary` |
| Teal | `#0b9a9a` | `--brand-secondary` |
| Dark Gradient Start | `#0a2e1f` | `--bg-gradient-start` |
| Dark Gradient End | `#030a07` | `--bg-gradient-end` |

## Image Mapping (Key Assets)

| Image | File | Usage |
|-------|------|-------|
| TESTIMOTION Logo | `image-021.png` | Header, Footer |
| Client Logos Row | `image-027.png` | Logos section |
| Avatar 1 (woman) | `image-023.jpg` | Testimonials |
| Avatar 2 (man) | `image-024.jpg` | Testimonials |
| Avatar 3 (woman) | `image-025.jpg` | Testimonials |
| Avatar 4 (man) | `image-026.jpg` | Testimonials |
| Avatar 5 (man) | `image-032.png` | Jan Willem Addink |
| Step Screenshot 1 | `image-030.png` | Proof Capture |
| Step Screenshot 2 | `image-031.png` | Proof Story Build |
| Step Screenshot 3 | `image-022.png` | Proof Page |
| Video Thumb 1 | `image-042.png` | Video testimonial |
| Video Thumb 2 | `image-043.png` | Video testimonial |
| Video Thumb 3 | `image-044.png` | Video testimonial |

## Verification

1. **Image Extraction**: 50 images extracted to `preview/assets/`
2. **Preview Renders**: Open `preview/index.html` - fully styled page
3. **Playwright Works**: All 12 tests pass
4. **Conditional Hiding**: Added to production template

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.58.1"
  }
}
```

## Next Steps

1. Compare `preview/index.html` screenshots to SVG design
2. Iterate on CSS/layout until 1:1 match
3. Backport any CSS improvements to `testimotion-landing.html`
4. Test conditional hiding in GHL with empty Custom Values
