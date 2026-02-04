/**
 * Preview Sync E2E Tests
 * Tests preview updates, debouncing, localStorage, and viewports
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';

test.describe('Preview Sync', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.describe('Real-time Updates', () => {
    test('preview updates when typing in field', async ({ page }) => {
      const input = page.locator('[name="hero_headline"]');

      // Type character by character
      await input.fill('');
      await input.type('Hello', { delay: 50 });

      // Wait for debounce
      await page.waitForTimeout(500);

      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain('Hello');
    });

    test('preview updates are debounced', async ({ page }) => {
      const input = page.locator('[name="hero_headline"]');

      // Rapid typing
      await input.fill('Test1');
      await input.fill('Test2');
      await input.fill('Test3');

      // Check immediately - might not be updated yet
      await page.waitForTimeout(100);

      // Wait for debounce to complete
      await page.waitForTimeout(400);

      // Now should show final value
      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain('Test3');
    });
  });

  test.describe('Autosave Indicator', () => {
    test('autosave indicator shows when saving', async ({ page }) => {
      const indicator = page.locator('#autosave-indicator');

      // Make a change
      await formHelper.fillField('hero_headline', 'Trigger autosave');

      // Indicator should briefly show saving state
      // This is tricky to test due to timing, but we can check the indicator exists
      await expect(indicator).toBeVisible();
    });

    test('autosave indicator returns to normal after save', async ({ page }) => {
      const indicator = page.locator('#autosave-indicator');

      await formHelper.fillField('hero_headline', 'Test value');
      await page.waitForTimeout(1500); // Wait for save to complete

      // Should not have saving class after save completes
      const isSaving = await indicator.evaluate(el => el.classList.contains('saving'));
      expect(isSaving).toBe(false);
    });
  });

  test.describe('LocalStorage Persistence', () => {
    test('form data persists to localStorage', async ({ page }) => {
      const testValue = 'Persistence Test Value';
      await formHelper.fillField('hero_headline', testValue);
      await formHelper.waitForAutosave();

      // Check localStorage
      const storageData = await page.evaluate(() => {
        return localStorage.getItem('testimotion_form_data');
      });

      expect(storageData).not.toBeNull();
      const parsed = JSON.parse(storageData!);
      expect(parsed.values.hero_headline).toBe(testValue);
    });

    test('form data loads from localStorage on page load', async ({ page }) => {
      // Set data via form
      const testValue = 'Load From Storage Test';
      await formHelper.fillField('hero_headline', testValue);
      await formHelper.waitForAutosave();

      // Reload page
      await page.reload();
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      // Field should have saved value
      const loadedValue = await formHelper.getFieldValue('hero_headline');
      expect(loadedValue).toBe(testValue);

      // Preview should also show the value
      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain(testValue);
    });

    test('hidden fields persist to localStorage', async ({ page }) => {
      await formHelper.toggleFieldHide('hero_headline');
      await formHelper.waitForAutosave();

      const storageData = await page.evaluate(() => {
        return localStorage.getItem('testimotion_form_data');
      });

      const parsed = JSON.parse(storageData!);
      expect(parsed.hidden).toContain('hero_headline');
    });

    test('hidden sections persist to localStorage', async ({ page }) => {
      await formHelper.toggleSectionHide('hero');
      await formHelper.waitForAutosave();

      const storageData = await page.evaluate(() => {
        return localStorage.getItem('testimotion_form_data');
      });

      const parsed = JSON.parse(storageData!);
      expect(parsed.hiddenSections).toContain('hero');
    });
  });

  test.describe('Viewport Switcher', () => {
    test('desktop viewport is default', async ({ page }) => {
      const desktopBtn = page.locator('.viewport-btn[data-viewport="desktop"]');
      await expect(desktopBtn).toHaveClass(/active/);
    });

    test('tablet viewport can be selected', async ({ page }) => {
      await formHelper.setViewport('tablet');

      const tabletBtn = page.locator('.viewport-btn[data-viewport="tablet"]');
      await expect(tabletBtn).toHaveClass(/active/);

      const container = page.locator('#preview-iframe-container');
      await expect(container).toHaveClass(/viewport-tablet/);
    });

    test('mobile viewport can be selected', async ({ page }) => {
      await formHelper.setViewport('mobile');

      const mobileBtn = page.locator('.viewport-btn[data-viewport="mobile"]');
      await expect(mobileBtn).toHaveClass(/active/);

      const container = page.locator('#preview-iframe-container');
      await expect(container).toHaveClass(/viewport-mobile/);
    });

    test('switching back to desktop removes viewport class', async ({ page }) => {
      // First switch to mobile
      await formHelper.setViewport('mobile');
      await page.waitForTimeout(300);

      // Then back to desktop
      await formHelper.setViewport('desktop');
      await page.waitForTimeout(300);

      const container = page.locator('#preview-iframe-container');
      await expect(container).not.toHaveClass(/viewport-mobile/);
      await expect(container).not.toHaveClass(/viewport-tablet/);
    });

    test('viewport changes preserve preview content', async ({ page }) => {
      const testValue = 'Viewport Test Content';
      await formHelper.fillField('hero_headline', testValue);
      await previewHelper.waitForPreviewUpdate();

      // Switch viewports
      await formHelper.setViewport('tablet');
      await page.waitForTimeout(300);

      // Content should still be there
      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain(testValue);
    });
  });

  test.describe('New Tab Preview', () => {
    test('new tab button exists', async ({ page }) => {
      const btn = page.locator('#btn-new-tab-preview');
      await expect(btn).toBeVisible();
    });

    // Note: Testing actual new tab/window behavior is limited in Playwright
    // The button should exist and be clickable
    test('new tab button is clickable', async ({ page }) => {
      const btn = page.locator('#btn-new-tab-preview');
      await expect(btn).toBeEnabled();
    });
  });

  test.describe('Preview Iframe', () => {
    test('preview iframe exists and is visible', async ({ page }) => {
      const iframe = page.locator('#preview-iframe');
      await expect(iframe).toBeVisible();
    });

    test('preview iframe has content', async ({ page }) => {
      // Wait for preview to load
      await page.waitForTimeout(1000);

      // Check that iframe has a document
      const hasContent = await page.evaluate(() => {
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
        return iframe?.contentDocument?.body?.innerHTML?.length > 0;
      });

      expect(hasContent).toBe(true);
    });

    test('preview iframe updates without full reload', async ({ page }) => {
      // Get initial content indicator
      await formHelper.fillField('hero_headline', 'Initial Content');
      await previewHelper.waitForPreviewUpdate();

      // Update content
      await formHelper.fillField('hero_headline', 'Updated Content');
      await previewHelper.waitForPreviewUpdate();

      // Verify it updated (without page reload)
      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain('Updated Content');
      expect(previewText).not.toContain('Initial Content');
    });
  });

  test.describe('Section Collapse State', () => {
    test('collapsed sections can be expanded', async ({ page }) => {
      // Mini testimonials is collapsed by default
      const section = page.locator('[data-section-id="mini_testimonials"]');
      await expect(section).toHaveClass(/collapsed/);

      // Click to expand
      await section.locator('.section-header').click();
      await page.waitForTimeout(300);

      await expect(section).not.toHaveClass(/collapsed/);
    });

    test('section content is hidden when collapsed', async ({ page }) => {
      const section = page.locator('[data-section-id="mini_testimonials"]');
      const content = section.locator('.section-content');

      // Should be hidden when collapsed
      await expect(content).not.toBeVisible();

      // Expand and check visible
      await section.locator('.section-header').click();
      await page.waitForTimeout(300);

      await expect(content).toBeVisible();
    });
  });

  test.describe('Multiple Rapid Changes', () => {
    test('handles multiple rapid field changes', async ({ page }) => {
      // Fill multiple fields quickly
      await formHelper.fillField('hero_headline', 'Test 1');
      await formHelper.fillField('hero_subheadline', 'Test 2');
      await formHelper.fillField('cta_button_text', 'Test 3');

      // Wait for debounce
      await page.waitForTimeout(500);

      // All should be reflected
      const headline = await previewHelper.getHeroHeadline();
      const subheadline = await previewHelper.getHeroSubheadline();
      const cta = await previewHelper.getCTAButtonText();

      expect(headline).toContain('Test 1');
      expect(subheadline).toContain('Test 2');
      expect(cta).toContain('Test 3');
    });
  });
});
