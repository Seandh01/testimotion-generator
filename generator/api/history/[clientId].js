// Note: Vercel serverless functions are stateless, so in-memory storage resets.
// For production, use Vercel KV, Supabase, or another database.
// The app also stores versions in localStorage as backup.

// Simple in-memory store (resets on cold starts)
const memoryStore = globalThis.__historyStore || (globalThis.__historyStore = new Map());

export default async function handler(req, res) {
  const { method } = req;
  const { clientId, versionId } = req.query;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required' });
  }

  // Sanitize clientId
  const sanitizedId = clientId.replace(/[^a-zA-Z0-9-_]/g, '');

  switch (method) {
    case 'GET': {
      // Get history for client (or specific version if versionId provided)
      const history = memoryStore.get(sanitizedId) || { clientId: sanitizedId, versions: [] };

      if (versionId) {
        const version = history.versions.find(v => v.id === versionId);
        if (!version) {
          return res.status(404).json({ error: 'Version not found' });
        }
        return res.json(version);
      }

      return res.json(history);
    }

    case 'POST': {
      // Save new version
      const { label, values, hidden } = req.body;
      const history = memoryStore.get(sanitizedId) || { clientId: sanitizedId, versions: [] };

      const newVersion = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        label: label || `Version ${history.versions.length + 1}`,
        values: values || {},
        hidden: hidden || []
      };

      history.versions.unshift(newVersion);

      // Keep only last 50 versions
      if (history.versions.length > 50) {
        history.versions = history.versions.slice(0, 50);
      }

      memoryStore.set(sanitizedId, history);
      return res.status(201).json(newVersion);
    }

    case 'DELETE': {
      // Delete version
      if (!versionId) {
        return res.status(400).json({ error: 'versionId is required for DELETE' });
      }

      const history = memoryStore.get(sanitizedId);
      if (!history) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const index = history.versions.findIndex(v => v.id === versionId);
      if (index === -1) {
        return res.status(404).json({ error: 'Version not found' });
      }

      history.versions.splice(index, 1);
      memoryStore.set(sanitizedId, history);
      return res.json({ success: true });
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
