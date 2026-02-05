/**
 * FontPicker - Canva-style Google Fonts picker with search, lazy-loading previews, and keyboard nav
 */

const FONTS_CACHE_KEY = 'testimotion_fonts_cache';
const FONTS_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24h
const MAX_VISIBLE = 50;
const DEBOUNCE_MS = 150;

// Track which font CSS files have been loaded to avoid duplicates
const loadedFonts = new Set();

// Shared font list across all picker instances
let allFonts = null;
let fontsFetchPromise = null;

/**
 * Load a Google Font CSS for preview
 */
function loadFontCSS(family) {
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Fetch fonts from API with localStorage caching
 */
async function fetchFonts() {
  // Return shared promise if already fetching
  if (fontsFetchPromise) return fontsFetchPromise;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(FONTS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < FONTS_CACHE_EXPIRY && Array.isArray(data) && data.length > 0) {
        allFonts = data;
        return data;
      }
    }
  } catch {
    // Cache miss or corrupt
  }

  // Fetch from API
  fontsFetchPromise = fetch('/api/fonts')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch fonts');
      return res.json();
    })
    .then(fonts => {
      allFonts = fonts;
      // Cache in localStorage
      try {
        localStorage.setItem(FONTS_CACHE_KEY, JSON.stringify({
          data: fonts,
          timestamp: Date.now()
        }));
      } catch {
        // localStorage full - not critical
      }
      fontsFetchPromise = null;
      return fonts;
    })
    .catch(err => {
      fontsFetchPromise = null;
      console.error('Font fetch error:', err);
      return [];
    });

  return fontsFetchPromise;
}

/**
 * FontPicker class - attaches to an input element
 */
export class FontPicker {
  constructor({ inputElement, onSelect }) {
    this.input = inputElement;
    this.onSelect = onSelect;
    this.dropdown = null;
    this.highlightIndex = -1;
    this.filteredFonts = [];
    this.isOpen = false;

    this._createDropdown();
    this._bindEvents();
  }

  _createDropdown() {
    // Wrap input in a container for positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'font-picker-container';
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    // Create dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'font-picker-dropdown';
    this.dropdown.style.display = 'none';
    wrapper.appendChild(this.dropdown);
  }

