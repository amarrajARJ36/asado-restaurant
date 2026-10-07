import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const STORE_FILE = path.join(__dirname, 'data', 'sync-store.json');

// Interface for persistent store
interface BranchSyncData {
  menuEdits: Record<string, any>;
  customItems: any[];
  deletedIds: string[];
  purgedIds: string[];
  categoryEdits: Record<string, any>;
  customCategories: any[];
  deletedCategoryIds: string[];
}

interface SyncStore {
  branches: Record<string, BranchSyncData>;
  banners: any[];
  lastUpdated: number;
}

const defaultBranchData = (): BranchSyncData => ({
  menuEdits: {},
  customItems: [],
  deletedIds: [],
  purgedIds: [],
  categoryEdits: {},
  customCategories: [],
  deletedCategoryIds: []
});

function loadStore(): SyncStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (!data.branches) data.branches = {};
        if (!data.banners) data.banners = [];
        return data as SyncStore;
      }
    }
  } catch (err) {
    console.error('[Sync Server] Error reading store file:', err);
  }
  return {
    branches: {
      kollam: defaultBranchData(),
      alappuzha: defaultBranchData(),
      varkala: defaultBranchData()
    },
    banners: [],
    lastUpdated: Date.now()
  };
}

let store: SyncStore = loadStore();

function saveStore(): void {
  try {
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Sync Server] Error writing store file:', err);
  }
}

// SSE Clients for instant real-time broadcast across all phones
const sseClients = new Set<Response>();

