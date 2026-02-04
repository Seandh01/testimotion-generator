/**
 * Form Helper Utilities for E2E Tests
 * Provides methods for interacting with the generator form
 */

import { Page, Locator } from '@playwright/test';
import { getFieldInfo } from '../fixtures/test-data';

export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill a form field by its name attribute
   */
  async fillField(fieldName: string, value: string): Promise<void> {
    const field = this.page.locator(`[name="${fieldName}"]`);
    const fieldInfo = getFieldInfo(fieldName);

    if (!fieldInfo) {
      throw new Error(`Unknown field: ${fieldName}`);
    }

    if (fieldInfo.type === 'select') {
      await field.selectOption(value);
    } else {
      await field.fill(value);
    }
  }

  /**
   * Get the current value of a form field
   */
  async getFieldValue(fieldName: string): Promise<string> {
    const field = this.page.locator(`[name="${fieldName}"]`);
    return await field.inputValue();
  }

  /**
   * Click the hide toggle for a field
   */
  async toggleFieldHide(fieldName: string): Promise<void> {
    const btn = this.page.locator(`.btn-hide[data-field="${fieldName}"]`);
    await btn.click();
  }

  /**
   * Check if a field is hidden
   */
  async isFieldHidden(fieldName: string): Promise<boolean> {
    const btn = this.page.locator(`.btn-hide[data-field="${fieldName}"]`);
    return await btn.evaluate(el => el.classList.contains('hidden'));
  }

  /**
   * Click the hide toggle for a section
   */
  async toggleSectionHide(sectionId: string): Promise<void> {
    const btn = this.page.locator(`.btn-section-hide[data-section="${sectionId}"]`);
    await btn.click();
  }

  /**
   * Check if a section is hidden
   */
  async isSectionHidden(sectionId: string): Promise<boolean> {
    const btn = this.page.locator(`.btn-section-hide[data-section="${sectionId}"]`);
    return await btn.evaluate(el => el.classList.contains('hidden'));
  }

  /**
   * Expand a collapsed section
   */
  async expandSection(sectionId: string): Promise<void> {
    const section = this.page.locator(`[data-section-id="${sectionId}"]`);
    const isCollapsed = await section.evaluate(el => el.classList.contains('collapsed'));
    if (isCollapsed) {
      await section.locator('.section-header').click();
    }
  }

  /**
   * Fill a color field (both picker and text input)
   */
  async fillColorField(fieldName: string, hexColor: string): Promise<void> {
    const textInput = this.page.locator(`[name="${fieldName}"]`);
    await textInput.fill(hexColor);
    // Trigger input event for color picker sync
    await textInput.dispatchEvent('input');
  }

  /**
   * Set border radius using the slider
   */
  async setBorderRadius(value: number): Promise<void> {
    const numberInput = this.page.locator('#border_radius');
    await numberInput.fill(value.toString());
    await numberInput.dispatchEvent('input');
  }

  /**
   * Click the Generate HTML button
   */
  async clickGenerate(): Promise<void> {
    await this.page.click('#btn-generate');
  }

  /**
   * Click the Reset button
   */
  async clickReset(): Promise<void> {
    // Handle the confirmation dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await this.page.click('#btn-reset');
  }

  /**
   * Click the Copy Link button
   */
  async clickCopyLink(): Promise<void> {
    await this.page.click('#btn-copy-link');
  }

  /**
   * Click the Save Version button
   */
  async clickSaveVersion(): Promise<void> {
    await this.page.click('#btn-save-version');
  }

  /**
   * Save a version with a label
   */
  async saveVersionWithLabel(label: string): Promise<void> {
    await this.clickSaveVersion();
    await this.page.fill('#version-label-input', label);
    await this.page.click('#btn-confirm-save');
  }

  /**
   * Load a version by clicking its load button
   */
  async loadVersion(versionId: string): Promise<void> {
    await this.page.click(`.history-btn.load[data-id="${versionId}"]`);
  }

  /**
   * Delete a version by clicking its delete button
   */
  async deleteVersion(versionId: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await this.page.click(`.history-btn.delete[data-id="${versionId}"]`);
  }

  /**
   * Get the list of saved versions
   */
  async getVersionList(): Promise<{ id: string; label: string }[]> {
    const items = this.page.locator('.history-item');
    const count = await items.count();
    const versions: { id: string; label: string }[] = [];

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const id = await item.getAttribute('data-id') || '';
      const label = await item.locator('.history-item-label').textContent() || '';
      versions.push({ id, label });
    }

    return versions;
  }

  /**
   * Toggle the theme
   */
  async toggleTheme(): Promise<void> {
    await this.page.click('#theme-toggle');
  }

  /**
   * Get the current theme
   */
  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const theme = await this.page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    return theme === 'light' ? 'light' : 'dark';
  }

  /**
   * Wait for autosave indicator to show saving state
   */
  async waitForAutosave(): Promise<void> {
    await this.page.locator('#autosave-indicator.saving').waitFor({ state: 'visible', timeout: 2000 });
    await this.page.locator('#autosave-indicator:not(.saving)').waitFor({ state: 'visible', timeout: 3000 });
  }

  /**
   * Set viewport mode (desktop, tablet, mobile)
   */
  async setViewport(mode: 'desktop' | 'tablet' | 'mobile'): Promise<void> {
    await this.page.click(`.viewport-btn[data-viewport="${mode}"]`);
  }

  /**
   * Select output language for AI copy
   */
  async selectCopyLanguage(lang: 'nl' | 'en'): Promise<void> {
    await this.page.click(`.lang-btn[data-lang="${lang}"]`);
  }
}
