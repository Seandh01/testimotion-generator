# TESTIMOTION HTML Generator Tool

## Summary

Built a web-based form tool that generates ready-to-paste HTML snippets for GoHighLevel (GHL), with live preview and shareable state.

## Files Created

```
generator/
├── index.html      # Main app with split-panel layout (form + preview)
├── style.css       # Dark theme styling
├── app.js          # Form logic, preview updates, HTML generation
├── template.js     # Base HTML template as JS module
└── vercel.json     # Vercel deployment config
```

## Features Implemented

### 1. Form Sections
- **Branding**: Logo URL, 4 color pickers (primary, secondary, gradient start/end)
- **Hero**: Headline, subheadline, CTA texts, button URL
- **Video**: Vimeo embed URL
- **Trust Badges**: Count text, 5 photo URLs
- **Mini Testimonials**: 3 quote texts
- **Process Steps**: Headlines, guarantee text, 3 steps (title, description, image)
- **Google Reviews**: 6 review cards (name, text, avatar URL each)
- **Video Testimonials**: Section headlines, 3 cards (name, company, thumbnail)
- **Footer CTA**: Headline, subheadline
- **Client Logos**: 4 logo URLs
- **Floating Testimonial**: Optional sidebar testimonial

### 2. Live Preview
- Split layout: Form sidebar (45%) | Preview iframe (55%)
- Real-time updates with 300ms debounce
- Preview renders actual HTML with current values

### 3. State Persistence
- All form values saved to URL query parameters
- Shareable/bookmarkable links
- Form auto-populates from URL on page load

### 4. HTML Generation
- "Generate HTML" button opens modal with full HTML code
- Token replacement for filled fields
- Unfilled fields keep GHL tokens (template JS auto-hides them)
- "Copy HTML" button for clipboard

### 5. Color Pickers
- Native `<input type="color">` synced with text inputs
- Hex color values auto-sync between picker and text field

## Architecture

**Vanilla HTML/JS** - No framework, no build step required

Key functions in `app.js`:
- `loadFromURL()` - Populate form from query params
- `saveToURL()` - Update URL when form changes
- `updatePreview()` - Refresh iframe (debounced)
- `generateHTML()` - Create final HTML with tokens replaced
- `copyToClipboard()` - Clipboard API with fallback

## Deployment

```bash
cd generator
vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy.

## Form Fields (~50 total)

| Section | Field Count |
|---------|-------------|
| Branding | 5 (1 url, 4 colors) |
| Hero | 5 |
| Video | 1 |
| Trust Badges | 6 |
| Mini Testimonials | 3 |
| Process Steps | 11 |
| Reviews | 18 (6 cards × 3 fields) |
| Video Testimonials | 11 |
| Footer | 2 |
| Client Logos | 4 |
| Floating Testimonial | 4 |

## Verification

1. Tested locally with `npx serve`
2. Verified form input updates URL
3. Verified live preview updates in real-time
4. Verified "Generate HTML" modal shows correct output with token replacement
5. Verified collapsible sections work
6. Verified color picker sync with text inputs
