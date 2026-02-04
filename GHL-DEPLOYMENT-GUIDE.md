# TESTIMOTION GHL Deployment Guide

## Files Overview

| File | Purpose |
|------|---------|
| `testimotion-landing.html` | Production template with GHL tokens |
| `preview/index.html` | Local preview with placeholder images |

## Quick Start

### 1. Copy Template Code
Copy the entire contents of `testimotion-landing.html`

### 2. In GHL Dashboard
1. Go to **Sites** → **Funnels** → **+ New Funnel**
2. Choose **Blank** template
3. Add a **Custom JS/HTML** element (full-width section)
4. Paste the template code

### 3. Create Custom Values
Go to **Settings** → **Custom Values** and create:

#### Required Custom Values
| Key | Example Value |
|-----|---------------|
| `logo_url` | https://your-cdn.com/logo.png |
| `vimeo_embed_url` | https://player.vimeo.com/video/123456 |

#### Optional Custom Values (have defaults)
| Key | Default |
|-----|---------|
| `hero_headline` | Laat klanten je sales doen. |
| `hero_subheadline` | Met ons bewezen systeem... |
| `cta_button_text` | Ik wil dit systeem |
| `cta_button_secondary_text` | Laat klanten ook mijn sales doen |
| `trust_badge_count` | 35+ |
| `mini_testimonial_1` | Eindelijk een systeem dat werkt! |
| `mini_testimonial_2` | Onze omzet is verdubbeld. |
| `mini_testimonial_3` | Beste investering dit jaar. |

#### Image Custom Values
| Key | Description |
|-----|-------------|
| `trust_badge_photo_1` through `_5` | Small avatar photos |
| `review_avatar_1` through `_6` | Google review avatars |
| `video_testimonial_thumb_1` through `_3` | Video thumbnails |
| `step_image_1` through `_3` | Process step images |
| `client_logo_1` through `_4` | Client logos |

### 4. Add GHL Form
1. In the page editor, find the form placeholder section
2. Drag a **Form** element into the container
3. Configure fields: Name, Email, Phone, etc.

### 5. Publish & Test
1. Click **Publish**
2. View the live page
3. Test form submission
4. Check mobile responsiveness

## Token Syntax

GHL uses Liquid-style tokens:
```
{{ custom_values.your_key }}
{{ custom_values.your_key | default: 'fallback value' }}
```

## Conditional Hiding

The template includes JavaScript that automatically hides elements when:
- Custom value is empty
- Image fails to load
- Token isn't replaced

This prevents broken layouts when values aren't set.

## Testing Locally

```bash
cd preview
npx serve -p 3000
# Open http://localhost:3000
```

Or use:
```bash
npm run serve
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Check Custom Value URLs are correct |
| Tokens showing as text | Ensure you're viewing in GHL (not raw HTML) |
| Form not submitting | Check form is connected to workflow |
| Layout broken on mobile | Check viewport meta tag is present |
