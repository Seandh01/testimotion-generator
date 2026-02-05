import { generateTemplate } from './template.js';
import { DEFAULTS } from './defaults.js';
import {
  fetchVersions,
  saveVersion,
  loadVersion,
  deleteVersion,
  formatTimestamp,
  migrateLocalToSupabase
} from './history.js';
import {
  initAuth,
  loginWithMagicLink,
  logout,
  getCurrentUser,
  isAuthenticated,
  getUserEmail,
  onAuthStateChange,
  isAuthAvailable
} from './auth.js';
import { initFontPickers, getSelectedWeight } from './font-picker.js';

const STORAGE_KEY = 'testimotion_form_data';
const THEME_STORAGE_KEY = 'testimotion_theme';

// Preview window reference
let previewWindow = null;

// ============================================
// THEME MANAGEMENT
// ============================================

// Get system color scheme preference
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

// Initialize theme on page load
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = savedTheme || getSystemTheme();

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        if (e.matches) {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    });
  }
}

// Toggle between light and dark themes
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');

  if (currentTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  }
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get hidden fields from DOM
function getHiddenFields() {
  return [...document.querySelectorAll('.btn-hide.hidden')]
    .map(btn => btn.dataset.field);
}

// Get hidden sections from DOM
function getHiddenSections() {
  return [...document.querySelectorAll('.btn-section-hide.hidden')]
    .map(btn => btn.dataset.section);
}

// Load form state from localStorage
function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // Restore form values
      Object.entries(data.values || {}).forEach(([key, value]) => {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) {
          el.value = value;
          // Sync color picker with text input
          if (el.type === 'text' && el.closest('.color-input-wrapper')) {
            const colorPicker = el.closest('.color-input-wrapper').querySelector('input[type="color"]');
            if (colorPicker && value.match(/^#[0-9A-Fa-f]{6}$/)) {
              colorPicker.value = value;
            }
          }
        }
      });
      // Restore hidden fields
      (data.hidden || []).forEach(field => {
        const btn = document.querySelector(`[data-field="${field}"]`);
        if (btn) {
          btn.classList.add('hidden');
          const formGroup = btn.closest('.form-group');
          if (formGroup) formGroup.classList.add('field-hidden');
        }
      });
      // Restore hidden sections
      (data.hiddenSections || []).forEach(section => {
        const btn = document.querySelector(`.btn-section-hide[data-section="${section}"]`);
        if (btn) {
          btn.classList.add('hidden');
          const sectionEl = btn.closest('.section');
          if (sectionEl) sectionEl.classList.add('section-hidden');
        }
      });
      // Restore section order
      if (data.sectionOrder && data.sectionOrder.length > 0) {
        applySectionOrder(data.sectionOrder);
      }
      return true;
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  }
  return false;
}

// Load form state from URL (fallback if no localStorage)
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.toString()) {
    params.forEach((value, key) => {
      const el = document.querySelector(`[name="${key}"]`);
      if (el) {
        el.value = value;
        // Sync color picker with text input
        if (el.type === 'text' && el.closest('.color-input-wrapper')) {
          const colorPicker = el.closest('.color-input-wrapper').querySelector('input[type="color"]');
          if (colorPicker && value.match(/^#[0-9A-Fa-f]{6}$/)) {
            colorPicker.value = value;
          }
        }
      }
    });
    return true;
  }
  return false;
}

// Load default values from DEFAULTS
function loadDefaults() {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    const el = document.querySelector(`[name="${key}"]`);
    if (el && value) {
      el.value = value;
      // Sync color picker with text input
      if (el.type === 'text' && el.closest('.color-input-wrapper')) {
        const colorPicker = el.closest('.color-input-wrapper').querySelector('input[type="color"]');
        if (colorPicker && value.match(/^#[0-9A-Fa-f]{6}$/)) {
          colorPicker.value = value;
        }
      }
    }
  });
}

// Save form state to localStorage
function saveToStorage() {
  const values = getFormValues();
  const hidden = getHiddenFields();
  const hiddenSections = getHiddenSections();
  const sectionOrder = getSectionOrder();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, hidden, hiddenSections, sectionOrder }));

  // Update autosave indicator
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) {
    indicator.classList.add('saving');
    setTimeout(() => indicator.classList.remove('saving'), 1000);
  }
}

// Save form state to URL (for sharing)
function saveToURL() {
  const params = new URLSearchParams();
  document.querySelectorAll('[name]').forEach(el => {
    if (el.value && el.value.trim()) {
      params.set(el.name, el.value.trim());
    }
  });
  const newURL = params.toString() ? '?' + params.toString() : window.location.pathname;
  history.replaceState(null, '', newURL);
}

