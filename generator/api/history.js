// Note: Vercel serverless functions are stateless, so file-based storage doesn't persist.
// For production, use Vercel KV, Supabase, or another database.
// For now, version history is handled client-side via localStorage.

const memoryStore = new Map();

export default async function handler(req, res) {
  const { method } = req;

  // Extract clientId from query or body
  const clientId = req.query.clientId || req.body?.clientId;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required' });
  }

  // Sanitize clientId
  const sanitizedId = clientId.replace(/[^a-zA-Z0-9-_]/g, '');

  switch (method) {
    case 'GET': {
      // Get history for client
      const history = memoryStore.get(sanitizedId) || { clientId: sanitizedId, versions: [] };
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
      const versionId = req.query.versionId;
      if (!versionId) {
        return res.status(400).json({ error: 'versionId is required' });
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
