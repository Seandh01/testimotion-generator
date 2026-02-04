/**
 * Bug Detection E2E Tests
 * Specifically tests for known bugs and generates a bug report
 */

import { test, expect } from '@playwright/test';
import { FormHelper } from '../helpers/form-helpers';
import { PreviewHelper } from '../helpers/preview-helpers';
import { bugReporter, BugReportGenerator } from '../helpers/report-generator';
import * as path from 'path';

// Use a fresh reporter for bug detection tests
const reporter = new BugReportGenerator();

test.describe('Bug Detection', () => {
  let formHelper: FormHelper;
  let previewHelper: PreviewHelper;

  test.beforeEach(async ({ page }) => {
    formHelper = new FormHelper(page);
    previewHelper = new PreviewHelper(page);
    await page.goto('/');
    await page.waitForSelector('#preview-iframe');
    await page.waitForTimeout(500);
  });

  test.afterAll(async () => {
    // Save bug report after all tests
    const reportPath = path.join(process.cwd(), 'tests', 'reports', 'bug-report.json');
    reporter.saveReport(reportPath);
    console.log(`Bug report saved to: ${reportPath}`);
    console.log(`Total bugs found: ${reporter.getBugCount()}`);
  });

  test.describe('Known Bug: Colors Falling Back to Green (#0b9a9a)', () => {
    test('detect green fallback in primary color', async ({ page }) => {
      const testColor = '#ff0000'; // Bright red
      await formHelper.fillColorField('brand_primary_color', testColor);
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML
      await formHelper.clickGenerate();
      await page.waitForSelector('#modal-overlay.active');
      const html = await page.locator('#output-textarea').inputValue();

      // Check for green fallback
      if (html.includes('0b9a9a') && !html.includes('ff0000')) {
        reporter.addColorBug(
          'brand_primary_color',
          testColor,
          '#0b9a9a (green fallback)',
          'Generated HTML'
        );
        test.info().annotations.push({ type: 'bug', description: 'Primary color falls back to green' });
      }

      await page.click('#modal-close');
    });

    test('detect green fallback in secondary color', async ({ page }) => {
      const testColor = '#0000ff'; // Blue
      await formHelper.fillColorField('brand_secondary_color', testColor);
      await previewHelper.waitForPreviewUpdate();

      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      if (html.includes('0b9a9a') && !html.includes('0000ff')) {
        reporter.addColorBug(
          'brand_secondary_color',
          testColor,
          '#0b9a9a (green fallback)',
          'Generated HTML'
        );
        test.info().annotations.push({ type: 'bug', description: 'Secondary color falls back to green' });
      }

      await page.click('#modal-close');
    });
  });

  test.describe('Known Bug: Modal Iframe Hardcoded Border Radius', () => {
    test('detect hardcoded 8px on modal iframe', async ({ page }) => {
      // Set a different border radius
      const advancedSection = page.locator('.section-header:has-text("Advanced")');
      await advancedSection.click();
      await page.waitForTimeout(300);

      await formHelper.setBorderRadius(24);
      await previewHelper.waitForPreviewUpdate();

      // Generate and check HTML
      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Look for hardcoded 8px near modal/iframe related code
      const modalSection = html.match(/\.video-modal[^}]*\{[^}]*border-radius[^}]*\}/gi);
      const iframeSection = html.match(/iframe[^}]*\{[^}]*border-radius:\s*8px[^}]*\}/gi);

      if (iframeSection && iframeSection.length > 0) {
        reporter.addBorderRadiusBug(
          'Modal/Video iframe',
          '24px (from --radius)',
          '8px (hardcoded)',
          '.video-modal iframe'
        );
        test.info().annotations.push({ type: 'bug', description: 'Modal iframe has hardcoded border-radius' });
      }

      await page.click('#modal-close');
    });
  });

  test.describe('Known Bug: Process Steps Count Mismatch', () => {
    test('detect "4 steps" headline with only 3 steps rendered', async ({ page }) => {
      // Check if default headline mentions 4 steps
      await formHelper.expandSection('process_steps');
      const headline = await formHelper.getFieldValue('process_headline');

      // Check preview for step count
      const stepCount = await previewHelper.countStepCards();

      // If headline says 4 but only 3 steps render
      if (headline.toLowerCase().includes('4') && stepCount === 3) {
        reporter.addContentMismatchBug(
          'Process headline mentions "4 steps" but only 3 rendered',
          '4 step cards to match headline',
          `Only ${stepCount} step cards rendered`,
          '.process-headline, .step-card'
        );
        test.info().annotations.push({ type: 'bug', description: 'Step count mismatch' });
      }
    });
  });

  test.describe('Section Hiding Bugs', () => {
    test('verify all sections can be hidden', async ({ page }) => {
      const sections = ['hero', 'video', 'trust_badges', 'mini_testimonials',
                       'process_steps', 'google_reviews', 'video_testimonials',
                       'footer_cta', 'client_logos'];

      for (const sectionId of sections) {
        // Try to hide the section
        try {
          const btn = page.locator(`.btn-section-hide[data-section="${sectionId}"]`);
          const isVisible = await btn.isVisible();

          if (!isVisible) {
            reporter.addSectionHidingBug(sectionId, true);
            continue;
          }

          await btn.click();
          await page.waitForTimeout(200);

          // Check if it's marked as hidden
          const isHidden = await btn.evaluate(el => el.classList.contains('hidden'));
          if (!isHidden) {
            reporter.addSectionHidingBug(sectionId, true);
            test.info().annotations.push({ type: 'bug', description: `Section ${sectionId} hide toggle not working` });
          }

          // Toggle back for next test
          await btn.click();
          await page.waitForTimeout(100);
        } catch (e) {
          reporter.addSectionHidingBug(sectionId, true);
        }
      }
    });
  });

  test.describe('Field Value Application', () => {
    test('verify color inputs sync with color pickers', async ({ page }) => {
      const colorFields = [
        'brand_primary_color',
        'brand_secondary_color',
        'bg_gradient_start',
        'bg_gradient_end'
      ];

      for (const field of colorFields) {
        const picker = page.locator(`#${field}_picker`);
        const textInput = page.locator(`[name="${field}"]`);

        // Set via text input
        await textInput.fill('#123456');
        await textInput.dispatchEvent('input');
        await page.waitForTimeout(100);

        const pickerValue = await picker.inputValue();
        if (pickerValue.toLowerCase() !== '#123456') {
          reporter.addBug({
            category: 'color-sync',
            severity: 'low',
            title: `Color picker not syncing for ${field}`,
            steps: [
              `1. Enter #123456 in ${field} text input`,
              '2. Check color picker value'
            ],
            expected: 'Color picker should update to #123456',
            actual: `Color picker shows ${pickerValue}`,
            selector: `#${field}_picker`
          });
        }

        // Reset
        await textInput.fill('');
      }
    });
  });

  test.describe('Preview Update Bugs', () => {
    test('verify preview updates for all major fields', async ({ page }) => {
      const testCases = [
        { field: 'hero_headline', selector: 'h1, .hero-headline', expected: 'UNIQUE_HERO' },
        { field: 'hero_subheadline', selector: '.hero p, .hero-subheadline', expected: 'UNIQUE_SUB' },
        { field: 'cta_button_text', selector: '.cta-btn, .cta-button', expected: 'UNIQUE_CTA' },
      ];

      for (const { field, selector, expected } of testCases) {
        await formHelper.fillField(field, expected);
        await previewHelper.waitForPreviewUpdate();

        const exists = await previewHelper.elementExistsInPreview(selector);
        if (exists) {
          const text = await previewHelper.getPreviewText(selector);
          if (!text.includes(expected)) {
            reporter.addPreviewSyncBug(field, expected, text);
            test.info().annotations.push({ type: 'bug', description: `Preview not updating for ${field}` });
          }
        }
      }
    });
  });

  test.describe('Export Completeness', () => {
    test('verify generated HTML includes all filled fields', async ({ page }) => {
      // Fill various fields
      await formHelper.fillField('hero_headline', 'EXPORT_TEST_HEADLINE');
      await formHelper.fillField('hero_subheadline', 'EXPORT_TEST_SUBHEADLINE');
      await formHelper.fillField('cta_button_text', 'EXPORT_TEST_CTA');
      await formHelper.fillColorField('brand_primary_color', '#abcdef');
      await previewHelper.waitForPreviewUpdate();

      // Generate HTML
      await formHelper.clickGenerate();
      const html = await page.locator('#output-textarea').inputValue();

      // Check each value
      const missing: string[] = [];
      if (!html.includes('EXPORT_TEST_HEADLINE')) missing.push('hero_headline');
      if (!html.includes('EXPORT_TEST_SUBHEADLINE')) missing.push('hero_subheadline');
      if (!html.includes('EXPORT_TEST_CTA')) missing.push('cta_button_text');
      if (!html.includes('abcdef') && !html.includes('#abcdef')) missing.push('brand_primary_color');

      if (missing.length > 0) {
        reporter.addExportBug(`Missing fields in generated HTML: ${missing.join(', ')}`);
        test.info().annotations.push({ type: 'bug', description: 'Export missing fields' });
      }

      await page.click('#modal-close');
    });
  });

  test.describe('UI Element Bugs', () => {
    test('verify all section headers are clickable', async ({ page }) => {
      const headers = page.locator('.section-header');
      const count = await headers.count();

      for (let i = 0; i < count; i++) {
        const header = headers.nth(i);
        const section = header.locator('..');

        try {
          // Get initial collapsed state
          const wasCollapsed = await section.evaluate(el => el.classList.contains('collapsed'));

          // Click header
          await header.click();
          await page.waitForTimeout(200);

          // Check if state changed
          const isCollapsed = await section.evaluate(el => el.classList.contains('collapsed'));

          if (wasCollapsed === isCollapsed) {
            const sectionText = await header.textContent();
            reporter.addBug({
              category: 'ui',
              severity: 'low',
              title: `Section header not toggling: ${sectionText}`,
              steps: ['1. Click section header', '2. Check if section expands/collapses'],
              expected: 'Section should toggle collapsed state',
              actual: 'Section state did not change'
            });
          }
        } catch (e) {
          // Some headers might not have sections
        }
      }
    });
  });

  test.describe('Generate Bug Report Summary', () => {
    test('output bug summary', async () => {
      const report = reporter.generateReport();

      console.log('\n=== BUG REPORT SUMMARY ===');
      console.log(`Total bugs found: ${report.totalBugs}`);
      console.log(`By severity: Critical=${report.bySeverity.critical}, High=${report.bySeverity.high}, Medium=${report.bySeverity.medium}, Low=${report.bySeverity.low}`);
      console.log('By category:', JSON.stringify(report.byCategory, null, 2));

      if (report.bugs.length > 0) {
        console.log('\nBugs found:');
        report.bugs.forEach(bug => {
          console.log(`  - [${bug.severity.toUpperCase()}] ${bug.id}: ${bug.title}`);
        });
      }

      // This test always passes - it just outputs the summary
      expect(true).toBe(true);
    });
  });
});
