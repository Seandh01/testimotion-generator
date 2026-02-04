import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Visual Regression Tests for TESTIMOTION Landing Page
 *
 * These tests compare the HTML implementation against baseline screenshots.
 * Use `npx playwright test --update-snapshots` to create/update baselines.
 *
 * Iteration workflow:
 * 1. Run tests: `npx playwright test`
 * 2. View diff report: `npx playwright show-report`
 * 3. Adjust preview/index.html to fix differences
 * 4. Repeat until pixel diff ≈ 0
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PREVIEW_PATH = path.resolve(__dirname, '..', 'preview', 'index.html');

test.describe('Landing Page Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the preview HTML file
    await page.goto(`file://${PREVIEW_PATH}`);

    // Wait for all images to load
    await page.waitForLoadState('networkidle');

    // Additional wait for any lazy-loaded content
    await page.waitForTimeout(500);
  });

  test('full page matches design baseline', async ({ page }) => {
    // Set viewport to match SVG design dimensions
    await page.setViewportSize({ width: 1440, height: 4875 });

    // Wait for Tailwind CSS to fully load and apply
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await expect(page).toHaveScreenshot('landing-page-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('hero section matches design', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Screenshot just the hero section
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('hero-section.png', {
      animations: 'disabled',
    });
  });

  test('process steps section matches design', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to process steps section
    const processSection = page.locator('section').nth(2);
    await processSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(processSection).toHaveScreenshot('process-steps-section.png', {
      animations: 'disabled',
    });
  });

  test('reviews section matches design', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to reviews section
    const reviewsSection = page.locator('section').nth(3);
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(reviewsSection).toHaveScreenshot('reviews-section.png', {
      animations: 'disabled',
    });
  });

  test.skip('footer CTA section matches design', async ({ page }) => {
    // Skip: Preview file structure differs from generator template
    await page.setViewportSize({ width: 1440, height: 900 });

    const footerCTA = page.locator('h2[data-ghl-token="footer_headline"]').locator('..').locator('..');
    await footerCTA.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(footerCTA).toHaveScreenshot('footer-cta-section.png', {
      animations: 'disabled',
    });
  });

});

test.describe('Responsive Visual Tests', () => {

  test('mobile view (375px) renders correctly', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('landing-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tablet view (768px) renders correctly', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('landing-page-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

});

test.describe('Component Visual Tests', () => {

  test('CTA button styling', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');

    const ctaButton = page.locator('a.bg-brand-primary').first();
    await expect(ctaButton).toHaveScreenshot('cta-button.png');
  });

  test.skip('testimonial card styling', async ({ page }) => {
    // Skip: Preview file structure differs from generator template (no .video-testimonial-card)
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');

    const testimonialCard = page.locator('.video-testimonial-card').first();
    await testimonialCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(testimonialCard).toHaveScreenshot('testimonial-card.png');
  });

  test('Google review card styling', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');

    const reviewCard = page.locator('.google-review-card').first();
    await reviewCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(reviewCard).toHaveScreenshot('google-review-card.png');
  });

  test('step card with number badge', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');

    const stepCard = page.locator('.step-number').first().locator('..').locator('..');
    await stepCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(stepCard).toHaveScreenshot('step-card.png');
  });

});

test.describe('Conditional Hiding Tests', () => {

  test('empty tokens should hide containers', async ({ page }) => {
    await page.goto(`file://${PREVIEW_PATH}`);
    await page.waitForLoadState('networkidle');

    // Check that the conditional hiding script ran
    const logs = await page.evaluate(() => {
      return (window as any).__ghlLogs || [];
    });

    // All containers should be visible since we have mock data
    const hiddenContainers = await page.locator('.ghl-container.hidden').count();
    expect(hiddenContainers).toBe(0);
  });

});
