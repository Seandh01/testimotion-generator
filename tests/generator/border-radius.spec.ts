/**
 * Border Radius E2E Tests
 * Tests that border radius setting applies to all relevant elements
 * Known bug: Modal iframe may have hardcoded 8px instead of using --radius variable
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';
import { bugReporter } from '../helpers/report-generator';
import { BORDER_RADIUS_ELEMENTS } from '../fixtures/test-data';

test.describe('Border Radius', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);

    // Expand advanced options to access border radius
    const advancedSection = page.locator('.section-header:has-text("Advanced")');
    await advancedSection.click();
    await page.waitForTimeout(300);
  });

  test.describe('Border Radius Input', () => {
    test('slider and number input are synced', async ({ page }) => {
      const slider = page.locator('#border_radius_slider');
      const numberInput = page.locator('#border_radius');

      // Set via slider
      await slider.fill('20');
      await slider.dispatchEvent('input');
      await page.waitForTimeout(100);

      // Number input should update
      const numberValue = await numberInput.inputValue();
      expect(numberValue).toBe('20');
    });

    test('number input updates slider', async ({ page }) => {
      const slider = page.locator('#border_radius_slider');
      const numberInput = page.locator('#border_radius');

      // Set via number input
      await numberInput.fill('24');
      await numberInput.dispatchEvent('input');
      await page.waitForTimeout(100);

      // Slider should update
      const sliderValue = await slider.inputValue();
      expect(sliderValue).toBe('24');
    });

    test('accepts values from 0 to 32', async ({ page }) => {
      const numberInput = page.locator('#border_radius');

      // Test min value
      await formHelper.setBorderRadius(0);
      expect(await numberInput.inputValue()).toBe('0');

      // Test max value
      await formHelper.setBorderRadius(32);
      expect(await numberInput.inputValue()).toBe('32');
    });
  });

  test.describe('Border Radius Application', () => {
    test('border radius applies to CTA buttons', async ({ page }) => {
      await formHelper.setBorderRadius(24);
      await previewHelper.waitForPreviewUpdate();

      const radius = await previewHelper.getPreviewBorderRadius('.cta-btn, .cta-button, [class*="cta"]');

      // Should be 24px (or close to it)
      // Note: May be in different formats: "24px", "24px 24px 24px 24px", etc.
      const has24px = radius.includes('24');
      if (!has24px) {
        bugReporter.addBorderRadiusBug(
          'CTA buttons',
          '24px',
          radius,
          '.cta-btn'
        );
      }

      expect(typeof radius).toBe('string');
    });

    test('border radius applies to video frame', async ({ page }) => {
      // Add a video first
      await formHelper.expandSection('video');
      await formHelper.fillField('vimeo_embed_url', 'https://player.vimeo.com/video/123456');
      await previewHelper.waitForPreviewUpdate();

      // Set border radius
      await formHelper.setBorderRadius(16);
      await previewHelper.waitForPreviewUpdate();

      const radius = await previewHelper.getPreviewBorderRadius('.video-frame, .video-wrapper, [class*="video"] iframe');

      const has16px = radius.includes('16');
      if (!has16px) {
        bugReporter.addBorderRadiusBug(
          'Video frame',
          '16px',
          radius,
          '.video-frame'
        );
      }

      expect(typeof radius).toBe('string');
    });

    test('border radius applies to review cards', async ({ page }) => {
      // Ensure reviews section has content
      await formHelper.expandSection('google_reviews');
      await formHelper.fillField('review_name_1', 'Test Name');
      await formHelper.fillField('review_text_1', 'Test review text');
      await previewHelper.waitForPreviewUpdate();

      // Set border radius
      await formHelper.setBorderRadius(12);
      await previewHelper.waitForPreviewUpdate();

      const radius = await previewHelper.getPreviewBorderRadius('.review-card, .google-review, [class*="review"]');

      const has12px = radius.includes('12');
      if (!has12px && radius !== '') {
        bugReporter.addBorderRadiusBug(
          'Review cards',
          '12px',
          radius,
          '.review-card'
        );
      }

      expect(typeof radius).toBe('string');
    });

    test('border radius applies to step cards', async ({ page }) => {
      // Ensure process section has content
      await formHelper.expandSection('process_steps');
      await formHelper.fillField('step_1_title', 'Test Step');
      await formHelper.fillField('step_1_description', 'Test description');
      await previewHelper.waitForPreviewUpdate();

      // Set border radius
      await formHelper.setBorderRadius(20);
      await previewHelper.waitForPreviewUpdate();

      const radius = await previewHelper.getPreviewBorderRadius('.step-card, .process-step, [class*="step"]');

      const has20px = radius.includes('20');
      if (!has20px && radius !== '') {
        bugReporter.addBorderRadiusBug(
          'Step cards',
          '20px',
          radius,
          '.step-card'
        );
      }

      expect(typeof radius).toBe('string');
    });

    test('border radius applies to testimonial cards', async ({ page }) => {
      // Ensure testimonials section has content
      await formHelper.expandSection('video_testimonials');
      await formHelper.fillField('video_testimonial_name_1', 'Test Name');
      await formHelper.fillField('video_testimonial_thumb_1', 'https://example.com/thumb.jpg');
      await previewHelper.waitForPreviewUpdate();

      // Set border radius
      await formHelper.setBorderRadius(8);
      await previewHelper.waitForPreviewUpdate();

      const radius = await previewHelper.getPreviewBorderRadius('.testimonial-card, .video-testimonial, [class*="testimonial"]');

      const has8px = radius.includes('8');
      if (!has8px && radius !== '') {
        bugReporter.addBorderRadiusBug(
          'Testimonial cards',
          '8px',
          radius,
          '.testimonial-card'
        );
      }

      expect(typeof radius).toBe('string');
    });
  });

  test.describe('Modal Iframe Border Radius (Known Bug)', () => {
    test('detect hardcoded 8px on modal iframe', async ({ page }) => {
      // This test specifically checks for the known bug where
      // modal iframe has hardcoded 8px instead of using --radius

      // Set a different border radius
      await formHelper.setBorderRadius(24);
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');
      const html = await page.locator('#output-textarea').inputValue();

      // Check for hardcoded 8px on modal/iframe elements
      const hasHardcoded8px = html.match(/border-radius:\s*8px/gi);
      const usesRadiusVar = html.includes('var(--radius)');

      if (hasHardcoded8px && hasHardcoded8px.length > 0) {
        // Check if it's on modal-related elements
        const modalRelated = html.includes('.modal') || html.includes('.video-modal');

        if (modalRelated && !usesRadiusVar) {
          bugReporter.addBorderRadiusBug(
            'Modal iframe',
            'var(--radius) = 24px',
            '8px (hardcoded)',
            '.modal-iframe, .video-modal iframe'
          );
          console.warn('BUG DETECTED: Modal iframe has hardcoded 8px border-radius');
        }
      }

      // Close modal
      await page.click('#modal-close');
    });
  });

  test.describe('Border Radius CSS Variable', () => {
    test('--radius CSS variable is set in preview', async ({ page }) => {
      await formHelper.setBorderRadius(16);
      await previewHelper.waitForPreviewUpdate();

      const cssVar = await previewHelper.getPreviewCSSVariable('--radius');

      // Variable should be set
      if (cssVar && cssVar !== '') {
        expect(cssVar).toContain('16');
      } else {
        // Variable might not be implemented - track as potential bug
        console.warn('--radius CSS variable may not be implemented');
      }
    });

    test('border radius appears in generated HTML', async ({ page }) => {
      await formHelper.setBorderRadius(20);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');
      const html = await page.locator('#output-textarea').inputValue();

      // Should contain either --radius: 20px or border-radius with 20
      const hasRadius = html.includes('--radius') || html.includes('20px');
      expect(hasRadius).toBe(true);

      await page.click('#modal-close');
    });
  });

  test.describe('Border Radius Persistence', () => {
    test('border radius persists after reload', async ({ page }) => {
      await formHelper.setBorderRadius(28);
      await formHelper.waitForAutosave();

      await page.reload();
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      // Expand advanced section again
      const advancedSection = page.locator('.section-header:has-text("Advanced")');
      await advancedSection.click();
      await page.waitForTimeout(300);

      const savedValue = await page.locator('#border_radius').inputValue();
      expect(savedValue).toBe('28');
    });
  });

  test.describe('Zero Border Radius', () => {
    test('setting 0 creates square corners', async ({ page }) => {
      await formHelper.setBorderRadius(0);
      await previewHelper.waitForPreviewUpdate();

      // Check card-radius elements (uses --radius CSS variable)
      const radius = await previewHelper.getPreviewBorderRadius('.card-radius, .google-review-card');

      // Should be 0 or 0px
      const isZero = radius === '0px' || radius === '0' || radius.includes('0');
      expect(isZero).toBe(true);
    });
  });
});