// Get all form values as object (excluding hidden fields for generation)
function getFormValues(excludeHidden = false) {
  const values = {};
  const hiddenFields = excludeHidden ? getHiddenFields() : [];
  const hiddenSections = excludeHidden ? getHiddenSections() : [];

  document.querySelectorAll('[name]').forEach(el => {
    if (el.name && el.value) {
      if (!excludeHidden || !hiddenFields.includes(el.name)) {
        values[el.name] = el.value.trim();
      }
    }
  });

  // Include hidden sections info for template rendering
  if (excludeHidden && hiddenSections.length > 0) {
    values._hiddenSections = hiddenSections;
  }

  // Include section order for template rendering
  values._sectionOrder = getSectionOrder();

  // Include selected font weights
  values._headingWeight = getSelectedWeight('heading_font');
  values._bodyWeight = getSelectedWeight('body_font');

  return values;
}

// Count filled video testimonials
function getFilledVideoCount() {
  let count = 0;
  for (let i = 1; i <= 3; i++) {
    const thumb = document.querySelector(`[name="video_testimonial_thumb_${i}"]`);
    if (thumb && thumb.value.trim()) count++;
  }
  return count;
}

// Generate HTML with replaced tokens
function generateHTML() {
  const values = getFormValues(true); // Exclude hidden fields
  const filledVideoCount = getFilledVideoCount();
  return generateTemplate(values, filledVideoCount);
}

// Update live preview
function updatePreview() {
  const iframe = document.getElementById('preview-iframe');
  const html = generateHTML();

  // Write to inline iframe
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Send to external preview window if open
  sendPreviewUpdate(html);
}

// Send update to external preview window
function sendPreviewUpdate(html) {
  if (previewWindow && !previewWindow.closed) {
    previewWindow.postMessage({ type: 'update', html }, '*');
  }
}

// Debounced functions
const debouncedUpdatePreview = debounce(updatePreview, 300);
const debouncedSaveToStorage = debounce(saveToStorage, 500);

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!');
  }
}

// Show output modal
function showOutputModal() {
  const html = generateHTML();
  document.getElementById('output-textarea').value = html;
  document.getElementById('modal-overlay').classList.add('active');
}

// Hide output modal
function hideOutputModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Copy shareable link
function copyLink() {
  saveToURL(); // Update URL first
  copyToClipboard(window.location.href);
}

// Copy generated HTML
function copyHTML() {
  const html = document.getElementById('output-textarea').value;
  copyToClipboard(html);
}

// Toggle section collapse
function toggleSection(sectionEl) {
  sectionEl.classList.toggle('collapsed');
}

// Toggle field visibility in output
function toggleFieldHide(btn) {
  btn.classList.toggle('hidden');
  const formGroup = btn.closest('.form-group');
  if (formGroup) {
    formGroup.classList.toggle('field-hidden');
  }
  debouncedSaveToStorage();
  debouncedUpdatePreview();
}

// Toggle section visibility in output
function toggleSectionHide(btn) {
  btn.classList.toggle('hidden');
  const section = btn.closest('.section');
  if (section) {
    section.classList.toggle('section-hidden');
  }
  debouncedSaveToStorage();
  debouncedUpdatePreview();
}

// Reset to defaults
function resetToDefaults() {
  if (!confirm('Reset all fields to defaults? This will clear your saved data.')) {
    return;
  }

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY);

  // Clear all form fields
  document.querySelectorAll('[name]').forEach(el => {
    el.value = '';
  });

  // Remove all hidden states
  document.querySelectorAll('.btn-hide.hidden').forEach(btn => {
    btn.classList.remove('hidden');
    const formGroup = btn.closest('.form-group');
    if (formGroup) formGroup.classList.remove('field-hidden');
  });

  // Remove all hidden section states
  document.querySelectorAll('.btn-section-hide.hidden').forEach(btn => {
    btn.classList.remove('hidden');
    const section = btn.closest('.section');
    if (section) section.classList.remove('section-hidden');
  });

  // Load defaults
  loadDefaults();

  // Update preview
  updatePreview();

  // Clear URL params
  history.replaceState(null, '', window.location.pathname);

  showToast('Reset to defaults');
}

// Sync color picker with text input
function syncColorInputs() {
  document.querySelectorAll('.color-input-wrapper').forEach(wrapper => {
    const colorPicker = wrapper.querySelector('input[type="color"]');
    const textInput = wrapper.querySelector('input[type="text"]');

    if (colorPicker && textInput) {
      colorPicker.addEventListener('input', () => {
        textInput.value = colorPicker.value;
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      textInput.addEventListener('input', () => {
        if (textInput.value.match(/^#[0-9A-Fa-f]{6}$/)) {
          colorPicker.value = textInput.value;
        }
      });
    }
  });
}

// Sync range slider with number input
function syncRangeInputs() {
  const slider = document.getElementById('border_radius_slider');
  const numberInput = document.getElementById('border_radius');

  if (slider && numberInput) {
    slider.addEventListener('input', () => {
      numberInput.value = slider.value;
      numberInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    numberInput.addEventListener('input', () => {
      const val = Math.max(0, Math.min(32, parseInt(numberInput.value) || 0));
      slider.value = val;
    });
  }
}

// Initialize hide toggle buttons
function initHideToggles() {
  document.querySelectorAll('.btn-hide').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFieldHide(btn);
    });
  });

  // Initialize section hide toggles
  document.querySelectorAll('.btn-section-hide').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSectionHide(btn);
    });
  });
}