  _bindEvents() {
    // Open on focus
    this.input.addEventListener('focus', () => this._open());

    // Filter on type (debounced)
    let debounceTimer;
    this.input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this._filter(), DEBOUNCE_MS);
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      if (!this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this._open();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this._moveHighlight(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this._moveHighlight(-1);
          break;
        case 'Enter':
          e.preventDefault();
          if (this.highlightIndex >= 0 && this.highlightIndex < this.filteredFonts.length) {
            this._selectFont(this.filteredFonts[this.highlightIndex]);
          }
          break;
        case 'Escape':
          this._close();
          break;
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this._close();
      }
    });
  }

  async _open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.dropdown.style.display = 'block';

    // Show loading if fonts not loaded
    if (!allFonts) {
      this.dropdown.innerHTML = '<div class="font-picker-loading">Loading fonts...</div>';
      await fetchFonts();
    }

    this._filter();
  }

  _close() {
    this.isOpen = false;
    this.dropdown.style.display = 'none';
    this.highlightIndex = -1;
  }

  _filter() {
    if (!allFonts) return;

    const query = this.input.value.trim().toLowerCase();

    // Treat system font stacks as empty (show popular fonts)
    const isSystemFont = !query || /^(system-ui|sans-serif|serif|monospace|-apple-system|blinkmacsystemfont)/.test(query);

    if (!isSystemFont && query) {
      this.filteredFonts = allFonts
        .filter(f => f.family.toLowerCase().includes(query))
        .slice(0, MAX_VISIBLE);
    } else {
      // Show top popular fonts when empty or system font default
      this.filteredFonts = allFonts.slice(0, MAX_VISIBLE);
    }

    this.highlightIndex = -1;
    this._render();
  }

  _render() {
    if (this.filteredFonts.length === 0) {
      this.dropdown.innerHTML = '<div class="font-picker-empty">No fonts found</div>';
      return;
    }

    const categoryBadge = (cat) => {
      const labels = {
        'sans-serif': 'Sans',
        'serif': 'Serif',
        'display': 'Display',
        'handwriting': 'Hand',
        'monospace': 'Mono'
      };
      return labels[cat] || cat;
    };

    this.dropdown.innerHTML = this.filteredFonts.map((font, i) => `
      <div class="font-picker-item${i === this.highlightIndex ? ' highlighted' : ''}"
           data-index="${i}" data-family="${font.family}">
        <span class="font-picker-name" style="font-family: '${font.family}', ${font.category}">${font.family}</span>
        <span class="font-picker-category">${categoryBadge(font.category)}</span>
      </div>
    `).join('');

    // Bind click events
    this.dropdown.querySelectorAll('.font-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        this._selectFont(this.filteredFonts[idx]);
      });

      // Lazy-load font CSS on hover
      item.addEventListener('mouseenter', () => {
        loadFontCSS(item.dataset.family);
        // Update highlight visually
        this.dropdown.querySelectorAll('.font-picker-item').forEach(el => el.classList.remove('highlighted'));
        item.classList.add('highlighted');
        this.highlightIndex = parseInt(item.dataset.index);
      });
    });

    // Load font CSS for the first few visible items
    this.filteredFonts.slice(0, 5).forEach(f => loadFontCSS(f.family));
  }

  _moveHighlight(direction) {
    const max = this.filteredFonts.length;
    if (max === 0) return;

    this.highlightIndex = Math.max(0, Math.min(max - 1, this.highlightIndex + direction));

    // Update visual highlight
    this.dropdown.querySelectorAll('.font-picker-item').forEach((item, i) => {
      item.classList.toggle('highlighted', i === this.highlightIndex);
    });

    // Scroll into view
    const highlighted = this.dropdown.querySelector('.font-picker-item.highlighted');
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
      // Lazy-load the highlighted font
      loadFontCSS(this.filteredFonts[this.highlightIndex].family);
    }
  }

  _selectFont(font) {
    if (!font) return;

    this.input.value = font.family;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    loadFontCSS(font.family);

    this._close();

    if (this.onSelect) {
      this.onSelect(font);
    }
  }
}

/**
 * Initialize font pickers on heading_font and body_font inputs
 */
export function initFontPickers() {
  const headingInput = document.getElementById('heading_font');
  const bodyInput = document.getElementById('body_font');

  if (headingInput) {
    new FontPicker({
      inputElement: headingInput,
      onSelect: (font) => updateWeightSelector('heading_font', font)
    });
  }

  if (bodyInput) {
    new FontPicker({
      inputElement: bodyInput,
      onSelect: (font) => updateWeightSelector('body_font', font)
    });
  }

  // Initialize weight selector buttons
  initWeightSelectors();

  // Pre-fetch fonts in background
  fetchFonts();
}

/**
 * Update weight selector buttons based on available variants for a font
 */
function updateWeightSelector(inputId, font) {
  const selector = document.querySelector(`.font-weight-selector[data-for="${inputId}"]`);
  if (!selector) return;

  const availableWeights = (font.variants || [])
    .filter(v => !v.includes('italic'))
    .map(v => v === 'regular' ? '400' : v)
    .filter(v => /^\d+$/.test(v));

  selector.querySelectorAll('.font-weight-btn').forEach(btn => {
    const weight = btn.dataset.weight;
    const available = availableWeights.includes(weight);
    btn.classList.toggle('unavailable', !available);
    btn.disabled = !available;
  });
}

/**
 * Initialize weight selector button click handlers
 */
function initWeightSelectors() {
  document.querySelectorAll('.font-weight-selector').forEach(selector => {
    selector.querySelectorAll('.font-weight-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active within this group
        selector.querySelectorAll('.font-weight-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
}

/**
 * Get selected weight for a font input
 */
export function getSelectedWeight(inputId) {
  const selector = document.querySelector(`.font-weight-selector[data-for="${inputId}"]`);
  if (!selector) return '600';
  const active = selector.querySelector('.font-weight-btn.active');
  return active ? active.dataset.weight : '600';
}