function broadcastUpdate(branchSlug?: string): void {
  const payload = JSON.stringify({
    type: 'sync_update',
    branchSlug: branchSlug || 'all',
    lastUpdated: store.lastUpdated
  });
  const message = `data: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();

  // Allow JSON bodies up to 25MB for category photos / base64 images
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Basic CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now(), clients: sseClients.size });
  });

  // SSE stream endpoint for instant real-time syncing
  app.get('/api/sync/stream', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
    sseClients.add(res);

    // Keepalive ping every 15s to prevent mobile timeouts
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // Get synchronized state for a branch or all branches
  app.get('/api/sync/state', (req: Request, res: Response) => {
    const branchSlug = (req.query.branch as string)?.toLowerCase();
    if (branchSlug) {
      if (!store.branches[branchSlug]) {
        store.branches[branchSlug] = defaultBranchData();
      }
      return res.json({
        success: true,
        branch: branchSlug,
        data: store.branches[branchSlug],
        banners: store.banners.filter(b => !b.branchSlug || b.branchSlug === 'all' || b.branchSlug === branchSlug),
        lastUpdated: store.lastUpdated
      });
    }

    return res.json({
      success: true,
      branches: store.branches,
      banners: store.banners,
      lastUpdated: store.lastUpdated
    });
  });

  // Update specific item, category, or banner from any device
  app.post('/api/sync/update', (req: Request, res: Response) => {
    const { branchSlug, type, data } = req.body || {};
    const slug = (branchSlug || '').toLowerCase();

    if (!slug && type !== 'banner') {
      return res.status(400).json({ error: 'Missing branchSlug' });
    }

    if (slug && !store.branches[slug]) {
      store.branches[slug] = defaultBranchData();
    }

    const bData = slug ? store.branches[slug] : null;

    switch (type) {
      case 'menu_edit': {
        // data: { id: string, ...updates }
        if (bData && data?.id) {
          bData.menuEdits[data.id] = {
            ...(bData.menuEdits[data.id] || {}),
            ...data,
            updatedAt: Date.now()
          };
        }
        break;
      }

      case 'custom_item': {
        // data: newItemData
        if (bData && data?.id) {
          const idx = bData.customItems.findIndex(i => i.id === data.id);
          if (idx >= 0) {
            bData.customItems[idx] = { ...bData.customItems[idx], ...data, updatedAt: Date.now() };
          } else {
            bData.customItems.push({ ...data, updatedAt: Date.now() });
          }
        }
        break;
      }

      case 'item_delete': {
        // data: { id: string, isDeleted: boolean }
        if (bData && data?.id) {
          if (data.isDeleted) {
            if (!bData.deletedIds.includes(data.id)) bData.deletedIds.push(data.id);
            if (bData.menuEdits[data.id]) {
              bData.menuEdits[data.id].isDeleted = true;
            } else {
              bData.menuEdits[data.id] = { id: data.id, isDeleted: true };
            }
          } else {
            bData.deletedIds = bData.deletedIds.filter(id => id !== data.id);
            if (bData.menuEdits[data.id]) {
              bData.menuEdits[data.id].isDeleted = false;
              bData.menuEdits[data.id].isPurged = false;
            }
          }
        }
        break;
      }

      case 'item_purge': {
        // data: { id: string }
        if (bData && data?.id) {
          if (!bData.purgedIds.includes(data.id)) bData.purgedIds.push(data.id);
          if (!bData.deletedIds.includes(data.id)) bData.deletedIds.push(data.id);
          bData.customItems = bData.customItems.filter(i => i.id !== data.id);
          if (bData.menuEdits[data.id]) {
            bData.menuEdits[data.id].isPurged = true;
            bData.menuEdits[data.id].isDeleted = true;
          }
        }
        break;
      }

      case 'category_edit': {
        // data: { id: string, name?: string, imageUrl?: string, ... }
        if (bData && data?.id) {
          bData.categoryEdits[data.id] = {
            ...(bData.categoryEdits[data.id] || {}),
            ...data,
            updatedAt: Date.now()
          };
        }
        break;
      }

      case 'category_custom':
      case 'custom_category': {
        // data: newCategoryData
        if (bData && data?.id) {
          const idx = bData.customCategories.findIndex(c => c.id === data.id);
          if (idx >= 0) {
            bData.customCategories[idx] = { ...bData.customCategories[idx], ...data };
          } else {
            bData.customCategories.push(data);
          }
        }
        break;
      }

      case 'category_delete': {
        // data: { id: string }
        if (bData && data?.id) {
          if (!bData.deletedCategoryIds.includes(data.id)) bData.deletedCategoryIds.push(data.id);
          bData.customCategories = bData.customCategories.filter(c => c.id !== data.id);
          if (bData.categoryEdits[data.id]) {
            bData.categoryEdits[data.id].isDeleted = true;
          }
        }
        break;
      }

      case 'banner': {
        // data: bannerObject
        if (data?.id) {
          const idx = store.banners.findIndex(b => b.id === data.id);
          if (idx >= 0) {
            store.banners[idx] = { ...store.banners[idx], ...data, updatedAt: Date.now() };
          } else {
            store.banners.push({ ...data, updatedAt: Date.now() });
          }
        }
        break;
      }

      default:
        return res.status(400).json({ error: 'Unknown update type' });
    }

    store.lastUpdated = Date.now();
    saveStore();
    broadcastUpdate(slug);

    return res.json({
      success: true,
      branchSlug: slug,
      lastUpdated: store.lastUpdated,
      branchData: bData
    });
  });

  // Bulk import (e.g., initial migration of local storage edits)
  app.post('/api/sync/bulk-sync', (req: Request, res: Response) => {
    const { branchSlug, menuEdits, customItems, deletedIds, purgedIds, categoryEdits, customCategories, banners } = req.body || {};
    const slug = (branchSlug || '').toLowerCase();

    if (slug) {
      if (!store.branches[slug]) store.branches[slug] = defaultBranchData();
      const bData = store.branches[slug];

      if (menuEdits && typeof menuEdits === 'object') {
        Object.assign(bData.menuEdits, menuEdits);
      }
      if (Array.isArray(customItems)) {
        for (const item of customItems) {
          if (item?.id && !bData.customItems.some(i => i.id === item.id)) {
            bData.customItems.push(item);
          }
        }
      }
      if (Array.isArray(deletedIds)) {
        for (const id of deletedIds) {
          if (!bData.deletedIds.includes(id)) bData.deletedIds.push(id);
        }
      }
      if (Array.isArray(purgedIds)) {
        for (const id of purgedIds) {
          if (!bData.purgedIds.includes(id)) bData.purgedIds.push(id);
        }
      }
      if (categoryEdits && typeof categoryEdits === 'object') {
        Object.assign(bData.categoryEdits, categoryEdits);
      }
      if (Array.isArray(customCategories)) {
        for (const cat of customCategories) {
          if (cat?.id && !bData.customCategories.some(c => c.id === cat.id)) {
            bData.customCategories.push(cat);
          }
        }
      }
    }

    if (Array.isArray(banners)) {
      for (const b of banners) {
        if (b?.id) {
          const idx = store.banners.findIndex(x => x.id === b.id);
          if (idx >= 0) store.banners[idx] = { ...store.banners[idx], ...b };
          else store.banners.push(b);
        }
      }
    }

    store.lastUpdated = Date.now();
    saveStore();
    broadcastUpdate(slug);

    return res.json({
      success: true,
      lastUpdated: store.lastUpdated,
      branchData: slug ? store.branches[slug] : null
    });
  });

  // Mount Vite or static server with initial sync store injected for zero-lag hydration
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const htmlPath = path.resolve(__dirname, 'dist', 'index.html');
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf-8');
        const stateScript = `<script>window.__INITIAL_SYNC_STORE__ = ${JSON.stringify(store)};</script>`;
        html = html.replace('</head>', `${stateScript}\n</head>`);
        return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      }
      res.sendFile(htmlPath);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (req.method === 'GET' && req.headers.accept?.includes('text/html') && !url.startsWith('/api') && !url.includes('.')) {
        try {
          const templatePath = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(templatePath)) {
            let template = fs.readFileSync(templatePath, 'utf-8');
            const stateScript = `<script>window.__INITIAL_SYNC_STORE__ = ${JSON.stringify(store)};</script>`;
            template = template.replace('</head>', `${stateScript}\n</head>`);
            const html = await vite.transformIndexHtml(url, template);
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          }
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          return next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Asado Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Asado Server] Failed to start:', err);
  process.exit(1);
});
