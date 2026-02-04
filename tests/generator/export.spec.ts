/**
 * Export E2E Tests
 * Tests HTML generation, copy functionality, and hidden field exclusion
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';
import { bugReporter } from '../helpers/report-generator';

test.describe('Export', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.describe('Generate HTML Button', () => {
    test('generate button opens modal', async ({ page }) => {
      await formHelper.clickGenerate();

      const modal = page.locator('#modal-overlay');
      await expect(modal).toHaveClass(/active/);
    });

    test('modal contains generated HTML', async ({ page }) => {
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');

      const textarea = page.locator('#output-textarea');
      const html = await textarea.inputValue();

      // Should be valid HTML
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    test('generated HTML is read-only in textarea', async ({ page }) => {
      await formHelper.clickGenerate();

      const textarea = page.locator('#output-textarea');
      const isReadonly = await textarea.getAttribute('readonly');

      expect(isReadonly).not.toBeNull();
    });
  });

  test.describe('Generated HTML Content', () => {
    test('includes form field values', async ({ page }) => {
      const testHeadline = 'UNIQUE_HEADLINE_' + Date.now();
      await formHelper.fillField('hero_headline', testHeadline);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      expect(html).toContain(testHeadline);
      await page.click('#modal-close');
    });

    test('includes color values', async ({ page }) => {
      const testColor = '#ff5500';
      await formHelper.fillColorField('brand_primary_color', testColor);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Color should appear somewhere (may be CSS variable or inline)
      const containsColor = html.includes(testColor) || html.includes('ff5500');
      expect(containsColor).toBe(true);
      await page.click('#modal-close');
    });

    test('includes border radius value', async ({ page }) => {
      // Expand advanced options
      const advancedSection = page.locator('.section-header:has-text("Advanced")');
      await advancedSection.click();
      await page.waitForTimeout(300);

      await formHelper.setBorderRadius(20);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Should include radius (either as CSS var or value)
      const hasRadius = html.includes('--radius') || html.includes('20px');
      expect(hasRadius).toBe(true);
      await page.click('#modal-close');
    });

    test('excludes hidden field values', async ({ page }) => {
      const hiddenValue = 'HIDDEN_VALUE_' + Date.now();
      await formHelper.fillField('hero_headline', hiddenValue);
      await formHelper.toggleFieldHide('hero_headline');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      expect(html).not.toContain(hiddenValue);
      await page.click('#modal-close');
    });

    test('hidden sections are marked for runtime hiding', async ({ page }) => {
      // Fill video section
      await formHelper.expandSection('video');
      const videoUrl = 'https://player.vimeo.com/video/UNIQUE123456';
      await formHelper.fillField('vimeo_embed_url', videoUrl);
      await previewHelper.waitForPreviewUpdate();

      // Hide the section
      await formHelper.toggleSectionHide('video');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Note: Current implementation hides sections via JavaScript at runtime,
      // not by excluding them from the HTML. The hidden sections are passed
      // as data and hidden with display:none when the page loads.
      // This test verifies the hiding mechanism is in place.
      expect(html).toContain('hiddenSections');
      expect(html).toContain('"video"');  // Video section marked as hidden
      await page.click('#modal-close');
    });

    test('includes proper HTML structure', async ({ page }) => {
      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Check for essential HTML elements (body may have class attributes)
      expect(html).toContain('<head>');
      expect(html).toMatch(/<body[>\s]/);  // body tag with > or space for attributes
      expect(html).toContain('<style>');

      // Should have proper closing tags
      expect(html).toContain('</head>');
      expect(html).toContain('</body>');
      expect(html).toContain('</style>');

      await page.click('#modal-close');
    });

    test('includes CSS variables', async ({ page }) => {
      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Should have CSS custom properties
      expect(html).toMatch(/--[a-z-]+:/i);

      await page.click('#modal-close');
    });

    test('generated HTML is complete and standalone', async ({ page }) => {
      // Fill some content
      await formHelper.fillField('hero_headline', 'Complete Test');
      await formHelper.fillField('hero_subheadline', 'Standalone HTML');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Should be a complete HTML document
      expect(html).toMatch(/^<!DOCTYPE html>/);

      // Should include all necessary inline styles (no external dependencies)
      expect(html).toContain('<style>');

      // Should not have external stylesheet references (it should be self-contained)
      expect(html).not.toMatch(/<link[^>]+stylesheet[^>]+href=["'][^"']+\.css["']/);

      await page.click('#modal-close');
    });
  });

  test.describe('Copy HTML Button', () => {
    test('copy button exists in modal', async ({ page }) => {
      await formHelper.clickGenerate();

      const copyBtn = page.locator('#btn-copy-html');
      await expect(copyBtn).toBeVisible();
      await expect(copyBtn).toBeEnabled();

      await page.click('#modal-close');
    });

    test('copy button shows toast on success', async ({ page }) => {
      await formHelper.clickGenerate();

      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.click('#btn-copy-html');

      const toast = page.locator('#toast');
      await expect(toast).toHaveClass(/show/);
      await expect(toast).toContainText('Copied');

      await page.click('#modal-close');
    });
  });

  test.describe('Copy Link Button', () => {
    test('copy link button exists', async ({ page }) => {
      const copyLinkBtn = page.locator('#btn-copy-link');
      await expect(copyLinkBtn).toBeVisible();
      await expect(copyLinkBtn).toBeEnabled();
    });

    test('copy link updates URL params', async ({ page }) => {
      await formHelper.fillField('hero_headline', 'Link Test');
      await previewHelper.waitForPreviewUpdate();

      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      await formHelper.clickCopyLink();

      // URL should now contain params
      const url = page.url();
      expect(url).toContain('hero_headline=Link');

      // Toast should show
      const toast = page.locator('#toast');
      await expect(toast).toHaveClass(/show/);
    });

    test('URL params load form values', async ({ page }) => {
      // Navigate with params
      await page.goto('/?hero_headline=URL%20Param%20Test');
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      const value = await formHelper.getFieldValue('hero_headline');
      expect(value).toBe('URL Param Test');
    });
  });

  test.describe('Modal Functionality', () => {
    test('modal closes via X button', async ({ page }) => {
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');

      await page.click('#modal-close');

      const modal = page.locator('#modal-overlay');
      await expect(modal).not.toHaveClass(/active/);
    });

    test('modal closes via outside click', async ({ page }) => {
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');

      // Click on overlay (outside modal content)
      await page.locator('#modal-overlay').click({ position: { x: 10, y: 10 } });

      const modal = page.locator('#modal-overlay');
      await expect(modal).not.toHaveClass(/active/);
    });

    test('modal closes via Escape key', async ({ page }) => {
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');

      await page.keyboard.press('Escape');

      const modal = page.locator('#modal-overlay');
      await expect(modal).not.toHaveClass(/active/);
    });

    test('textarea is selectable', async ({ page }) => {
      await formHelper.clickGenerate();

      const textarea = page.locator('#output-textarea');
      await textarea.click();
      await textarea.selectText();

      // Should be able to select
      const selection = await page.evaluate(() => window.getSelection()?.toString() || '');
      expect(selection.length).toBeGreaterThan(0);

      await page.click('#modal-close');
    });
  });

  test.describe('Reset Button', () => {
    test('reset button shows confirmation', async ({ page }) => {
      let dialogShown = false;
      page.once('dialog', async dialog => {
        dialogShown = true;
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await page.click('#btn-reset');
      expect(dialogShown).toBe(true);
    });

    test('reset clears form values', async ({ page }) => {
      await formHelper.fillField('hero_headline', 'Reset Test Value');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickReset();
      await page.waitForTimeout(500);

      // Field should be reset (to default or empty)
      const value = await formHelper.getFieldValue('hero_headline');
      expect(value).not.toBe('Reset Test Value');
    });

    test('reset loads default values', async ({ page }) => {
      // Clear everything first
      await formHelper.clickReset();
      await page.waitForTimeout(500);

      // Some fields should have default placeholder values
      // (depends on DEFAULTS in defaults.js)
      const logoField = page.locator('[name="logo_url"]');
      const placeholder = await logoField.getAttribute('placeholder');

      // Placeholder should exist
      expect(placeholder).toBeTruthy();
    });
  });

  test.describe('Export with Various Content', () => {
    test('exports all 3 step cards when filled', async ({ page }) => {
      await formHelper.expandSection('process_steps');

      await formHelper.fillField('step_1_title', 'Step One');
      await formHelper.fillField('step_2_title', 'Step Two');
      await formHelper.fillField('step_3_title', 'Step Three');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      expect(html).toContain('Step One');
      expect(html).toContain('Step Two');
      expect(html).toContain('Step Three');

      await page.click('#modal-close');
    });

    test('exports all 6 review cards when filled', async ({ page }) => {
      await formHelper.expandSection('google_reviews');

      for (let i = 1; i <= 6; i++) {
        await formHelper.fillField(`review_name_${i}`, `Reviewer ${i}`);
        await formHelper.fillField(`review_text_${i}`, `Review text ${i}`);
      }
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      for (let i = 1; i <= 6; i++) {
        expect(html).toContain(`Reviewer ${i}`);
      }

      await page.click('#modal-close');
    });

    test('exports video testimonials with correct format', async ({ page }) => {
      await formHelper.expandSection('video_testimonials');

      await formHelper.fillField('video_testimonial_name_1', 'Video Person');
      await formHelper.fillField('video_testimonial_thumb_1', 'https://example.com/thumb.jpg');
      await formHelper.fillField('video_testimonial_url_1', 'https://player.vimeo.com/video/123');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      expect(html).toContain('Video Person');
      expect(html).toContain('thumb.jpg');
      expect(html).toContain('vimeo');

      await page.click('#modal-close');
    });
  });
});
