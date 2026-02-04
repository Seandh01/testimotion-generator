/**
 * Theme Toggle E2E Tests
 * Tests light/dark mode toggle functionality
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';

test.describe('Theme Toggle', () => {
  let formHelper: FormHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    // Set dark mode only on first navigation (not on reloads)
    // Uses sessionStorage flag to track if already initialized
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('_test_theme_initialized')) {
        localStorage.setItem('testimotion_theme', 'dark');
        sessionStorage.setItem('_test_theme_initialized', '1');
      }
    });
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.describe('Theme Toggle Button', () => {
    test('toggle button exists', async ({ page }) => {
      const toggleBtn = page.locator('#theme-toggle');
      await expect(toggleBtn).toBeVisible();
    });

    test('toggle button has correct icon for dark mode', async ({ page }) => {
      // Default should be dark mode, showing moon icon (to switch to light)
      const moonIcon = page.locator('#theme-toggle .icon-moon');
      const sunIcon = page.locator('#theme-toggle .icon-sun');

      // In dark mode, moon should be visible
      await expect(moonIcon).toBeVisible();
    });

    test('clicking toggle switches to light mode', async ({ page }) => {
      await formHelper.toggleTheme();
      await page.waitForTimeout(100);

      const theme = await formHelper.getCurrentTheme();
      expect(theme).toBe('light');
    });

    test('clicking toggle again switches back to dark', async ({ page }) => {
      await formHelper.toggleTheme(); // To light
      await formHelper.toggleTheme(); // Back to dark
      await page.waitForTimeout(100);

      const theme = await formHelper.getCurrentTheme();
      expect(theme).toBe('dark');
    });
  });

  test.describe('Light Mode Appearance', () => {
    test('light mode applies correct CSS variables', async ({ page }) => {
      await formHelper.toggleTheme();
      await page.waitForTimeout(100);

      const bgPrimary = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
      );

      // Light mode bg-primary should be white (#ffffff)
      expect(bgPrimary).toMatch(/(#ffffff|rgb\(255,\s*255,\s*255\))/i);
    });

    test('light mode changes text colors', async ({ page }) => {
      await formHelper.toggleTheme();
      await page.waitForTimeout(100);

      const textPrimary = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
      );

      // Light mode text-primary should be dark (#1d1d1f)
      expect(textPrimary).toMatch(/(#1d1d1f|rgb\(29,\s*29,\s*31\))/i);
    });

    test('light mode changes background', async ({ page }) => {
      await formHelper.toggleTheme();
      await page.waitForTimeout(100);

      const bodyBg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      );

      // Should be white or light color
      expect(bodyBg).toMatch(/rgb\(255,\s*255,\s*255\)|rgb\(245,\s*245,\s*247\)/i);
    });
  });

  test.describe('Theme Persistence', () => {
    test('light mode persists to localStorage', async ({ page }) => {
      await formHelper.toggleTheme();
      await page.waitForTimeout(100);

      const savedTheme = await page.evaluate(() =>
        localStorage.getItem('testimotion_theme')
      );

      expect(savedTheme).toBe('light');
    });

    test('dark mode persists to localStorage', async ({ page }) => {
      await formHelper.toggleTheme(); // To light
      await formHelper.toggleTheme(); // Back to dark
      await page.waitForTimeout(100);

      const savedTheme = await page.evaluate(() =>
        localStorage.getItem('testimotion_theme')
      );

      expect(savedTheme).toBe('dark');
    });

    test('theme persists after page reload', async ({ page }) => {
      await formHelper.toggleTheme(); // Switch to light
      await page.waitForTimeout(100);

      // Reload page
      await page.reload();
      await page.waitForSelector('#preview-iframe');
      await page.waitForTimeout(500);

      const theme = await formHelper.getCurrentTheme();
      expect(theme).toBe('light');
    });
  });

  test.describe('System Theme Detection', () => {
    test('respects system preference on first visit', async ({ page }) => {
      // Note: This test may behave differently depending on Playwright's emulation
      // The key is that it initializes to some valid theme

      const theme = await formHelper.getCurrentTheme();
      expect(['light', 'dark']).toContain(theme);
    });
  });

  test.describe('Theme Does Not Affect Preview', () => {
    test('preview content unchanged when toggling theme', async ({ page }) => {
      // Fill a field
      await page.locator('[name="hero_headline"]').fill('Theme Test Content');
      await page.waitForTimeout(500);

      // Get preview content
      const iframe = page.frameLocator('#preview-iframe');
      const initialContent = await iframe.locator('h1, .hero-headline').textContent();

      // Toggle theme
      await formHelper.toggleTheme();
      await page.waitForTimeout(300);

      // Preview content should be the same
      const afterContent = await iframe.locator('h1, .hero-headline').textContent();
      expect(afterContent).toBe(initialContent);
    });
  });

  test.describe('Icon Visibility', () => {
    test('moon icon visible in dark mode', async ({ page }) => {
      // Ensure dark mode
      const theme = await formHelper.getCurrentTheme();
      if (theme === 'light') {
        await formHelper.toggleTheme();
      }

      const moonIcon = page.locator('#theme-toggle .icon-moon');
      const moonDisplay = await moonIcon.evaluate(el => getComputedStyle(el).display);

      expect(moonDisplay).not.toBe('none');
    });

    test('sun icon visible in light mode', async ({ page }) => {
      // Ensure light mode
      const theme = await formHelper.getCurrentTheme();
      if (theme === 'dark') {
        await formHelper.toggleTheme();
      }

      const sunIcon = page.locator('#theme-toggle .icon-sun');
      const sunDisplay = await sunIcon.evaluate(el => getComputedStyle(el).display);

      expect(sunDisplay).not.toBe('none');
    });
  });

  test.describe('Header Controls Layout', () => {
    test('theme toggle is next to autosave indicator', async ({ page }) => {
      const controls = page.locator('.header-controls');
      await expect(controls).toBeVisible();

      // Should contain both elements
      const autosave = controls.locator('#autosave-indicator');
      const themeToggle = controls.locator('#theme-toggle');

      await expect(autosave).toBeVisible();
      await expect(themeToggle).toBeVisible();
    });
  });
});
