# AI Landing Page Builder Improvements - Team Execution Plan

## Objective
Implement 11 improvements to the TESTIMOTION landing page builder: section ordering, generalized about/offer section, refined mini testimonials, auto-sliding logos, reviews visual integration, preview viewport fix, Outscraper integration, reviews slider, Google badge widget, FAQ section, and footer copyright removal.

---

## Team Members

### Builder: Preview Viewport Fix
- Name: Viewport Builder
- Role: Fix tablet/phone viewport switching in inline preview
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates viewport classes are applied correctly
  - Validates preview iframe responds to size changes
  - Validates JavaScript event handlers work

### Validator: Preview Viewport Fix
- Name: Viewport Validator
- Role: Test viewport switching with Playwright
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Click desktop/tablet/mobile buttons
  - Verify iframe width changes
  - Verify visual scaling

### Builder: Section Ordering
- Name: Section Order Builder
- Role: Implement drag-and-drop section reordering in builder
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates drag handles render
  - Validates order persists in localStorage
  - Validates template output respects order

### Validator: Section Ordering
- Name: Section Order Validator
- Role: Test drag-and-drop and persistence
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Drag section to new position
  - Verify order persists on reload
  - Verify template output matches order

### Builder: Mini Testimonials Refinement
- Name: Mini Testimonials Builder
- Role: Reduce visual weight of hero mini testimonials
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates smaller avatar sizes
  - Validates compact spacing
  - Validates responsive behavior

### Validator: Mini Testimonials Refinement
- Name: Mini Testimonials Validator
- Role: Verify refined testimonial styling
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Visual comparison (smaller than before)
  - Mobile responsiveness
  - Text legibility

### Builder: Client Logos Slider
- Name: Logos Slider Builder
- Role: Convert static logos to auto-scrolling marquee
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates animation runs
  - Validates pause on hover
  - Validates infinite loop

### Validator: Client Logos Slider
- Name: Logos Slider Validator
- Role: Test marquee animation behavior
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Animation plays automatically
  - Pauses on hover
  - Loops infinitely
  - No visual glitches

### Builder: Reviews Section Integration
- Name: Reviews Integration Builder
- Role: Remove hard background separation in reviews section
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates gradient transition instead of box
  - Validates seamless flow
  - Validates on all viewports

### Validator: Reviews Section Integration
- Name: Reviews Integration Validator
- Role: Verify visual integration of reviews section
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - No hard borders/boxes
  - Smooth gradient transition
  - Consistent on mobile

### Builder: Reviews Slider Component
- Name: Reviews Slider Builder
- Role: Build reviews carousel with arrows and dots
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates arrow navigation works
  - Validates dot indicators sync
  - Validates swipe on mobile
  - Validates 3/4/5 items per view

### Validator: Reviews Slider Component
- Name: Reviews Slider Validator
- Role: Test slider navigation and responsiveness
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Click left/right arrows
  - Click dot indicators
  - Swipe gesture on mobile
  - Verify correct number visible per breakpoint

### Builder: Google Reviews Widget
- Name: Google Widget Builder
- Role: Create subtle Google rating badge above reviews
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates Google logo displays
  - Validates rating score shows
  - Validates clean widget styling

### Validator: Google Reviews Widget
- Name: Google Widget Validator
- Role: Verify widget appearance and data
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Widget visible above slider
  - Shows rating number
  - Google logo present
  - Clean, non-intrusive design

### Builder: FAQ Section
- Name: FAQ Builder
- Role: Add accordion FAQ section after testimonials
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates accordion expand/collapse
  - Validates 5 default questions
  - Validates editable in builder

### Validator: FAQ Section
- Name: FAQ Validator
- Role: Test accordion functionality
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Click question expands answer
  - Click again collapses
  - Multiple can be open or only one (based on design)
  - Mobile touch works

### Builder: Outscraper Integration
- Name: Outscraper Builder
- Role: Integrate Outscraper API for fetching Google reviews
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates API call structure
  - Validates response parsing
  - Validates review selection UI

### Validator: Outscraper Integration
- Name: Outscraper Validator
- Role: Test review fetching and selection
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Enter business name, fetch reviews
  - Select specific reviews
  - Auto-populate form fields

### Builder: About/Offer Generalization
- Name: About Section Builder
- Role: Transform Process Steps to versatile About/Services section
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates variable item count (3-6)
  - Validates flexible layouts
  - Validates all existing fields still work

### Validator: About/Offer Generalization
- Name: About Section Validator
- Role: Test versatile section configuration
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - Add/remove items
  - Change layouts
  - Verify output HTML correct

