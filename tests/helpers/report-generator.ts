/**
 * Bug Report Generator for E2E Tests
 * Generates structured JSON reports of found bugs
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Bug {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  steps: string[];
  expected: string;
  actual: string;
  selector?: string;
  screenshot?: string;
  timestamp: string;
}

export interface BugReport {
  generated: string;
  totalBugs: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<string, number>;
  bugs: Bug[];
}

export class BugReportGenerator {
  private bugs: Bug[] = [];
  private bugCounter = 0;

  /**
   * Add a bug to the report
   */
  addBug(bug: Omit<Bug, 'id' | 'timestamp'>): void {
    this.bugCounter++;
    this.bugs.push({
      ...bug,
      id: `BUG-${String(this.bugCounter).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add a color application bug
   */
  addColorBug(
    fieldName: string,
    expectedColor: string,
    actualColor: string,
    selector: string
  ): void {
    this.addBug({
      category: 'color-application',
      severity: 'high',
      title: `Color not applied for ${fieldName}`,
      steps: [
        `1. Set ${fieldName} to ${expectedColor}`,
        '2. Wait for preview to update',
        `3. Check CSS value at ${selector}`,
      ],
      expected: `Element should have color ${expectedColor}`,
      actual: `Element has color ${actualColor}`,
      selector,
    });
  }

  /**
   * Add a border radius bug
   */
  addBorderRadiusBug(
    elementName: string,
    expectedRadius: string,
    actualRadius: string,
    selector: string
  ): void {
    this.addBug({
      category: 'border-radius',
      severity: 'medium',
      title: `Border radius not applied to ${elementName}`,
      steps: [
        `1. Set border radius to ${expectedRadius}`,
        '2. Wait for preview to update',
        `3. Check border-radius of ${elementName}`,
      ],
      expected: `Element should have border-radius: ${expectedRadius}`,
      actual: `Element has border-radius: ${actualRadius}`,
      selector,
    });
  }

  /**
   * Add a section hiding bug
   */
  addSectionHidingBug(sectionId: string, stillVisible: boolean): void {
    this.addBug({
      category: 'section-hiding',
      severity: 'medium',
      title: `Section "${sectionId}" not hiding correctly`,
      steps: [
        `1. Click hide button for section "${sectionId}"`,
        '2. Wait for preview to update',
        '3. Check if section is rendered in preview',
      ],
      expected: 'Section should not be rendered in preview',
      actual: stillVisible ? 'Section is still visible in preview' : 'Section structure incorrect',
    });
  }

  /**
   * Add a field hiding bug
   */
  addFieldHidingBug(fieldName: string): void {
    this.addBug({
      category: 'field-hiding',
      severity: 'medium',
      title: `Field "${fieldName}" content still appears when hidden`,
      steps: [
        `1. Fill field "${fieldName}" with test value`,
        `2. Click hide button for field "${fieldName}"`,
        '3. Wait for preview to update',
        '4. Check if content appears in preview',
      ],
      expected: 'Field content should not appear in generated HTML',
      actual: 'Field content is still present',
    });
  }

  /**
   * Add a preview sync bug
   */
  addPreviewSyncBug(fieldName: string, expectedValue: string, actualValue: string): void {
    this.addBug({
      category: 'preview-sync',
      severity: 'high',
      title: `Preview not updating for ${fieldName}`,
      steps: [
        `1. Change ${fieldName} value to "${expectedValue}"`,
        '2. Wait for debounce (300ms+)',
        '3. Check preview content',
      ],
      expected: `Preview should show "${expectedValue}"`,
      actual: `Preview shows "${actualValue}"`,
    });
  }

  /**
   * Add a content mismatch bug (like "4 steps" but only 3 rendered)
   */
  addContentMismatchBug(
    title: string,
    expected: string,
    actual: string,
    selector?: string
  ): void {
    this.addBug({
      category: 'content-mismatch',
      severity: 'high',
      title,
      steps: [
        '1. Load the generator',
        '2. Check the affected content area',
      ],
      expected,
      actual,
      selector,
    });
  }

  /**
   * Add a version history bug
   */
  addVersionHistoryBug(action: string, issue: string): void {
    this.addBug({
      category: 'version-history',
      severity: 'medium',
      title: `Version history ${action} issue`,
      steps: [
        `1. Perform ${action} action`,
        '2. Check result',
      ],
      expected: `${action} should work correctly`,
      actual: issue,
    });
  }

  /**
   * Add an export bug
   */
  addExportBug(issue: string): void {
    this.addBug({
      category: 'export',
      severity: 'high',
      title: 'HTML export issue',
      steps: [
        '1. Fill form with test data',
        '2. Click Generate HTML',
        '3. Check generated output',
      ],
      expected: 'Generated HTML should match form configuration',
      actual: issue,
    });
  }

  /**
   * Add a theme toggle bug
   */
  addThemeBug(issue: string): void {
    this.addBug({
      category: 'theme',
      severity: 'low',
      title: 'Theme toggle issue',
      steps: [
        '1. Click theme toggle',
        '2. Check theme change',
      ],
      expected: 'Theme should toggle between light and dark',
      actual: issue,
    });
  }

  /**
   * Generate the final report
   */
  generateReport(): BugReport {
    const bySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byCategory: Record<string, number> = {};

    this.bugs.forEach(bug => {
      bySeverity[bug.severity]++;
      byCategory[bug.category] = (byCategory[bug.category] || 0) + 1;
    });

    return {
      generated: new Date().toISOString(),
      totalBugs: this.bugs.length,
      bySeverity,
      byCategory,
      bugs: this.bugs,
    };
  }

  /**
   * Save the report to a JSON file
   */
  saveReport(filePath: string): void {
    const report = this.generateReport();
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Get the current bug count
   */
  getBugCount(): number {
    return this.bugs.length;
  }

  /**
   * Get bugs by category
   */
  getBugsByCategory(category: string): Bug[] {
    return this.bugs.filter(bug => bug.category === category);
  }

  /**
   * Get bugs by severity
   */
  getBugsBySeverity(severity: Bug['severity']): Bug[] {
    return this.bugs.filter(bug => bug.severity === severity);
  }

  /**
   * Clear all bugs (for fresh test run)
   */
  clear(): void {
    this.bugs = [];
    this.bugCounter = 0;
  }
}

// Singleton instance for use across tests
export const bugReporter = new BugReportGenerator();
