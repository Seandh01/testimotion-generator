/**
 * SVG Image Extractor
 * Extracts all base64 embedded PNG images from the SVG and saves them to preview/assets/
 */

const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'Proofpage Master Template.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'preview', 'assets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Reading SVG file...');
const svgContent = fs.readFileSync(SVG_PATH, 'utf-8');

// Pattern to match base64 image data in xlink:href or href attributes
// Matches: xlink:href="data:image/png;base64,..." or href="data:image/png;base64,..."
const base64Pattern = /(?:xlink:)?href="data:image\/(png|jpeg|jpg|gif|webp);base64,([^"]+)"/g;

let match;
let imageCount = 0;
const extractedImages = [];

console.log('Extracting images...\n');

while ((match = base64Pattern.exec(svgContent)) !== null) {
  const imageType = match[1];
  const base64Data = match[2];

  // Determine file extension
  const ext = imageType === 'jpeg' || imageType === 'jpg' ? 'jpg' : imageType;
  const fileName = `image-${String(imageCount).padStart(3, '0')}.${ext}`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Decode base64 and write to file
  const imageBuffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, imageBuffer);

  // Get file size for logging
  const fileSizeKB = (imageBuffer.length / 1024).toFixed(1);

  extractedImages.push({
    index: imageCount,
    fileName,
    type: imageType,
    sizeKB: fileSizeKB
  });

  console.log(`  [${imageCount}] ${fileName} (${fileSizeKB} KB)`);
  imageCount++;
}

console.log(`\n✓ Extracted ${imageCount} images to: ${OUTPUT_DIR}`);

// Generate a mapping file for reference
const mappingPath = path.join(OUTPUT_DIR, 'image-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(extractedImages, null, 2));
console.log(`✓ Image mapping saved to: ${mappingPath}`);

// Print summary
const totalSizeKB = extractedImages.reduce((sum, img) => sum + parseFloat(img.sizeKB), 0);
console.log(`\nSummary:`);
console.log(`  Total images: ${imageCount}`);
console.log(`  Total size: ${(totalSizeKB / 1024).toFixed(2)} MB`);
console.log(`  Output directory: ${OUTPUT_DIR}`);