### Builder: Footer Copyright Removal
- Name: Footer Builder
- Role: Remove copyright text from footer
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates copyright removed from template
  - Validates form fields removed or hidden
  - Validates footer still renders

### Validator: Footer Copyright Removal
- Name: Footer Validator
- Role: Verify copyright is gone
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope:
  - No copyright text in output
  - Footer still has logo
  - No visual regressions

---

## Step-by-Step Tasks

### Parallel Execution Group 1 (No Blockers - Bug Fixes & Simple Changes)

1. **Fix Preview Viewport Switching**
   - Owner: Viewport Builder
   - Type: bug fix
   - Blockers: None
   - Deliverable: Fixed viewport toggle in app.js
   - Files: `generator/app.js`, `generator/style.css`

2. **Remove Footer Copyright**
   - Owner: Footer Builder
   - Type: removal
   - Blockers: None
   - Deliverable: Updated template.js without copyright
   - Files: `generator/template.js`, `generator/index.html`

3. **Refine Mini Testimonials Styling**
   - Owner: Mini Testimonials Builder
   - Type: CSS refinement
   - Blockers: None
   - Deliverable: Smaller, more subtle testimonial cards
   - Files: `generator/template.js` (inline styles), `generator/style.css`

4. **Improve Reviews Section Visual Integration**
   - Owner: Reviews Integration Builder
   - Type: CSS refinement
   - Blockers: None
   - Deliverable: Seamless gradient transition, no hard boxes
   - Files: `generator/template.js`

### Validation Group 1 (Blocked by Group 1)

5. **Validate Viewport Fix**
   - Owner: Viewport Validator
   - Type: validation + testing
   - Blockers: Task 1
   - Playwright Test Cases:
     - Click desktop button → verify full width
     - Click tablet button → verify 768px width
     - Click mobile button → verify 375px width
   - Acceptance Criteria: All viewport switches work inline

6. **Validate Footer Copyright Removal**
   - Owner: Footer Validator
   - Type: validation + testing
   - Blockers: Task 2
   - Playwright Test Cases:
     - Generate template → no copyright text
     - Footer logo still visible
   - Acceptance Criteria: Copyright gone, footer intact

7. **Validate Mini Testimonials**
   - Owner: Mini Testimonials Validator
   - Type: validation + testing
   - Blockers: Task 3
   - Playwright Test Cases:
     - Visual size comparison
     - Mobile responsive check
   - Acceptance Criteria: Smaller, elegant design

8. **Validate Reviews Integration**
   - Owner: Reviews Integration Validator
   - Type: validation + testing
   - Blockers: Task 4
   - Playwright Test Cases:
     - No hard box borders
     - Gradient visible
   - Acceptance Criteria: Seamless visual flow

### Parallel Execution Group 2 (After Validation Group 1)

9. **Build Client Logos Auto-Slider**
   - Owner: Logos Slider Builder
   - Type: new component
   - Blockers: Tasks 5-8 (all Phase 1 validations)
   - Deliverable: Marquee animation for logos
   - Files: `generator/template.js`

10. **Build Reviews Slider Component**
    - Owner: Reviews Slider Builder
    - Type: new component
    - Blockers: Tasks 5-8
    - Deliverable: Carousel with arrows, dots, swipe
    - Files: `generator/template.js`, `generator/app.js`

11. **Build Google Reviews Widget Badge**
    - Owner: Google Widget Builder
    - Type: new component
    - Blockers: Tasks 5-8
    - Deliverable: Rating badge above reviews
    - Files: `generator/template.js`, `generator/index.html`

12. **Build FAQ Section**
    - Owner: FAQ Builder
    - Type: new component
    - Blockers: Tasks 5-8
    - Deliverable: Accordion FAQ with 5 default questions
    - Files: `generator/template.js`, `generator/index.html`, `generator/defaults.js`

### Validation Group 2 (Blocked by Group 2)

13. **Validate Logos Slider**
    - Owner: Logos Slider Validator
    - Type: validation + testing
    - Blockers: Task 9
    - Playwright Test Cases:
      - Animation runs automatically
      - Pauses on hover
      - Infinite loop
    - Acceptance Criteria: Smooth marquee effect

14. **Validate Reviews Slider**
    - Owner: Reviews Slider Validator
    - Type: validation + testing
    - Blockers: Task 10
    - Playwright Test Cases:
      - Arrow navigation
      - Dot indicators
      - Swipe on mobile viewport
    - Acceptance Criteria: All navigation works

15. **Validate Google Widget**
    - Owner: Google Widget Validator
    - Type: validation + testing
    - Blockers: Task 11
    - Playwright Test Cases:
      - Widget visible
      - Rating displayed
      - Google logo shown
    - Acceptance Criteria: Clean trust widget

