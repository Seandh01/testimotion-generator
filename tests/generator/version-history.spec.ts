/**
 * Version History E2E Tests
 * Tests save, load, delete, and list version history
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';

test.describe('Version History', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.describe('Save Version', () => {
    test('save version button opens modal', async ({ page }) => {
      await formHelper.clickSaveVersion();

      const modal = page.locator('#save-version-modal');
      await expect(modal).toHaveClass(/active/);
    });

    test('can save version with label', async ({ page }) => {
      // Fill some form data first
      await formHelper.fillField('hero_headline', 'Version Test Headline');
      await previewHelper.waitForPreviewUpdate();

      // Save version
      const label = 'Test Version ' + Date.now();
      await formHelper.saveVersionWithLabel(label);

      // Wait for save and list refresh
      await page.waitForTimeout(1000);

      // Check version appears in list
      const versions = await formHelper.getVersionList();
      const found = versions.some(v => v.label === label);
      expect(found).toBe(true);
    });

    test('saved version includes form values', async ({ page }) => {
      const testHeadline = 'Unique Headline ' + Date.now();
      await formHelper.fillField('hero_headline', testHeadline);
      await previewHelper.waitForPreviewUpdate();

      const label = 'Values Test ' + Date.now();
      await formHelper.saveVersionWithLabel(label);
      await page.waitForTimeout(1000);

      // Clear the form
      await formHelper.clickReset();
      await page.waitForTimeout(500);

      // Load the version
      const versions = await formHelper.getVersionList();
      const savedVersion = versions.find(v => v.label === label);
      expect(savedVersion).toBeDefined();

      await formHelper.loadVersion(savedVersion!.id);
      await page.waitForTimeout(500);

      // Check headline was restored
      const loadedHeadline = await formHelper.getFieldValue('hero_headline');
      expect(loadedHeadline).toBe(testHeadline);
    });

    test('empty label gets auto-generated', async ({ page }) => {
      await formHelper.clickSaveVersion();

      // Leave label empty and save
      await page.click('#btn-confirm-save');
      await page.waitForTimeout(1000);

      // Should have a version with auto-generated label
      const versions = await formHelper.getVersionList();
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[0].label).toMatch(/Version \d+/);
    });

    test('enter key saves version', async ({ page }) => {
      await formHelper.clickSaveVersion();

      const labelInput = page.locator('#version-label-input');
      await labelInput.fill('Enter Key Test');
      await labelInput.press('Enter');

      await page.waitForTimeout(1000);

      // Modal should close
      const modal = page.locator('#save-version-modal');
      await expect(modal).not.toHaveClass(/active/);

      // Version should be saved
      const versions = await formHelper.getVersionList();
      const found = versions.some(v => v.label === 'Enter Key Test');
      expect(found).toBe(true);
    });
  });

  test.describe('Load Version', () => {
    test('load version restores form values', async ({ page }) => {
      // Create and save a version
      const originalHeadline = 'Original Headline ' + Date.now();
      await formHelper.fillField('hero_headline', originalHeadline);
      await formHelper.fillField('cta_button_text', 'Original CTA');
      await previewHelper.waitForPreviewUpdate();

      await formHelper.saveVersionWithLabel('Load Test');
      await page.waitForTimeout(1000);

      // Change values
      await formHelper.fillField('hero_headline', 'Changed Headline');
      await formHelper.fillField('cta_button_text', 'Changed CTA');
      await previewHelper.waitForPreviewUpdate();

      // Load the saved version
      const versions = await formHelper.getVersionList();
      const savedVersion = versions.find(v => v.label === 'Load Test');
      await formHelper.loadVersion(savedVersion!.id);
      await page.waitForTimeout(500);

      // Values should be restored
      expect(await formHelper.getFieldValue('hero_headline')).toBe(originalHeadline);
      expect(await formHelper.getFieldValue('cta_button_text')).toBe('Original CTA');
    });

    test('load version updates preview', async ({ page }) => {
      // Create and save a version
      const testContent = 'Preview Update Test ' + Date.now();
      await formHelper.fillField('hero_headline', testContent);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.saveVersionWithLabel('Preview Test');
      await page.waitForTimeout(1000);

      // Change headline
      await formHelper.fillField('hero_headline', 'Different Content');
      await previewHelper.waitForPreviewUpdate();

      // Load version
      const versions = await formHelper.getVersionList();
      const savedVersion = versions.find(v => v.label === 'Preview Test');
      await formHelper.loadVersion(savedVersion!.id);
      await page.waitForTimeout(500);

      // Preview should update
      const previewText = await previewHelper.getHeroHeadline();
      expect(previewText).toContain(testContent);
    });

    test('load version shows toast notification', async ({ page }) => {
      await formHelper.fillField('hero_headline', 'Toast Test');
      await formHelper.saveVersionWithLabel('Toast Version');
      await page.waitForTimeout(1000);

      const versions = await formHelper.getVersionList();
      await formHelper.loadVersion(versions[0].id);

      // Toast should appear
      const toast = page.locator('#toast');
      await expect(toast).toHaveClass(/show/);
      await expect(toast).toContainText('Loaded');
    });
  });

  test.describe('Delete Version', () => {
    test('delete version removes from list', async ({ page }) => {
      // Create a version to delete
      const label = 'Delete Test ' + Date.now();
      await formHelper.saveVersionWithLabel(label);
      await page.waitForTimeout(1000);

      // Get versions
      let versions = await formHelper.getVersionList();
      const versionToDelete = versions.find(v => v.label === label);
      expect(versionToDelete).toBeDefined();

      // Delete it
      await formHelper.deleteVersion(versionToDelete!.id);
      await page.waitForTimeout(500);

      // Should be gone
      versions = await formHelper.getVersionList();
      const stillExists = versions.some(v => v.label === label);
      expect(stillExists).toBe(false);
    });

    test('delete shows confirmation dialog', async ({ page }) => {
      await formHelper.saveVersionWithLabel('Confirm Test');
      await page.waitForTimeout(1000);

      const versions = await formHelper.getVersionList();

      // Set up dialog handler that rejects
      page.once('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.dismiss(); // Cancel the delete
      });

      // Try to delete
      await page.click(`.history-btn.delete[data-id="${versions[0].id}"]`);
      await page.waitForTimeout(500);

      // Version should still exist (we cancelled)
      const versionsAfter = await formHelper.getVersionList();
      expect(versionsAfter.length).toBe(versions.length);
    });
  });

  test.describe('Version List', () => {
    test('version list shows in history section', async ({ page }) => {
      // Create a few versions
      await formHelper.saveVersionWithLabel('List Test 1');
      await page.waitForTimeout(500);
      await formHelper.saveVersionWithLabel('List Test 2');
      await page.waitForTimeout(500);

      const versions = await formHelper.getVersionList();
      expect(versions.length).toBeGreaterThanOrEqual(2);
    });

    test('versions are sorted newest first', async ({ page }) => {
      await formHelper.saveVersionWithLabel('First');
      await page.waitForTimeout(500);
      await formHelper.saveVersionWithLabel('Second');
      await page.waitForTimeout(500);

      const versions = await formHelper.getVersionList();

      // Second should be first in list (newest)
      expect(versions[0].label).toBe('Second');
    });

    test('empty list shows placeholder message', async ({ page }) => {
      // This test depends on clean state - skip if versions exist
      const versions = await formHelper.getVersionList();
      if (versions.length === 0) {
        const emptyMessage = page.locator('.history-empty');
        await expect(emptyMessage).toBeVisible();
        await expect(emptyMessage).toContainText('No saved versions');
      }
    });

    test('version item shows timestamp', async ({ page }) => {
      await formHelper.saveVersionWithLabel('Timestamp Test');
      await page.waitForTimeout(1000);

      const timeElement = page.locator('.history-item-time').first();
      const timeText = await timeElement.textContent();

      // Should have some timestamp text
      expect(timeText).toBeTruthy();
      expect(timeText!.length).toBeGreaterThan(0);
    });
  });

  test.describe('Version History Section UI', () => {
    test('history section can be collapsed', async ({ page }) => {
      const historySection = page.locator('.history-section');
      const header = historySection.locator('.section-header');

      // Click to collapse
      await header.click();
      await page.waitForTimeout(300);

      await expect(historySection).toHaveClass(/collapsed/);

      // Click to expand
      await header.click();
      await page.waitForTimeout(300);

      await expect(historySection).not.toHaveClass(/collapsed/);
    });

    test('save version modal can be closed', async ({ page }) => {
      await formHelper.clickSaveVersion();

      const modal = page.locator('#save-version-modal');
      await expect(modal).toHaveClass(/active/);

      // Close via X button
      await page.click('#save-version-close');
      await expect(modal).not.toHaveClass(/active/);
    });

    test('save version modal closes on outside click', async ({ page }) => {
      await formHelper.clickSaveVersion();

      const modal = page.locator('#save-version-modal');
      await expect(modal).toHaveClass(/active/);

      // Click outside (on overlay)
      await modal.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(300);

      await expect(modal).not.toHaveClass(/active/);
    });

    test('escape key closes save modal', async ({ page }) => {
      await formHelper.clickSaveVersion();

      const modal = page.locator('#save-version-modal');
      await expect(modal).toHaveClass(/active/);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await expect(modal).not.toHaveClass(/active/);
    });
  });
});