// ============================================
// HISTORY FEATURES
// ============================================

// Show save version modal
function showSaveVersionModal() {
  document.getElementById('save-version-modal').classList.add('active');
  document.getElementById('version-label-input').value = '';
  document.getElementById('version-label-input').focus();
}

// Hide save version modal
function hideSaveVersionModal() {
  document.getElementById('save-version-modal').classList.remove('active');
}

// Save current form as a version
async function saveCurrentVersion() {
  const label = document.getElementById('version-label-input').value.trim();
  const values = getFormValues();
  const hidden = getHiddenFields();

  try {
    await saveVersion(label, values, hidden);
    hideSaveVersionModal();
    showToast('Version saved!');
    await refreshHistoryList();
  } catch (err) {
    console.error('Failed to save version:', err);
    showToast('Failed to save version', true);
  }
}

// Load a version into the form
async function loadVersionIntoForm(versionId) {
  try {
    const version = await loadVersion(versionId);
    if (!version) {
      showToast('Version not found', true);
      return;
    }

    // Clear current form
    document.querySelectorAll('[name]').forEach(el => {
      el.value = '';
    });

    // Clear hidden states
    document.querySelectorAll('.btn-hide.hidden').forEach(btn => {
      btn.classList.remove('hidden');
      const formGroup = btn.closest('.form-group');
      if (formGroup) formGroup.classList.remove('field-hidden');
    });

    // Clear hidden section states
    document.querySelectorAll('.btn-section-hide.hidden').forEach(btn => {
      btn.classList.remove('hidden');
      const section = btn.closest('.section');
      if (section) section.classList.remove('section-hidden');
    });

    // Load version values
    Object.entries(version.values || {}).forEach(([key, value]) => {
      const el = document.querySelector(`[name="${key}"]`);
      if (el) {
        el.value = value;
        // Sync color picker
        if (el.type === 'text' && el.closest('.color-input-wrapper')) {
          const colorPicker = el.closest('.color-input-wrapper').querySelector('input[type="color"]');
          if (colorPicker && value.match(/^#[0-9A-Fa-f]{6}$/)) {
            colorPicker.value = value;
          }
        }
      }
    });

    // Restore hidden fields
    (version.hidden || []).forEach(field => {
      const btn = document.querySelector(`[data-field="${field}"]`);
      if (btn) {
        btn.classList.add('hidden');
        const formGroup = btn.closest('.form-group');
        if (formGroup) formGroup.classList.add('field-hidden');
      }
    });

    // Save to localStorage and update preview
    saveToStorage();
    updatePreview();

    showToast(`Loaded: ${version.label}`);
  } catch (err) {
    console.error('Failed to load version:', err);
    showToast('Failed to load version', true);
  }
}

// Delete a version
async function deleteVersionById(versionId) {
  if (!confirm('Delete this version?')) return;

  try {
    await deleteVersion(versionId);
    showToast('Version deleted');
    await refreshHistoryList();
  } catch (err) {
    console.error('Failed to delete version:', err);
    showToast('Failed to delete version', true);
  }
}

// Refresh the history list UI
async function refreshHistoryList() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  try {
    const history = await fetchVersions();
    const versions = history.versions || [];
    const loggedIn = isAuthenticated();

    if (versions.length === 0) {
      if (!loggedIn && isAuthAvailable()) {
        // Show login prompt when not authenticated
        historyList.innerHTML = `
          <div class="history-auth-notice">
            <p>Versions are stored locally.</p>
            <p><a id="history-login-link">Login</a> to save versions to the cloud.</p>
          </div>
        `;
        // Add click handler
        const loginLink = document.getElementById('history-login-link');
        if (loginLink) {
          loginLink.addEventListener('click', showLoginModal);
        }
      } else {
        historyList.innerHTML = '<div class="history-empty">No saved versions</div>';
      }
      return;
    }

    // Build version list HTML
    let html = '';

    // Show cloud/local indicator
    if (!loggedIn && isAuthAvailable()) {
      html += `
        <div class="history-auth-notice" style="margin-bottom: 12px; padding: 12px;">
          <a id="history-login-link">Login</a> to sync versions to the cloud
        </div>
      `;
    }

    html += versions.map(v => `
      <div class="history-item" data-id="${v.id}">
        <div class="history-item-info">
          <span class="history-item-label">${escapeHtml(v.label)}</span>
          <span class="history-item-time">${formatTimestamp(v.timestamp)}</span>
        </div>
        <div class="history-item-actions">
          <button class="history-btn load" data-id="${v.id}" title="Load version">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </button>
          <button class="history-btn delete" data-id="${v.id}" title="Delete version">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    historyList.innerHTML = html;

    // Add event listeners
    const loginLink = document.getElementById('history-login-link');
    if (loginLink) {
      loginLink.addEventListener('click', showLoginModal);
    }

    historyList.querySelectorAll('.history-btn.load').forEach(btn => {
      btn.addEventListener('click', () => loadVersionIntoForm(btn.dataset.id));
    });

    historyList.querySelectorAll('.history-btn.delete').forEach(btn => {
      btn.addEventListener('click', () => deleteVersionById(btn.dataset.id));
    });
  } catch (err) {
    console.error('Failed to fetch history:', err);
    historyList.innerHTML = '<div class="history-empty">Failed to load history</div>';
  }
}

// HTML escape utility
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// AI BRAND EXTRACTION
// ============================================

// Store extracted brand data
let extractedBrandData = null;

// Extract brand from URL
async function extractBrand() {
  const urlInput = document.getElementById('extract_url');
  const extractBtn = document.getElementById('btn-extract-brand');
  const url = urlInput.value.trim();

  if (!url) {
    showToast('Please enter a website URL', true);
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    showToast('Please enter a valid URL', true);
    return;
  }

  // Show loading state
  extractBtn.disabled = true;
  extractBtn.classList.add('loading');
  const originalText = extractBtn.innerHTML;
  extractBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Extracting...
  `;

  try {
    const response = await fetch('/api/extract-brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Extraction failed');
    }

    const brandData = await response.json();
    showExtractedBrand(brandData);
  } catch (err) {
    console.error('Brand extraction error:', err);
    showToast(err.message || 'Failed to extract brand. Check the URL.', true);
  } finally {
    // Reset button state
    extractBtn.disabled = false;
    extractBtn.classList.remove('loading');
    extractBtn.innerHTML = originalText;
  }
}

// Show extracted brand in modal
function showExtractedBrand(data) {
  extractedBrandData = data;

  // Show source URL
  const sourceEl = document.getElementById('extract-source');
  sourceEl.textContent = `Source: ${data.sourceUrl}`;

  // Render color swatches
  const colorsEl = document.getElementById('extracted-colors');
  const colorNames = {
    primary: 'Primary',
    secondary: 'Secondary',
    background: 'Background',
    backgroundAlt: 'Background Alt'
  };

  colorsEl.innerHTML = Object.entries(data.colors || {})
    .map(([key, color]) => `
      <div class="color-swatch" data-key="${key}" data-color="${color}">
        <div class="swatch-preview" style="background: ${color}"></div>
        <div class="swatch-info">
          <span class="swatch-name">${colorNames[key] || key}</span>
          <span class="swatch-value">${color}</span>
        </div>
      </div>
    `).join('');

  // Render fonts
  const fontsEl = document.getElementById('extracted-fonts');
  if (data.fonts && (data.fonts.heading || data.fonts.body)) {
    fontsEl.innerHTML = `
      <div class="font-preview-item">
        <span class="font-preview-label">Heading</span>
        <span class="font-preview-value" style="font-family: ${data.fonts.heading}">${data.fonts.heading?.split(',')[0] || 'Default'}</span>
      </div>
      <div class="font-preview-item">
        <span class="font-preview-label">Body</span>
        <span class="font-preview-value" style="font-family: ${data.fonts.body}">${data.fonts.body?.split(',')[0] || 'Default'}</span>
      </div>
    `;
  } else {
    fontsEl.innerHTML = '<div class="extract-no-fonts">No fonts detected</div>';
  }

  // Render logo preview
  const logoEl = document.getElementById('extracted-logo');
  if (data.logo) {
    logoEl.innerHTML = `
      <img src="${data.logo}" alt="Detected logo" onerror="this.parentElement.innerHTML='<div class=\\'extract-no-logo\\'>Logo could not be loaded</div>'">
      <div class="logo-preview-label">Detected logo</div>
    `;
  } else {
    logoEl.innerHTML = '<div class="extract-no-logo">No logo detected</div>';
  }

  // Show modal
  document.getElementById('extract-modal').classList.add('active');
}

// Set a text field value
function setTextField(fieldName, value) {
  const input = document.querySelector(`[name="${fieldName}"]`);
  if (!input) return;

  input.value = value;
  // Trigger input event to update preview and save
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// Apply extracted brand colors and fonts to form
function applyExtractedBrand() {
  if (!extractedBrandData?.colors && !extractedBrandData?.fonts) {
    showToast('No brand data to apply', true);
    return;
  }

  // Apply colors
  if (extractedBrandData.colors) {
    const colorMapping = {
      primary: 'brand_primary_color',
      secondary: 'brand_secondary_color',
      background: 'bg_gradient_start',
      backgroundAlt: 'bg_gradient_end'
    };

    Object.entries(colorMapping).forEach(([key, fieldName]) => {
      if (extractedBrandData.colors[key]) {
        setColorField(fieldName, extractedBrandData.colors[key]);
      }
    });
  }

  // Apply fonts
  if (extractedBrandData.fonts) {
    if (extractedBrandData.fonts.heading) {
      setTextField('heading_font', extractedBrandData.fonts.heading);
    }
    if (extractedBrandData.fonts.body) {
      setTextField('body_font', extractedBrandData.fonts.body);
    }
  }

  // Apply logo (replace placeholders)
  if (extractedBrandData.logo) {
    const logoInput = document.querySelector('[name="logo_url"]');
    if (logoInput) {
      const current = logoInput.value || '';
      const isPlaceholder = !current || current.includes('placehold.co') || current.includes('placeholder.com');
      if (isPlaceholder) {
        logoInput.value = extractedBrandData.logo;
        logoInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  // Close modal and update preview
  hideExtractModal();
  showToast('Brand applied!');
}

// Set a color field value and sync with color picker
function setColorField(fieldName, hexColor) {
  const textInput = document.querySelector(`[name="${fieldName}"]`);
  if (!textInput) return;

  textInput.value = hexColor;

  // Sync color picker
  const wrapper = textInput.closest('.color-input-wrapper');
  if (wrapper) {
    const colorPicker = wrapper.querySelector('input[type="color"]');
    if (colorPicker) {
      colorPicker.value = hexColor;
    }
  }

  // Trigger input event to update preview and save
  textInput.dispatchEvent(new Event('input', { bubbles: true }));
}

// Hide extract modal
function hideExtractModal() {
  document.getElementById('extract-modal').classList.remove('active');
}

// ============================================
// AI COPYWRITER
// ============================================

// Store generated copy data
let generatedCopyData = null;

// Generate copy from website + prompt
async function generateCopy() {
  const urlInput = document.getElementById('copy_url');
  const promptInput = document.getElementById('copy_prompt');
  const languageInput = document.getElementById('copy_language');
  const generateBtn = document.getElementById('btn-generate-copy');

  const url = urlInput.value.trim();
  const prompt = promptInput.value.trim();
  const language = languageInput?.value || 'nl';

  if (!url) {
    showToast('Please enter a website URL', true);
    return;
  }

  if (!prompt) {
    showToast('Please describe your business/offer', true);
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    showToast('Please enter a valid URL', true);
    return;
  }

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="spin">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Generating...
  `;

  try {
    const response = await fetch('/api/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ websiteUrl: url, prompt, language })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Copy generation failed');
    }

    const copyData = await response.json();
    showGeneratedCopy(copyData);
  } catch (err) {
    console.error('Copy generation error:', err);
    showToast(err.message || 'Failed to generate copy. Please try again.', true);
  } finally {
    // Reset button state
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
    generateBtn.innerHTML = originalText;
  }
}

// Show generated copy in modal for review
function showGeneratedCopy(data) {
  generatedCopyData = data;

  // Show source URL
  const sourceEl = document.getElementById('copy-source');
  sourceEl.textContent = `Source: ${data.sourceUrl || 'N/A'}`;

  // Define sections for organization
  const sections = [
    {
      title: 'Hero Section',
      fields: ['hero_headline', 'hero_subheadline', 'cta_button_text', 'cta_button_secondary_text']
    },
    {
      title: 'Mini Testimonials',
      fields: ['mini_testimonial_1', 'mini_testimonial_2', 'mini_testimonial_3']
    },
    {
      title: 'Process Steps',
      fields: ['process_headline', 'step_1_title', 'step_1_description', 'step_2_title', 'step_2_description', 'step_3_title', 'step_3_description', 'guarantee_text']
    },
    {
      title: 'Reviews Section',
      fields: ['reviews_headline', 'reviews_subheadline']
    },
    {
      title: 'Footer CTA',
      fields: ['footer_headline', 'footer_subheadline']
    }
  ];

  // Field display names
  const fieldLabels = {
    hero_headline: 'Headline',
    hero_subheadline: 'Subheadline',
    cta_button_text: 'CTA Button',
    cta_button_secondary_text: 'Secondary CTA',
    mini_testimonial_1: 'Quote 1',
    mini_testimonial_2: 'Quote 2',
    mini_testimonial_3: 'Quote 3',
    process_headline: 'Section Headline',
    step_1_title: 'Step 1 Title',
    step_1_description: 'Step 1 Description',
    step_2_title: 'Step 2 Title',
    step_2_description: 'Step 2 Description',
    step_3_title: 'Step 3 Title',
    step_3_description: 'Step 3 Description',
    guarantee_text: 'Guarantee',
    reviews_headline: 'Section Headline',
    reviews_subheadline: 'Section Subheadline',
    footer_headline: 'Headline',
    footer_subheadline: 'Subheadline'
  };

  // Render preview
  const previewEl = document.getElementById('generated-copy-preview');
  let html = '';

  sections.forEach(section => {
    html += `<div class="copy-preview-section">${section.title}</div>`;

    section.fields.forEach(field => {
      const value = data[field];
      if (value) {
        html += `
          <div class="copy-preview-item">
            <span class="copy-preview-label">${fieldLabels[field] || field}</span>
            <span class="copy-preview-value">${escapeHtml(value)}</span>
          </div>
        `;
      }
    });
  });

  previewEl.innerHTML = html;

  // Show modal
  document.getElementById('copy-modal').classList.add('active');
}

// Apply generated copy to form fields
function applyGeneratedCopy() {
  if (!generatedCopyData) {
    showToast('No copy data to apply', true);
    return;
  }

  // Map of copy data keys to form field names (they're the same in this case)
  const copyFields = [
    'hero_headline', 'hero_subheadline', 'cta_button_text', 'cta_button_secondary_text',
    'mini_testimonial_1', 'mini_testimonial_2', 'mini_testimonial_3',
    'process_headline', 'step_1_title', 'step_1_description',
    'step_2_title', 'step_2_description', 'step_3_title', 'step_3_description',
    'guarantee_text', 'reviews_headline', 'reviews_subheadline',
    'footer_headline', 'footer_subheadline'
  ];

  let appliedCount = 0;

  copyFields.forEach(field => {
    if (generatedCopyData[field]) {
      setTextField(field, generatedCopyData[field]);
      appliedCount++;
    }
  });

  // Close modal and update preview
  hideCopyModal();
  showToast(`Applied ${appliedCount} fields!`);
}

// Hide copy modal
function hideCopyModal() {
  document.getElementById('copy-modal').classList.remove('active');
}

// ============================================
// SECTION ORDERING (DRAG & DROP)
// ============================================

// Default section order
const DEFAULT_SECTION_ORDER = [
  'hero',
  'video',
  'trust_badges',
  'mini_testimonials',
  'process_steps',
  'google_reviews',
  'video_testimonials',
  'footer_cta',
  'faq',
  'client_logos'
];

// Currently dragging element
let draggedSection = null;

// Get current section order from DOM
function getSectionOrder() {
  const sections = document.querySelectorAll('.section[data-section-id]');
  return [...sections].map(s => s.dataset.sectionId);
}

// Apply section order to DOM by reordering elements
function applySectionOrder(order) {
  if (!order || order.length === 0) return;

  const sidebar = document.querySelector('.sidebar form') || document.querySelector('.sidebar');
  if (!sidebar) return;

  // Get all sections with data-section-id
  const sections = [...sidebar.querySelectorAll('.section[data-section-id]')];
  const sectionMap = {};
  sections.forEach(s => {
    sectionMap[s.dataset.sectionId] = s;
  });

  // Find the reference point (first section with data-section-id)
  const firstSection = sections[0];
  if (!firstSection) return;

  // Get the parent element
  const parent = firstSection.parentElement;

  // Reorder sections according to the order array
  order.forEach((sectionId, index) => {
    const section = sectionMap[sectionId];
    if (section) {
      // Move section to correct position
      if (index === 0) {
        // Insert before the first non-draggable section or at the reference point
        const referenceNode = [...parent.querySelectorAll('.section[data-section-id]')][0];
        if (referenceNode && referenceNode !== section) {
          parent.insertBefore(section, referenceNode);
        }
      } else {
        // Insert after the previous section in the order
        const prevSectionId = order[index - 1];
        const prevSection = sectionMap[prevSectionId];
        if (prevSection && prevSection.nextElementSibling !== section) {
          prevSection.after(section);
        }
      }
    }
  });
}

// Initialize drag and drop for sections
function initDragDrop() {
  const sections = document.querySelectorAll('.section[data-section-id]');

  sections.forEach(section => {
    const dragHandle = section.querySelector('.section-drag-handle');
    if (!dragHandle) return;

    // Make section draggable
    section.setAttribute('draggable', 'true');

    // Drag start - only on drag handle
    dragHandle.addEventListener('mousedown', () => {
      section.classList.add('drag-ready');
    });

    document.addEventListener('mouseup', () => {
      section.classList.remove('drag-ready');
    });

    section.addEventListener('dragstart', (e) => {
      // Only allow drag if started from handle
      if (!section.classList.contains('drag-ready') && !e.target.closest('.section-drag-handle')) {
        e.preventDefault();
        return;
      }

      draggedSection = section;
      section.classList.add('dragging');

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', section.dataset.sectionId);

      // Use a timeout to avoid visual glitch
      setTimeout(() => {
        section.style.opacity = '0.5';
      }, 0);
    });

    section.addEventListener('dragend', () => {
      section.classList.remove('dragging', 'drag-ready');
      section.style.opacity = '';
      draggedSection = null;

      // Remove all drag-over states
      document.querySelectorAll('.section.drag-over').forEach(s => {
        s.classList.remove('drag-over');
      });

      // Save new order
      debouncedSaveToStorage();
      debouncedUpdatePreview();
    });

    // Drag over
    section.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (draggedSection && draggedSection !== section && section.dataset.sectionId) {
        section.classList.add('drag-over');
      }
    });

    // Drag leave
    section.addEventListener('dragleave', () => {
      section.classList.remove('drag-over');
    });

    // Drop
    section.addEventListener('drop', (e) => {
      e.preventDefault();
      section.classList.remove('drag-over');

      if (!draggedSection || draggedSection === section) return;

      // Get parent
      const parent = section.parentElement;

      // Determine where to insert
      const rect = section.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (e.clientY < midY) {
        // Insert before
        parent.insertBefore(draggedSection, section);
      } else {
        // Insert after
        section.after(draggedSection);
      }
    });
  });

  // Prevent default browser drag on section content
  sections.forEach(section => {
    const content = section.querySelector('.section-content');
    if (content) {
      content.addEventListener('dragstart', (e) => {
        if (!e.target.closest('.section-drag-handle')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }
  });
}

// ============================================
// VIEWPORT SWITCHER
// ============================================

// Set viewport size for preview iframe
function setViewport(viewport) {
  const container = document.getElementById('preview-iframe-container');
  if (!container) return;

  // Remove all viewport classes
  container.classList.remove('viewport-desktop', 'viewport-tablet', 'viewport-mobile');

  // Add the selected viewport class
  if (viewport !== 'desktop') {
    container.classList.add(`viewport-${viewport}`);
  }

  // Update active button
  document.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.viewport === viewport);
  });
}

// ============================================
// PREVIEW IN NEW TAB FEATURES
// ============================================

// Open preview in new tab
function openPreviewInNewTab() {
  // Close existing window if open
  if (previewWindow && !previewWindow.closed) {
    previewWindow.focus();
    sendPreviewUpdate(generateHTML());
    return;
  }

  // Open new preview window
  previewWindow = window.open('preview.html', 'testimotion-preview',
    'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');

  // Wait for window to be ready
  if (previewWindow) {
    showToast('Opening preview...');
  }
}

// Listen for messages from preview window
function setupPreviewMessageListener() {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'preview-ready') {
      // Preview window is ready, send initial content
      const html = generateHTML();
      sendPreviewUpdate(html);
    } else if (event.data && event.data.type === 'pong') {
      // Connection confirmed
    } else if (event.data && event.data.type === 'focus-field') {
      // Click-to-focus from preview: scroll to and focus the corresponding form field
      focusFormField(event.data.field);
    }
  });
}

// Focus a form field by name and scroll to it
function focusFormField(fieldName) {
  if (!fieldName) return;

  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;

  // Find the parent section and expand if collapsed
  const section = field.closest('.section');
  if (section && section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
  }

  // Scroll the field into view with smooth animation
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Focus the field after scrolling animation completes
  setTimeout(() => {
    field.focus();
    // Add a temporary highlight effect
    field.classList.add('field-highlight');
    setTimeout(() => field.classList.remove('field-highlight'), 2000);
  }, 300);
}

// ============================================
// AUTHENTICATION
// ============================================

// Update auth UI based on current state
function updateAuthUI(user) {
  const loggedOutEl = document.getElementById('auth-logged-out');
  const loggedInEl = document.getElementById('auth-logged-in');
  const userEmailEl = document.getElementById('user-email');

  if (!loggedOutEl || !loggedInEl) return;

  if (user) {
    // User is logged in
    loggedOutEl.style.display = 'none';
    loggedInEl.style.display = 'flex';
    if (userEmailEl) {
      userEmailEl.textContent = user.email || 'User';
      userEmailEl.title = user.email || '';
    }
  } else {
    // User is logged out
    loggedOutEl.style.display = 'flex';
    loggedInEl.style.display = 'none';
  }
}

// Show login modal
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  const emailInput = document.getElementById('login-email');
  const messageEl = document.getElementById('login-message');

  if (modal) {
    modal.classList.add('active');
    // Clear previous state
    if (emailInput) {
      emailInput.value = '';
      emailInput.focus();
    }
    if (messageEl) {
      messageEl.className = 'login-message';
      messageEl.textContent = '';
    }
  }
}

// Hide login modal
function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Handle sending magic link
async function handleSendMagicLink() {
  const emailInput = document.getElementById('login-email');
  const messageEl = document.getElementById('login-message');
  const sendBtn = document.getElementById('btn-send-magic-link');
  const btnText = sendBtn?.querySelector('.btn-text');
  const btnLoading = sendBtn?.querySelector('.btn-loading');

  const email = emailInput?.value?.trim();

  if (!email) {
    if (messageEl) {
      messageEl.className = 'login-message error';
      messageEl.textContent = 'Please enter your email address.';
    }
    return;
  }

  // Show loading state
  if (sendBtn) sendBtn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoading) btnLoading.style.display = 'flex';

  const result = await loginWithMagicLink(email);

  // Hide loading state
  if (sendBtn) sendBtn.disabled = false;
  if (btnText) btnText.style.display = 'inline';
  if (btnLoading) btnLoading.style.display = 'none';

  if (result.success) {
    if (messageEl) {
      messageEl.className = 'login-message success';
      messageEl.textContent = 'Check your email for a login link. You can close this modal.';
    }
  } else {
    if (messageEl) {
      messageEl.className = 'login-message error';
      messageEl.textContent = result.error || 'Failed to send login link.';
    }
  }
}

// Handle logout
async function handleLogout() {
  const result = await logout();

  if (result.success) {
    showToast('Logged out');
    // Refresh history list to show localStorage data
    await refreshHistoryList();
  } else {
    showToast(result.error || 'Failed to logout', true);
  }
}

// Handle auth state change
async function handleAuthStateChange(user, event) {
  updateAuthUI(user);

  if (user && (event === 'SIGNED_IN' || event === 'INITIAL')) {
    // User just logged in - check for local versions to migrate
    const migrated = await migrateLocalToSupabase();
    if (migrated > 0) {
      showToast(`Migrated ${migrated} local version(s) to your account`);
    }

    // Refresh history list with Supabase data
    await refreshHistoryList();

    // Close login modal if open
    hideLoginModal();
  } else if (!user && event === 'SIGNED_OUT') {
    // User logged out - refresh to show localStorage data
    await refreshHistoryList();
  }
}

// Initialize auth listeners
function initAuthListeners() {
  // Login button
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', showLoginModal);
  }

  // Logout button
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Login modal
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    // Close on overlay click
    loginModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideLoginModal();
    });

    // Close button
    const closeBtn = document.getElementById('login-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideLoginModal);
    }

    // Send magic link button
    const sendBtn = document.getElementById('btn-send-magic-link');
    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMagicLink);
    }

    // Enter key to send
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSendMagicLink();
        }
      });
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(handleAuthStateChange);
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize app
async function init() {
  // Initialize theme before anything else
  initTheme();

  // Initialize auth system
  await initAuth();

  // Initialize auth UI listeners
  initAuthListeners();

  // Update auth UI with current state
  updateAuthUI(getCurrentUser());

  // Theme toggle button listener
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Sync color inputs first
  syncColorInputs();

  // Sync range inputs (border radius slider)
  syncRangeInputs();

  // Initialize font pickers (Google Fonts search + weight selectors)
  initFontPickers();

  // Priority: 1) localStorage, 2) URL params, 3) defaults
  const hasStorage = loadFromStorage();
  if (!hasStorage) {
    const hasURL = loadFromURL();
    if (!hasURL) {
      loadDefaults();
    }
  }

  // Initial preview update
  updatePreview();

  // Initialize hide toggles
  initHideToggles();

  // Initialize drag & drop for section ordering
  initDragDrop();

  // Add input listeners for live preview and autosave
  document.querySelectorAll('[name]').forEach(el => {
    el.addEventListener('input', () => {
      debouncedUpdatePreview();
      debouncedSaveToStorage();
    });
  });

  // Section toggle listeners
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      toggleSection(header.closest('.section'));
    });
  });

  // Button listeners
  document.getElementById('btn-generate').addEventListener('click', showOutputModal);
  document.getElementById('btn-copy-link').addEventListener('click', copyLink);
  document.getElementById('btn-copy-html').addEventListener('click', copyHTML);
  document.getElementById('modal-close').addEventListener('click', hideOutputModal);

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetToDefaults);
  }

  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideOutputModal();
  });

  // History feature listeners
  const btnSaveVersion = document.getElementById('btn-save-version');
  if (btnSaveVersion) {
    btnSaveVersion.addEventListener('click', showSaveVersionModal);
  }

  const saveVersionModal = document.getElementById('save-version-modal');
  if (saveVersionModal) {
    saveVersionModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideSaveVersionModal();
    });

    document.getElementById('save-version-close')?.addEventListener('click', hideSaveVersionModal);
    document.getElementById('btn-confirm-save')?.addEventListener('click', saveCurrentVersion);

    // Enter key to save
    document.getElementById('version-label-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveCurrentVersion();
    });
  }

  // Preview in new tab button
  const btnNewTabPreview = document.getElementById('btn-new-tab-preview');
  if (btnNewTabPreview) {
    btnNewTabPreview.addEventListener('click', openPreviewInNewTab);
  }

  // Viewport switcher buttons
  document.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setViewport(btn.dataset.viewport);
    });
  });

  // Setup preview message listener
  setupPreviewMessageListener();

  // Brand extraction listeners
  const btnExtractBrand = document.getElementById('btn-extract-brand');
  if (btnExtractBrand) {
    btnExtractBrand.addEventListener('click', extractBrand);
  }

  const extractUrlInput = document.getElementById('extract_url');
  if (extractUrlInput) {
    extractUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        extractBrand();
      }
    });
  }

  const extractModal = document.getElementById('extract-modal');
  if (extractModal) {
    extractModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideExtractModal();
    });

    document.getElementById('extract-modal-close')?.addEventListener('click', hideExtractModal);
    document.getElementById('btn-apply-brand')?.addEventListener('click', applyExtractedBrand);
    document.getElementById('btn-cancel-extract')?.addEventListener('click', hideExtractModal);
  }

  // AI Copywriter listeners
  const btnGenerateCopy = document.getElementById('btn-generate-copy');
  if (btnGenerateCopy) {
    btnGenerateCopy.addEventListener('click', generateCopy);
  }

  // Language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Update hidden input
      const langInput = document.getElementById('copy_language');
      if (langInput) langInput.value = btn.dataset.lang;
    });
  });

  const copyModal = document.getElementById('copy-modal');
  if (copyModal) {
    copyModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideCopyModal();
    });

    document.getElementById('copy-modal-close')?.addEventListener('click', hideCopyModal);
    document.getElementById('btn-apply-copy')?.addEventListener('click', applyGeneratedCopy);
    document.getElementById('btn-cancel-copy')?.addEventListener('click', hideCopyModal);
  }

  // Load history list
  await refreshHistoryList();

  // Keyboard shortcut to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideOutputModal();
      hideSaveVersionModal();
      hideExtractModal();
      hideCopyModal();
      hideLoginModal();
    }
  });
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
