# TESTIMOTION Landing Page - GHL HTML Template Spec

## Overview
Single-file HTML template for TESTIMOTION landing page, ready for GoHighLevel Custom HTML integration.

## File Created
- `/Users/mac_sean_ai/Documents/Privado/THMotion GHL Landing/testimotion-landing.html`

## Technical Stack
- **CSS Framework:** Tailwind CSS via CDN
- **Template Syntax:** GHL Custom Values (`{{ custom_values.* }}`)
- **Dependencies:** None (single-file, self-contained)

## Template Statistics
- **Lines:** 575
- **GHL Tokens:** 81 custom value placeholders
- **Form Containers:** 2 (Hero + Footer)

## Sections Implemented

| # | Section | Features |
|---|---------|----------|
| 1 | Hero | Logo, mini testimonials (3), headline, subheadline, CTA, trust badges, form container |
| 2 | Video + Logos | Vimeo iframe, social proof text, client logos row (4) |
| 3 | Process Steps | 3-column grid with numbered cards, floating testimonial, CTA, guarantee |
| 4 | Reviews | Trust header, Google review cards (3), video testimonial grid (3) |
| 5 | Footer CTA | Final headline, CTA, trust badges, secondary form container |
| 6 | Footer | Logo, copyright |

## GHL Custom Values Tokenization

### CSS Variables (Color Theming)
```
{{ custom_values.brand_primary_color }}     - Primary yellow (#ffcc03)
{{ custom_values.brand_secondary_color }}   - Teal accent (#0b9a9a)
{{ custom_values.bg_gradient_start }}       - Gradient start (#0a2e1f)
{{ custom_values.bg_gradient_end }}         - Gradient end (#030a07)
```

### Images (31 tokens)
| Token | Purpose |
|-------|---------|
| `logo_url` | Main logo |
| `testimonial_photo_1-4` | Testimonial profile photos |
| `trust_badge_photo_1-5` | Trust badge avatar stack |
| `client_logo_1-4` | Client logos |
| `step_image_1-3` | Process step images |
| `review_avatar_1-3` | Google review avatars |
| `video_testimonial_thumb_1-3` | Video testimonial thumbnails |

### Text Content (40+ tokens)
| Token | Default Value |
|-------|---------------|
| `hero_headline` | "Laat klanten je sales doen." |
| `hero_subheadline` | System description |
| `cta_button_text` | "Ik wil dit systeem" |
| `cta_button_url` | "#form" |
| `video_social_proof` | Social proof statement |
| `process_headline` | "Hoe wij in 4 stappen..." |
| `step_1_title`, `step_1_description` | Proof Capture |
| `step_2_title`, `step_2_description` | Proof Story Build |
| `step_3_title`, `step_3_description` | Proof Page |
| `testimonial_quote`, `testimonial_name`, `testimonial_company` | Floating testimonial |
| `guarantee_text` | Guarantee statement |
| `reviews_headline`, `reviews_subheadline` | Reviews section headers |
| `review_name_1-3`, `review_text_1-3` | Google review content |
| `video_testimonial_name_1-3`, `video_testimonial_company_1-3` | Video testimonial labels |
| `footer_headline`, `footer_subheadline` | Final CTA content |
| `trust_badge_count` | "35+" |
| `current_year` | "2025" |

### Video Embed
```
{{ custom_values.vimeo_embed_url }}  - Vimeo iframe src
```

## Form Integration
Two form containers with comment markers:
```html
<!-- GHL_FORM_EMBED: Drag and drop a GHL form element here in the builder -->
```

Locations:
1. After Hero CTA button (primary)
2. Footer section (secondary)

## Responsive Design

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, stacked layout |
| Tablet | 640-1024px | 2-column where appropriate |
| Desktop | > 1024px | Full 3-column layout, floating testimonial visible |

## Color Scheme
- **Primary:** Yellow (#ffcc03) - CTAs, stars, step numbers
- **Secondary:** Teal (#0b9a9a)
- **Background:** Dark gradient (green-black)
- **Text:** White on dark, black on light cards
- **Cards:** White with shadows

## Key CSS Classes
```css
.brand-primary        - Primary color text
.bg-brand-primary     - Primary color background
.bg-gradient-dark     - Dark gradient background
.testimonial-card     - Glass-morphism card style
.google-review-card   - White review card
.step-number          - Yellow numbered circle
.play-button          - Video play button
.floating-testimonial - Positioned testimonial (desktop only)
```

## Usage Instructions

1. Copy entire HTML content
2. Paste into GHL Custom HTML element
3. Configure Custom Values in GHL settings
4. Drag GHL form elements into form containers
5. Publish page

## Verification Checklist
- [x] All 81 GHL custom value tokens present
- [x] 2 form container placeholders
- [x] Tailwind CSS CDN included
- [x] Responsive breakpoints configured
- [x] Default values provided for all tokens
- [x] Semantic HTML structure
- [x] Accessibility basics (alt tags, semantic elements)