16. **Validate FAQ Section**
    - Owner: FAQ Validator
    - Type: validation + testing
    - Blockers: Task 12
    - Playwright Test Cases:
      - Accordion expand/collapse
      - Multiple questions work
      - Mobile touch
    - Acceptance Criteria: Functional accordion

### Parallel Execution Group 3 (Complex Features)

17. **Implement Section Ordering**
    - Owner: Section Order Builder
    - Type: new feature
    - Blockers: Tasks 13-16 (all Phase 2 validations)
    - Deliverable: Drag-and-drop section reordering
    - Files: `generator/index.html`, `generator/app.js`, `generator/template.js`

18. **Implement Outscraper Integration**
    - Owner: Outscraper Builder
    - Type: integration
    - Blockers: Tasks 13-16
    - Deliverable: Fetch and select Google reviews
    - Files: `generator/outscraper.js` (new), `generator/index.html`, `generator/app.js`

19. **Generalize About/Offer Section**
    - Owner: About Section Builder
    - Type: refactor
    - Blockers: Tasks 13-16
    - Deliverable: Versatile services section with variable items
    - Files: `generator/template.js`, `generator/index.html`, `generator/defaults.js`

### Validation Group 3 (Final)

20. **Validate Section Ordering**
    - Owner: Section Order Validator
    - Type: validation + testing
    - Blockers: Task 17
    - Playwright Test Cases:
      - Drag section to new position
      - Order persists on reload
      - Template output matches order
    - Acceptance Criteria: Reordering fully functional

21. **Validate Outscraper Integration**
    - Owner: Outscraper Validator
    - Type: validation + testing
    - Blockers: Task 18
    - Playwright Test Cases:
      - Enter business, fetch reviews
      - Select reviews
      - Fields auto-populate
    - Acceptance Criteria: End-to-end review import works

22. **Validate About Section**
    - Owner: About Section Validator
    - Type: validation + testing
    - Blockers: Task 19
    - Playwright Test Cases:
      - Add/remove items
      - Different layouts work
      - Output HTML correct
    - Acceptance Criteria: Flexible section configuration

### Final Integration

23. **Full Integration Test**
    - Owner: Integration Tester
    - Type: end-to-end validation
    - Blockers: Tasks 20-22
    - Playwright Test Cases:
      - Complete user workflow
      - All sections render correctly
      - All interactive features work
      - Preview accurate
      - Version save/load works
    - Acceptance Criteria: All E2E tests pass

---

## Task Dependencies Diagram

```
Group 1 (Parallel):
[1] Viewport Fix    [2] Footer Remove    [3] Mini Testimonials    [4] Reviews Integration
       ↓                   ↓                      ↓                        ↓

Group 1 Validation (Parallel):
[5] Validate VP     [6] Validate Footer  [7] Validate Mini       [8] Validate Reviews
       ↓                   ↓                      ↓                        ↓
       └───────────────────┴──────────────────────┴────────────────────────┘
                                      ↓

Group 2 (Parallel):
[9] Logo Slider    [10] Reviews Slider    [11] Google Widget    [12] FAQ Section
       ↓                   ↓                      ↓                     ↓

Group 2 Validation (Parallel):
[13] Validate Logo  [14] Validate Slider  [15] Validate Widget  [16] Validate FAQ
       ↓                   ↓                      ↓                     ↓
       └───────────────────┴──────────────────────┴─────────────────────┘
                                      ↓

Group 3 (Parallel):
[17] Section Order      [18] Outscraper         [19] About Section
       ↓                       ↓                        ↓

Group 3 Validation (Parallel):
[20] Validate Order    [21] Validate Outscraper  [22] Validate About
       ↓                       ↓                        ↓
       └───────────────────────┴────────────────────────┘
                               ↓

[23] Full Integration Test
```

---

## Team Orchestration

Each agent will use Claude Code's task system tools:

### Task Management Tools
- **TaskCreate**: Create new task in the queue
- **TaskUpdate**: Update task status when work completes
- **TaskList**: View all pending and completed tasks
- **TaskGet**: Retrieve details about specific task

### Execution Flow

1. **Creation Phase**: Builders execute their assigned tasks
   - Each builder creates/implements their component
   - Builders run self-validation
   - Builders report completion via TaskUpdate

2. **Validation Phase**: Validators execute Playwright tests
   - Validators receive notification when builder completes
   - Validators run full test suite
   - Validators report results via TaskUpdate

3. **Unblocking**: Task system automatically unblocks dependent tasks

4. **Communication**: Agents communicate through task system

---

## Self-Validation Requirements

