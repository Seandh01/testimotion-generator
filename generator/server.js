import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractBrandFromURL } from './brand-extractor.js';
import { generateLandingPageCopy } from './copywriting-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get history file path for a client
function getClientFilePath(clientId) {
  // Sanitize clientId to prevent path traversal
  const sanitized = clientId.replace(/[^a-zA-Z0-9-_]/g, '');
  return path.join(DATA_DIR, `${sanitized}.json`);
}

// Read client history
async function readClientHistory(clientId) {
  const filePath = getClientFilePath(clientId);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { clientId, versions: [] };
    }
    throw err;
  }
}

// Write client history
async function writeClientHistory(clientId, history) {
  const filePath = getClientFilePath(clientId);
  await fs.writeFile(filePath, JSON.stringify(history, null, 2));
}

// API Routes

// GET /api/history/:clientId - Get all versions for a client
app.get('/api/history/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const history = await readClientHistory(clientId);
    res.json(history);
  } catch (err) {
    console.error('Error reading history:', err);
    res.status(500).json({ error: 'Failed to read history' });
  }
});

// GET /api/history/:clientId/:versionId - Get specific version
app.get('/api/history/:clientId/:versionId', async (req, res) => {
  try {
    const { clientId, versionId } = req.params;
    const history = await readClientHistory(clientId);
    const version = history.versions.find(v => v.id === versionId);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (err) {
    console.error('Error reading version:', err);
    res.status(500).json({ error: 'Failed to read version' });
  }
});

// POST /api/history - Save a new version
app.post('/api/history', async (req, res) => {
  try {
    const { clientId, label, values, hidden } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const history = await readClientHistory(clientId);

    const newVersion = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      label: label || `Version ${history.versions.length + 1}`,
      values: values || {},
      hidden: hidden || []
    };

    // Add to beginning (most recent first)
    history.versions.unshift(newVersion);

    // Keep only last 50 versions per client
    if (history.versions.length > 50) {
      history.versions = history.versions.slice(0, 50);
    }

    await writeClientHistory(clientId, history);

    res.status(201).json(newVersion);
  } catch (err) {
    console.error('Error saving version:', err);
    res.status(500).json({ error: 'Failed to save version' });
  }
});

// DELETE /api/history/:clientId/:versionId - Delete a version
app.delete('/api/history/:clientId/:versionId', async (req, res) => {
  try {
    const { clientId, versionId } = req.params;
    const history = await readClientHistory(clientId);

    const index = history.versions.findIndex(v => v.id === versionId);
    if (index === -1) {
      return res.status(404).json({ error: 'Version not found' });
    }

    history.versions.splice(index, 1);
    await writeClientHistory(clientId, history);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting version:', err);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

// POST /api/extract-brand - Extract brand colors from URL
app.post('/api/extract-brand', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Extracting brand from: ${url}`);
    const brandData = await extractBrandFromURL(url);
    res.json(brandData);
  } catch (err) {
    console.error('Brand extraction error:', err);
    res.status(500).json({ error: 'Failed to extract brand data', details: err.message });
  }
});

// POST /api/generate-copy - Generate landing page copy with AI
app.post('/api/generate-copy', async (req, res) => {
  try {
    const { websiteUrl, prompt, language } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'websiteUrl is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'prompt (business description) is required' });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Default to Dutch if not specified
    const lang = ['nl', 'en'].includes(language) ? language : 'nl';

    console.log(`Generating copy for: ${websiteUrl} in ${lang}`);
    const copyData = await generateLandingPageCopy(websiteUrl, prompt, lang);
    res.json(copyData);
  } catch (err) {
    console.error('Copy generation error:', err);
    res.status(500).json({ error: 'Failed to generate copy', details: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  await ensureDataDir();

  app.listen(PORT, () => {
    console.log(`TESTIMOTION Generator Server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

start().catch(console.error);
