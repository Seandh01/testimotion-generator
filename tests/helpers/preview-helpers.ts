/**
 * Preview Helper Utilities for E2E Tests
 * Provides methods for verifying the preview iframe content
 */

import { Page, Frame } from '@playwright/test';

export class PreviewHelper {
  constructor(private page: Page) {}

  /**
   * Get the preview iframe
   */
  async getPreviewFrame(): Promise<Frame> {
    const iframe = this.page.frameLocator('#preview-iframe');
    // Return the frame after waiting for it to be available
    await this.page.waitForSelector('#preview-iframe');
    const frame = this.page.frame({ name: '' }) || this.page.frames()[1];
    if (!frame) {
      throw new Error('Preview iframe not found');
    }
    return frame;
  }

  /**
   * Get text content from the preview by selector
   */
  async getPreviewText(selector: string): Promise<string> {
    const iframe = this.page.frameLocator('#preview-iframe');
    try {
      const locator = iframe.locator(selector).first();
      // Wait for element to be attached to DOM first
      await locator.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {});
      // Then wait for it to be visible
      await locator.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      const text = await locator.textContent({ timeout: 5000 }).catch(() => '');
      return (text || '').trim();
    } catch {
      return '';
    }
  }

  /**
   * Check if an element exists in the preview
   */
  async elementExistsInPreview(selector: string): Promise<boolean> {
    const iframe = this.page.frameLocator('#preview-iframe');
    const count = await iframe.locator(selector).count();
    return count > 0;
  }

  /**
   * Check if an element is visible in the preview
   */
  async elementVisibleInPreview(selector: string): Promise<boolean> {
    const iframe = this.page.frameLocator('#preview-iframe');
    return await iframe.locator(selector).isVisible();
  }

  /**
   * Get a CSS property value from an element in the preview
   */
  async getPreviewCSSProperty(selector: string, property: string): Promise<string> {
    const iframe = this.page.frameLocator('#preview-iframe');
    try {
      const locator = iframe.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const value = await locator.evaluate((el, prop) => {
        return window.getComputedStyle(el).getPropertyValue(prop);
      }, property).catch(() => '');
      return value;
    } catch {
      return '';
    }
  }

  /**
   * Get a CSS variable value from the preview's :root
   */
  async getPreviewCSSVariable(variableName: string): Promise<string> {
    const iframe = this.page.frameLocator('#preview-iframe');
    try {
      const locator = iframe.locator('body').first();
      await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const value = await locator.evaluate((body, varName) => {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      }, variableName).catch(() => '');
      return value;
    } catch {
      return '';
    }
  }

  /**
   * Get the computed border-radius of an element in the preview
   */
  async getPreviewBorderRadius(selector: string): Promise<string> {
    return await this.getPreviewCSSProperty(selector, 'border-radius');
  }

  /**
   * Get the computed background color of an element in the preview
   */
  async getPreviewBackgroundColor(selector: string): Promise<string> {
    return await this.getPreviewCSSProperty(selector, 'background-color');
  }

  /**
   * Check if an element's color matches expected (handles rgb/hex conversion)
   */
  async colorMatches(selector: string, property: string, expectedHex: string): Promise<boolean> {
    const actual = await this.getPreviewCSSProperty(selector, property);
    const expectedRgb = hexToRgb(expectedHex);
    return actual.includes(expectedRgb) || normalizeColor(actual) === normalizeColor(expectedHex);
  }

  /**
   * Get the hero headline text from preview
   */
  async getHeroHeadline(): Promise<string> {
    return await this.getPreviewText('h1[data-ghl-token="hero_headline"], h1');
  }

  /**
   * Get the hero subheadline text from preview
   */
  async getHeroSubheadline(): Promise<string> {
    return await this.getPreviewText('p[data-ghl-token="hero_subheadline"]');
  }

  /**
   * Get the CTA button text from preview
   */
  async getCTAButtonText(): Promise<string> {
    return await this.getPreviewText('a.btn-cta[data-ghl-token="cta_button_text"], a.btn-cta');
  }

  /**
   * Check if a section is rendered in the preview
   */
  async sectionExists(sectionClass: string): Promise<boolean> {
    return await this.elementExistsInPreview(`.${sectionClass}`);
  }

  /**
   * Count the number of step cards in the preview
   */
  async countStepCards(): Promise<number> {
    const iframe = this.page.frameLocator('#preview-iframe');
    // Step cards have .step-number inside them
    return await iframe.locator('.step-number').count();
  }

  /**
   * Count the number of review cards in the preview
   */
  async countReviewCards(): Promise<number> {
    const iframe = this.page.frameLocator('#preview-iframe');
    return await iframe.locator('.google-review-card').count();
  }

  /**
   * Count the number of video testimonial cards in the preview
   */
  async countVideoTestimonials(): Promise<number> {
    const iframe = this.page.frameLocator('#preview-iframe');
    return await iframe.locator('.video-testimonial-card').count();
  }

  /**
   * Wait for the preview to update after form changes
   */
  async waitForPreviewUpdate(timeout = 1000): Promise<void> {
    // Wait for debounce
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Take a screenshot of the preview iframe
   */
  async screenshotPreview(path: string): Promise<void> {
    const iframe = this.page.locator('#preview-iframe');
    await iframe.screenshot({ path });
  }

  /**
   * Get the modal content when a video testimonial is clicked
   */
  async getModalIframeSrc(): Promise<string | null> {
    const iframe = this.page.frameLocator('#preview-iframe');
    const modal = iframe.locator('.video-modal iframe, .modal iframe');
    if (await modal.count() > 0) {
      return await modal.getAttribute('src');
    }
    return null;
  }
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

// Helper function to normalize color values
function normalizeColor(color: string): string {
  // Remove spaces and convert to lowercase
  return color.toLowerCase().replace(/\s/g, '');
}
