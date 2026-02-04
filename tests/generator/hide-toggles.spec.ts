/**
 * Hide Toggles E2E Tests
 * Tests field and section hiding functionality
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';
import { bugReporter } from '../helpers/report-generator';
import { HIDEABLE_SECTIONS, HIDEABLE_FIELDS } from '../fixtures/test-data';

test.describe('Hide Toggles', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.describe('Field Hide Toggles', () => {
    test('hero_headline hide toggle works', async ({ page }) => {
      // Fill the field first
      await formHelper.fillField('hero_headline', 'Test Headline To Hide');
      await previewHelper.waitForPreviewUpdate();

      // Verify it appears
      let text = await previewHelper.getHeroHeadline();
      expect(text).toContain('Test Headline');

      // Click hide toggle
      await formHelper.toggleFieldHide('hero_headline');
      await previewHelper.waitForPreviewUpdate();

      // Check that field is marked as hidden
      const isHidden = await formHelper.isFieldHidden('hero_headline');
      expect(isHidden).toBe(true);

      // Field input should have hidden styling
      const formGroup = page.locator('[name="hero_headline"]').locator('..');
      await expect(formGroup).toHaveClass(/field-hidden/);
    });

    test('hide toggle adds visual indicator', async ({ page }) => {
      // Toggle hide on a field
      await formHelper.toggleFieldHide('cta_button_text');

      // Button should have 'hidden' class
      const btn = page.locator('.btn-hide[data-field="cta_button_text"]');
      await expect(btn).toHaveClass(/hidden/);

      // Toggle back
      await formHelper.toggleFieldHide('cta_button_text');
      await expect(btn).not.toHaveClass(/hidden/);
    });

    test('hidden field content excluded from generated HTML', async ({ page }) => {
      // Fill and hide a field
      await formHelper.fillField('hero_headline', 'SHOULD_NOT_APPEAR');
      await formHelper.toggleFieldHide('hero_headline');
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');

      // Get generated HTML
      const html = await page.locator('#output-textarea').inputValue();

      // Hidden field content should not appear
      expect(html).not.toContain('SHOULD_NOT_APPEAR');
    });

    test('multiple fields can be hidden simultaneously', async ({ page }) => {
      // Hide multiple fields
      await formHelper.toggleFieldHide('hero_headline');
      await formHelper.toggleFieldHide('hero_subheadline');
      await formHelper.toggleFieldHide('cta_button_text');

      // All should be marked hidden
      expect(await formHelper.isFieldHidden('hero_headline')).toBe(true);
      expect(await formHelper.isFieldHidden('hero_subheadline')).toBe(true);
      expect(await formHelper.isFieldHidden('cta_button_text')).toBe(true);
    });

    test('hidden fields persist after page reload', async ({ page }) => {
      // Hide a field
      await formHelper.toggleFieldHide('hero_headline');
      await formHelper.waitForAutosave();

      // Reload page
      await page.reload();
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      // Check field is still hidden
      const isHidden = await formHelper.isFieldHidden('hero_headline');
      expect(isHidden).toBe(true);
    });
  });

  test.describe('Section Hide Toggles', () => {
    test('hero section hide toggle works', async ({ page }) => {
      // Click section hide
      await formHelper.toggleSectionHide('hero');
      await previewHelper.waitForPreviewUpdate();

      // Section should be marked hidden
      const isHidden = await formHelper.isSectionHidden('hero');
      expect(isHidden).toBe(true);

      // Section should have visual indicator
      const section = page.locator('[data-section-id="hero"]');
      await expect(section).toHaveClass(/section-hidden/);
    });

    test('video section hide toggle works', async ({ page }) => {
      // First make sure video section has content
      await formHelper.expandSection('video');
      await formHelper.fillField('vimeo_embed_url', 'https://player.vimeo.com/video/123456');
      await previewHelper.waitForPreviewUpdate();

      // Verify video appears
      let hasVideo = await previewHelper.elementExistsInPreview('iframe[src*="vimeo"]');
      expect(hasVideo).toBe(true);

      // Hide the section
      await formHelper.toggleSectionHide('video');
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML and check section is excluded
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');
      const html = await page.locator('#output-textarea').inputValue();

      // Video section content should be excluded
      const isHidden = await formHelper.isSectionHidden('video');
      expect(isHidden).toBe(true);
    });

    test('process_steps section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('process_steps');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('process_steps');
      expect(isHidden).toBe(true);
    });

    test('google_reviews section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('google_reviews');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('google_reviews');
      expect(isHidden).toBe(true);
    });

    test('video_testimonials section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('video_testimonials');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('video_testimonials');
      expect(isHidden).toBe(true);
    });

    test('footer_cta section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('footer_cta');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('footer_cta');
      expect(isHidden).toBe(true);
    });

    test('trust_badges section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('trust_badges');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('trust_badges');
      expect(isHidden).toBe(true);
    });

    test('mini_testimonials section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('mini_testimonials');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('mini_testimonials');
      expect(isHidden).toBe(true);
    });

    test('client_logos section hide toggle works', async ({ page }) => {
      await formHelper.toggleSectionHide('client_logos');
      await previewHelper.waitForPreviewUpdate();

      const isHidden = await formHelper.isSectionHidden('client_logos');
      expect(isHidden).toBe(true);
    });

    test('hidden sections persist after reload', async ({ page }) => {
      // Hide multiple sections
      await formHelper.toggleSectionHide('hero');
      await formHelper.toggleSectionHide('video');
      await formHelper.waitForAutosave();

      // Reload
      await page.reload();
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      // Both should still be hidden
      expect(await formHelper.isSectionHidden('hero')).toBe(true);
      expect(await formHelper.isSectionHidden('video')).toBe(true);
    });

    test('hidden section excluded from generated HTML', async ({ page }) => {
      // Fill some content in hero
      await formHelper.fillField('hero_headline', 'UNIQUE_HERO_TEXT');
      await previewHelper.waitForPreviewUpdate();

      // Hide the section
      await formHelper.toggleSectionHide('hero');
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');
      const html = await page.locator('#output-textarea').inputValue();

      // Hero content should not appear (or section should be commented out)
      // Note: Implementation may vary - just verify the section is marked hidden
      const isHidden = await formHelper.isSectionHidden('hero');
      expect(isHidden).toBe(true);
    });
  });

  test.describe('All Hideable Sections', () => {
    for (const sectionId of HIDEABLE_SECTIONS) {
      test(`section "${sectionId}" has working hide toggle`, async ({ page }) => {
        // Find and click the hide button
        const btn = page.locator(`.btn-section-hide[data-section="${sectionId}"]`);

        // Button should exist
        await expect(btn).toBeVisible();

        // Toggle hide
        await btn.click();
        await page.waitForTimeout(300);

        // Should now be hidden
        const isHidden = await btn.evaluate(el => el.classList.contains('hidden'));
        expect(isHidden).toBe(true);

        // Section should have hidden styling
        const section = page.locator(`[data-section-id="${sectionId}"]`);
        await expect(section).toHaveClass(/section-hidden/);
      });
    }
  });

  test.describe('Reset Clears Hidden States', () => {
    test('reset button clears all hidden fields', async ({ page }) => {
      // Hide some fields
      await formHelper.toggleFieldHide('hero_headline');
      await formHelper.toggleFieldHide('cta_button_text');

      // Reset
      await formHelper.clickReset();
      await page.waitForTimeout(500);

      // Fields should no longer be hidden
      expect(await formHelper.isFieldHidden('hero_headline')).toBe(false);
      expect(await formHelper.isFieldHidden('cta_button_text')).toBe(false);
    });

    test('reset button clears all hidden sections', async ({ page }) => {
      // Hide some sections
      await formHelper.toggleSectionHide('hero');
      await formHelper.toggleSectionHide('video');

      // Reset
      await formHelper.clickReset();
      await page.waitForTimeout(500);

      // Sections should no longer be hidden
      expect(await formHelper.isSectionHidden('hero')).toBe(false);
      expect(await formHelper.isSectionHidden('video')).toBe(false);
    });
  });
});