### Builder Self-Validation (post_tool_use hook)

Each builder must validate:
1. Files exist in correct locations
2. Syntax is valid (no JS errors)
3. Required functions/elements present
4. Integrates with existing code

### Validator Playwright Testing

Each validator runs:
1. Functional tests (does it work?)
2. Visual tests (does it look right?)
3. Responsive tests (does it work on mobile?)
4. Integration tests (does it work with other components?)

---

## Estimated Timeline

- **Group 1 Parallel builds**: ~10 minutes
- **Group 1 Validation**: ~5 minutes
- **Group 2 Parallel builds**: ~15 minutes
- **Group 2 Validation**: ~8 minutes
- **Group 3 Parallel builds**: ~20 minutes
- **Group 3 Validation**: ~10 minutes
- **Integration test**: ~5 minutes

**Total: ~75 minutes** (vs ~4+ hours sequential)

---

## Task Status Dashboard

```
Phase 1 - Bug Fixes & Simple Changes:
Task 1:  Fix Viewport ...................... ○ PENDING
Task 2:  Remove Copyright .................. ○ PENDING
Task 3:  Mini Testimonials ................. ○ PENDING
Task 4:  Reviews Integration ............... ○ PENDING
Task 5:  Validate Viewport ................. ○ BLOCKED (1)
Task 6:  Validate Copyright ................ ○ BLOCKED (2)
Task 7:  Validate Mini Testimonials ........ ○ BLOCKED (3)
Task 8:  Validate Reviews Integration ...... ○ BLOCKED (4)

Phase 2 - New Components:
Task 9:  Logo Slider ...................... ○ BLOCKED (5-8)
Task 10: Reviews Slider ................... ○ BLOCKED (5-8)
Task 11: Google Widget .................... ○ BLOCKED (5-8)
Task 12: FAQ Section ...................... ○ BLOCKED (5-8)
Task 13: Validate Logo Slider ............. ○ BLOCKED (9)
Task 14: Validate Reviews Slider .......... ○ BLOCKED (10)
Task 15: Validate Google Widget ........... ○ BLOCKED (11)
Task 16: Validate FAQ Section ............. ○ BLOCKED (12)

Phase 3 - Complex Features:
Task 17: Section Ordering ................. ○ BLOCKED (13-16)
Task 18: Outscraper Integration ........... ○ BLOCKED (13-16)
Task 19: About Section Generalization ..... ○ BLOCKED (13-16)
Task 20: Validate Section Ordering ........ ○ BLOCKED (17)
Task 21: Validate Outscraper .............. ○ BLOCKED (18)
Task 22: Validate About Section ........... ○ BLOCKED (19)

Final:
Task 23: Full Integration Test ............ ○ BLOCKED (20-22)

Overall Status: ○ READY TO START
```

---

## Files Summary

### Files to Modify
| File | Changes |
|------|---------|
| `generator/app.js` | Viewport fix, section ordering, Outscraper UI |
| `generator/template.js` | All template changes (slider, FAQ, widget, etc.) |
| `generator/index.html` | New form sections (FAQ, Outscraper, reordering) |
| `generator/style.css` | Mini testimonials, responsive fixes |
| `generator/defaults.js` | FAQ defaults, new section defaults |

### New Files
| File | Purpose |
|------|---------|
| `generator/outscraper.js` | Outscraper API integration |

### Test Files (to create)
| File | Purpose |
|------|---------|
| `tests/viewport.spec.js` | Viewport switching tests |
| `tests/slider.spec.js` | Reviews slider tests |
| `tests/faq.spec.js` | FAQ accordion tests |
| `tests/ordering.spec.js` | Section ordering tests |
| `tests/integration.spec.js` | Full E2E tests |

---

## Success Criteria

The entire plan is complete when:

1. ✓ All viewport sizes work in inline preview
2. ✓ Sections can be reordered via drag-and-drop
3. ✓ Mini testimonials match Semflow aesthetic (smaller, subtle)
4. ✓ Client logos auto-scroll in marquee
5. ✓ Reviews section flows seamlessly (no hard box)
6. ✓ Reviews slider with arrows and dots works
7. ✓ Google Reviews widget shows rating badge
8. ✓ FAQ accordion fully functional
9. ✓ Outscraper fetches and populates reviews
10. ✓ About/Offer section is versatile (3-6 items)
11. ✓ Footer copyright removed
12. ✓ All Playwright tests pass

---

## Notes for Implementation

- Reference designs linked in original requirements
- Each agent focuses on single responsibility
- Parallelization maximizes efficiency
- Playwright tests prevent regressions
- Self-validation catches issues early
- Task system handles all coordination
