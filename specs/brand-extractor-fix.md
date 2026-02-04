# Brand Extractor Fix - Secondary Color Extraction

## Problem Solved
The brand extractor was picking wrong secondary colors from websites. Testing with `denhartogsoftware.nl`:
- **Before**: Primary #309FD6 (correct), Secondary #00A544 (WRONG - Tailwind utility green)
- **After**: Primary #309FD6, Secondary #F40A14 (correct - from `--secondary` CSS variable)

## Root Cause
1. The algorithm extracted ALL hex colors from CSS (including Tailwind utility colors)
2. CSS `:root` variables like `--secondary` weren't explicitly searched for
3. Generic hex colors had too high weight (50) compared to intentional brand definitions
4. SVG logos were sent to Gemini Vision which doesn't support them

## Changes Made

### File: `generator/brand-extractor.js`

#### 1. Added `:root` CSS Variable Extraction (Highest Priority)
- New patterns to search specifically in `:root { }` blocks:
  - `--primary`, `--color-primary`, `--primary-color`
  - `--secondary`, `--color-secondary`, `--secondary-color`
  - `--accent`, `--color-accent`, `--accent-color`
- Weight: 150 (higher than generic brand vars at 95, but lower than theme-color at 1000)

#### 2. Lowered Generic Hex Color Weight
- External CSS hex colors: 50 → 30
- Inline CSS hex colors: 30 → 20
- This prevents Tailwind utility colors from outranking intentional brand definitions

#### 3. SVG Filtering for Gemini Vision
- Added filter to skip `.svg` URLs before sending to Gemini
- Prevents "unsupported MIME type" errors

## Weight Hierarchy (After Fix)
| Source | Weight | Priority |
|--------|--------|----------|
| `theme-color` meta | 1000 | Highest |
| `tile-color` meta | 500 | |
| Header/nav inline styles | 200 | |
| `:root` CSS variables | 150 | **NEW** |
| Brand CSS vars (anywhere) | 95 | |
| Button backgrounds | 80 | |
| Link colors | 70 | |
| External CSS hex | 30 | Lowered |
| Inline CSS hex | 20 | Lowered |

## Verification
Run brand extraction on `https://denhartogsoftware.nl`:
1. Primary should be #309FD6 (blue)
2. Secondary should be #F40A14 (red from `--secondary`)
3. SVG logos should be skipped in console output
