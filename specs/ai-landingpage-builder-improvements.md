# AI Landing Page Builder - Improvements Specification

## Overview
This specification documents the planned improvements for the TESTIMOTION landing page builder based on user feedback and reference examples.

## Feature Requirements

### 1. Section Ordering System
**Status:** New Feature
**Priority:** High

**Description:**
- Builder sections should match template output order
- Enable drag-and-drop reordering of sections
- Persist order in localStorage/Supabase

**Reference:** N/A (UX improvement)

### 2. About/Offer Section Generalization
**Status:** Refactor
**Priority:** High

**Description:**
- Current "Process Steps" section is specific to Testimotion (4 steps)
- Transform to versatile "About Us / Services" section
- Support variable number of items (3-6)
- More flexible layouts

**Reference:** https://www.bizzabo.com/

### 3. Mini Testimonials in Hero
**Status:** Refinement
**Priority:** Medium

**Description:**
- Current design too large/bulky
- Reduce visual weight
- More subtle, elegant presentation
- Smaller avatars, compact layout

**Reference:** https://www.semflow.com

### 4. Client Logos Auto-Slider
**Status:** Enhancement
**Priority:** Medium

**Description:**
- Convert static logo row to automatic carousel
- Infinite scroll animation
- Pause on hover
- Support for more than 4 logos

**Reference:** Standard marquee pattern

### 5. Reviews Section Visual Integration
**Status:** Refinement
**Priority:** Medium

**Description:**
- Remove hard background separation
- Seamless flow with testimonial snippets
- Gradient transition instead of box

**Reference:** Design consistency

### 6. Preview Tablet/Phone Fix
**Status:** Bug Fix
**Priority:** High

**Description:**
- Viewport switching works in external preview but not inline
- Debug and fix inline preview viewport toggle

**Issue:** In-page preview doesn't respond to tablet/phone buttons

### 7. Outscraper Reviews Integration
**Status:** New Feature
**Priority:** High

**Description:**
- Fetch Google reviews via Outscraper API
- Select/filter reviews in interface
- Auto-populate review cards

**Reference:** Outscraper API integration

### 8. Reviews Slider Component
**Status:** New Feature
**Priority:** High

**Description:**
- 3/4/5 reviews side by side
- Arrow navigation (< ... >)
- Dot indicators
- Swipe on mobile
- Responsive columns (fewer on phone)

**Reference:**
- https://www.memberstack.com
- https://drive.google.com/file/d/1rkeWDMeJwJ12LhnQTcydrmt9-P_OWQqd/view

### 9. Google Reviews Widget Badge
**Status:** New Feature
**Priority:** Medium

**Description:**
- Subtle widget above reviews slider
- Google logo + rating score
- Clean, trust-building design
- Not a title, actual widget look

**Reference:** https://drive.google.com/file/d/131wm2rx2i5_IDBgG5vOuio7662NjRkAA/view

### 10. FAQ Section
**Status:** New Feature
**Priority:** High

**Description:**
- Add below testimonial snippets
- Accordion-style Q&A
- Default 5 questions:
  - 2 general info questions
  - 3 objection-handling questions
- Editable in builder

**Reference:** Standard FAQ pattern

### 11. Remove Footer Copyright
**Status:** Removal
**Priority:** Low

**Description:**
- Remove "© 2025 TESTIMOTION. Alle rechten voorbehouden."
- Keep footer but omit copyright text

**Reference:** User request

---

## Technical Architecture

### Files to Modify
1. `generator/index.html` - Builder form UI
2. `generator/app.js` - Form logic, viewport fix
3. `generator/template.js` - HTML generation
4. `generator/style.css` - Styling updates
5. `generator/defaults.js` - New default values

### New Files
1. `generator/outscraper.js` - Reviews API integration
2. `generator/slider.js` - Carousel component logic

### Dependencies
- Outscraper API key (user-provided)
- No new external libraries (vanilla JS)

---

## Implementation Priority Order

1. **Phase 1: Bug Fixes**
   - Preview viewport fix

2. **Phase 2: Core UI Improvements**
   - Section ordering
   - Mini testimonials refinement
   - Reviews section visual integration
   - Footer copyright removal

3. **Phase 3: New Components**
   - FAQ section
   - Reviews slider
   - Google Reviews widget badge
   - Client logos auto-slider

4. **Phase 4: Integrations**
   - Outscraper reviews integration

5. **Phase 5: Major Refactors**
   - About/Offer section generalization

---

## Success Criteria

- [ ] All viewport sizes work in inline preview
- [ ] Sections can be reordered via drag-and-drop
- [ ] Mini testimonials match Semflow aesthetic
- [ ] Client logos auto-scroll smoothly
- [ ] Reviews slider with navigation works
- [ ] Google Reviews widget displays rating
- [ ] FAQ accordion functional
- [ ] Outscraper integration fetches reviews
- [ ] About/Offer section is versatile
- [ ] No footer copyright text
