import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { kollamMenu, alappuzhaMenu, kollamCategories, alappuzhaCategories } from './src/data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface BranchStoreData {
  branchSlug: string;
  version: number;
  lastUpdated: number;
  items: any[];
  categories: any[];
}

const memoryStore: Record<string, BranchStoreData> = {};

function getBranchFilePath(slug: string): string {
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return path.join(DATA_DIR, `branch_${safeSlug}.json`);
}

function loadBranchData(slug: string): BranchStoreData {
  const normSlug = slug.toLowerCase();
  if (memoryStore[normSlug]) {
    return memoryStore[normSlug];
  }

  const filePath = getBranchFilePath(normSlug);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.categories)) {
        memoryStore[normSlug] = parsed;
        return parsed;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err);
    }
  }

  // Seed default data
  let defaultItems: any[] = [];
  let defaultCategories: any[] = [];

  if (normSlug === 'kollam') {
    defaultItems = kollamMenu.map(item => ({
      ...item,
      branchSlug: 'kollam',
      isAvailable: item.isAvailable !== false,
      isDeleted: false,
      isPurged: false
    }));
    defaultCategories = kollamCategories.map(cat => ({
      ...cat,
      branchSlug: 'kollam',
      image: undefined,
      imageUrl: undefined
    }));
  } else if (normSlug === 'alappuzha') {
    defaultItems = alappuzhaMenu.map(item => ({
      ...item,
      branchSlug: 'alappuzha',
      isAvailable: item.isAvailable !== false,
      isDeleted: false,
      isPurged: false
    }));
    defaultCategories = alappuzhaCategories.map(cat => ({
      ...cat,
      branchSlug: 'alappuzha',
      image: undefined,
      imageUrl: undefined
    }));
  }

  const initialData: BranchStoreData = {
    branchSlug: normSlug,
    version: 1,
    lastUpdated: Date.now(),
    items: defaultItems,
    categories: defaultCategories
  };

  saveBranchData(initialData);
  return initialData;
}

function saveBranchData(data: BranchStoreData): void {
  data.version = (data.version || 0) + 1;
  data.lastUpdated = Date.now();
  memoryStore[data.branchSlug] = data;

  const filePath = getBranchFilePath(data.branchSlug);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to write file ${filePath}:`, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large payload images (base64 image uploads)
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // API Routes
  app.get('/api/menu/:branchSlug', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    res.json({
      success: true,
      branchSlug: data.branchSlug,
      version: data.version,
      lastUpdated: data.lastUpdated,
      items: data.items,
      categories: data.categories
    });
  });

  app.get('/api/menu/:branchSlug/version', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    res.json({
      branchSlug: data.branchSlug,
      version: data.version,
      lastUpdated: data.lastUpdated
    });
  });

  // High-performance image compression endpoint using sharp (ideal for mobile / high-res uploads)
  app.post('/api/compress-image', async (req: Request, res: Response) => {
    try {
      const { image, maxWidth = 480, maxHeight = 320, quality = 65 } = req.body;
      if (!image || typeof image !== 'string') {
        res.status(400).json({ error: 'Image data URL is required' });
        return;
      }
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        res.status(400).json({ error: 'Invalid base64 data URL' });
        return;
      }
      const inputBuffer = Buffer.from(matches[2], 'base64');
      const compressedBuffer = await sharp(inputBuffer)
        .resize({ width: Math.min(Number(maxWidth), 800), height: Math.min(Number(maxHeight), 600), fit: 'cover', withoutEnlargement: true })
        .webp({ quality: Number(quality) || 65, effort: 5 })
        .toBuffer();

      const compressedDataUrl = 'data:image/webp;base64,' + compressedBuffer.toString('base64');
      res.json({ success: true, compressed: compressedDataUrl, bytes: compressedBuffer.length });
    } catch (err: any) {
      console.error('Server image compression failed:', err);
      res.status(500).json({ error: err.message || 'Image compression failed' });
    }
  });

  // Add or update single item
  app.post('/api/menu/:branchSlug/item', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const incomingItem = req.body.item;

    if (!incomingItem || !incomingItem.id) {
      res.status(400).json({ error: 'Item with ID is required' });
      return;
    }

    const idx = data.items.findIndex(i => i.id === incomingItem.id);
    if (idx >= 0) {
      data.items[idx] = {
        ...data.items[idx],
        ...incomingItem,
        branchSlug: slug,
        updatedAt: Date.now()
      };
    } else {
      data.items.push({
        ...incomingItem,
        branchSlug: slug,
        isAvailable: incomingItem.isAvailable !== false,
        isDeleted: false,
        isPurged: false,
        createdAt: incomingItem.createdAt || Date.now(),
        updatedAt: Date.now()
      });
    }

    saveBranchData(data);
    res.json({ success: true, version: data.version, item: idx >= 0 ? data.items[idx] : incomingItem });
  });

  // Reorder items
  app.post('/api/menu/:branchSlug/reorder', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const { reorderedItems } = req.body;

    if (Array.isArray(reorderedItems)) {
      const orderMap = new Map<string, number>();
      reorderedItems.forEach((r: any) => {
        if (r && r.id !== undefined && r.order !== undefined) {
          orderMap.set(r.id, r.order);
        }
      });

      data.items = data.items.map(item => {
        if (orderMap.has(item.id)) {
          return { ...item, order: orderMap.get(item.id) };
        }
        return item;
      });

      saveBranchData(data);
    }

    res.json({ success: true, version: data.version });
  });

  // Delete item (soft delete or purge)
  app.delete('/api/menu/:branchSlug/item/:itemId', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const itemId = req.params.itemId;
    const purge = req.query.purge === 'true' || req.body?.purge === true;
    const data = loadBranchData(slug);

    if (purge) {
      data.items = data.items.filter(i => i.id !== itemId);
    } else {
      data.items = data.items.map(i => {
        if (i.id === itemId) {
          return { ...i, isDeleted: true, deletedAt: Date.now() };
        }
        return i;
      });
    }

    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });

  // Restore deleted item
  app.post('/api/menu/:branchSlug/item/:itemId/restore', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const itemId = req.params.itemId;
    const data = loadBranchData(slug);

    data.items = data.items.map(i => {
      if (i.id === itemId) {
        return { ...i, isDeleted: false, isPurged: false, status: 'active', deletedAt: null };
      }
      return i;
    });

    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });

  // Category add or update
  app.post('/api/menu/:branchSlug/category', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const incomingCat = req.body.category;

    if (!incomingCat || !incomingCat.id) {
      res.status(400).json({ error: 'Category with ID is required' });
      return;
    }

    const idx = data.categories.findIndex(c => c.id === incomingCat.id);
    if (idx >= 0) {
      data.categories[idx] = {
        ...data.categories[idx],
        ...incomingCat,
        branchSlug: slug
      };
    } else {
      data.categories.push({
        ...incomingCat,
        branchSlug: slug
      });
    }

    saveBranchData(data);
    res.json({ success: true, version: data.version, category: incomingCat });
  });

  // Category delete
  app.delete('/api/menu/:branchSlug/category/:categoryId', (req: Request, res: Response) => {
    const slug = req.params.branchSlug;
    const catId = req.params.categoryId;
    const data = loadBranchData(slug);

    data.categories = data.categories.filter(c => c.id !== catId);
    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASADO Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
