/**
 * Create placeholder images for fallback scenarios
 * Using simple canvas-based image generation
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'preview', 'assets', 'placeholders');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create SVG placeholders and save them
const placeholders = [
  {
    name: 'placeholder-logo.svg',
    width: 200,
    height: 60,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
      <rect fill="#2a2a2a" width="200" height="60" rx="8"/>
      <text x="100" y="35" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">Logo</text>
    </svg>`
  },
  {
    name: 'placeholder-avatar.svg',
    width: 100,
    height: 100,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle fill="#3a3a3a" cx="50" cy="50" r="50"/>
      <circle fill="#555" cx="50" cy="40" r="18"/>
      <ellipse fill="#555" cx="50" cy="85" rx="30" ry="25"/>
    </svg>`
  },
  {
    name: 'placeholder-thumbnail.svg',
    width: 400,
    height: 225,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
      <rect fill="#1a1a1a" width="400" height="225"/>
      <circle fill="#ffcc03" cx="200" cy="112" r="30"/>
      <polygon fill="#1a1a1a" points="190,97 190,127 215,112"/>
    </svg>`
  },
  {
    name: 'placeholder-step.svg',
    width: 400,
    height: 300,
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#f5f5f5" width="400" height="300"/>
      <rect fill="#e0e0e0" x="50" y="50" width="300" height="200" rx="8"/>
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle">Step Image</text>
    </svg>`
  }
];

console.log('Creating placeholder images...\n');

placeholders.forEach(placeholder => {
  const filePath = path.join(OUTPUT_DIR, placeholder.name);
  fs.writeFileSync(filePath, placeholder.content);
  console.log(`  ✓ ${placeholder.name}`);
});

console.log(`\n✓ Created ${placeholders.length} placeholder images in: ${OUTPUT_DIR}`);
