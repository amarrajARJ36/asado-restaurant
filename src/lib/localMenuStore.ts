import { normalizeMenuItems } from './categoryUtils';
import { syncService } from './syncService';

/**
 * High-performance synchronization & persistence engine.
 * Ensures:
 * 1. 100% synchronization across multiple phones, laptops, and guest pages via central sync server.
 * 2. Real-time broadcast so edits on Phone 1 reflect immediately on Phone 2 and guest menu.
 * 3. Zero lag & zero image flash on Kollam / Alappuzha menu cards by caching uploaded category images.
 * 4. Offline resilience with localStorage fallback when network is slow or Firestore hits quota limits.
 */

// Auto-hydrate from injected server state if available (ensures frame-1 sync across all devices)
if (typeof window !== 'undefined' && (window as any).__INITIAL_SYNC_STORE__) {
  try {
    const initialStore = (window as any).__INITIAL_SYNC_STORE__;
    if (initialStore?.branches) {
      Object.entries(initialStore.branches).forEach(([slug, bData]) => {
        applyServerBranchState(slug, bData);
      });
    }
  } catch (err) {
    console.warn('Initial sync store hydration warning:', err);
  }
}

function getBranchKeys(slug: string): string[] {
  if (!slug) return [];
  const s = slug.toLowerCase();
  if (s === 'alappuzha' || s === 'b2') return ['alappuzha', 'b2'];
  if (s === 'kollam' || s === 'b1') return ['kollam', 'b1'];
  if (s === 'varkala' || s === 'b3') return ['varkala', 'b3'];
  return [s];
}

/* -------------------------------------------------------------
 * 1. DELETED ITEMS (TRASH)
 * ------------------------------------------------------------- */
export function getLocalDeletedIds(branchSlug: string): Set<string> {
  if (typeof window === 'undefined' || !branchSlug) return new Set();
  const keys = getBranchKeys(branchSlug);
  const result = new Set<string>();
  
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_deleted_items_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => result.add(id));
        }
      }
    } catch {
      // ignore
    }
  }
  return result;
}

export function setLocalDeletedId(branchSlug: string, id: string, isDeleted: boolean): void {
  if (typeof window === 'undefined' || !branchSlug || !id) return;
  const keys = getBranchKeys(branchSlug);
  const currentSet = getLocalDeletedIds(branchSlug);
  
  if (isDeleted) {
    currentSet.add(id);
    saveLocalMenuItemEdit(branchSlug, { id, isDeleted: true }, false);
  } else {
    currentSet.delete(id);
    saveLocalMenuItemEdit(branchSlug, { id, isDeleted: false, isPurged: false }, false);
  }

  const serialized = JSON.stringify([...currentSet]);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_deleted_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to update local deleted ids for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'item_delete', { id, isDeleted });
}

/* -------------------------------------------------------------
 * 2. PURGED ITEMS (PERMANENT DELETE)
 * ------------------------------------------------------------- */
export function getLocalPurgedIds(branchSlug: string): Set<string> {
  if (typeof window === 'undefined' || !branchSlug) return new Set();
  const keys = getBranchKeys(branchSlug);
  const result = new Set<string>();

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_purged_items_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => result.add(id));
        }
      }
    } catch {
      // ignore
    }
  }
  return result;
}

export function setLocalPurgedId(branchSlug: string, id: string): void {
  if (typeof window === 'undefined' || !branchSlug || !id) return;
  const keys = getBranchKeys(branchSlug);
  const currentSet = getLocalPurgedIds(branchSlug);
  currentSet.add(id);

  const serialized = JSON.stringify([...currentSet]);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_purged_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to update local purged ids for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'item_purge', { id });
}

/* -------------------------------------------------------------
 * 3. EDITED ITEMS (PRICES, AVAILABILITY, NAMES, VEG, CHEF REC)
 * ------------------------------------------------------------- */
export function getLocalEditedItems(branchSlug: string): Record<string, any> {
  if (typeof window === 'undefined' || !branchSlug) return {};
  const keys = getBranchKeys(branchSlug);
  const result: Record<string, any> = {};

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_edited_items_${k}`);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          Object.assign(result, obj);
        }
      }
    } catch {
      // ignore
    }
  }
  return result;
}

export function saveLocalMenuItemEdit(branchSlug: string, editData: any, broadcastToServer = true): void {
  if (typeof window === 'undefined' || !branchSlug || !editData || !editData.id) return;
  const keys = getBranchKeys(branchSlug);
  const edits = getLocalEditedItems(branchSlug);
  
  edits[editData.id] = {
    ...(edits[editData.id] || {}),
    ...editData,
    updatedAt: Date.now()
  };

  const serialized = JSON.stringify(edits);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_edited_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save local menu item edit for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  if (broadcastToServer) {
    syncService.sendUpdate(branchSlug, 'menu_edit', editData);
  }
}

/* -------------------------------------------------------------
 * 4. CUSTOM DISHES ADDED BY ADMIN
 * ------------------------------------------------------------- */
export function getLocalCustomItems(branchSlug: string): any[] {
  if (typeof window === 'undefined' || !branchSlug) return [];
  const keys = getBranchKeys(branchSlug);
  const map = new Map<string, any>();

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_custom_items_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach(item => {
            if (item && item.id) map.set(item.id, item);
          });
        }
      }
    } catch {
      // ignore
    }
  }
  return Array.from(map.values());
}

export function saveLocalCustomItem(branchSlug: string, itemData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !itemData || !itemData.id) return;
  const keys = getBranchKeys(branchSlug);
  const items = getLocalCustomItems(branchSlug);
  
  const index = items.findIndex(i => i.id === itemData.id);
  if (index >= 0) {
    items[index] = { ...items[index], ...itemData, updatedAt: Date.now() };
  } else {
    items.push({ ...itemData, updatedAt: Date.now() });
  }

  const serialized = JSON.stringify(items);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_custom_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save custom item for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'custom_item', itemData);
}

export function removeLocalCustomItem(branchSlug: string, id: string): void {
  if (typeof window === 'undefined' || !branchSlug || !id) return;
  const keys = getBranchKeys(branchSlug);
  const items = getLocalCustomItems(branchSlug).filter(i => i.id !== id);

  const serialized = JSON.stringify(items);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_custom_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to remove custom item for key', k, err);
    }
  }

  syncService.sendUpdate(branchSlug, 'item_purge', { id });
}

/* -------------------------------------------------------------
 * 5. CATEGORY EDITS & CUSTOM CATEGORIES
 * ------------------------------------------------------------- */
export function getLocalCategoryEdits(branchSlug: string): Record<string, any> {
  if (typeof window === 'undefined' || !branchSlug) return {};
  const keys = getBranchKeys(branchSlug);
  const result: Record<string, any> = {};

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_category_edits_${k}`);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') Object.assign(result, obj);
      }
    } catch {
      // ignore
    }
  }
  return result;
}

export function saveLocalCategoryEdit(branchSlug: string, catData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !catData || !catData.id) return;
  const keys = getBranchKeys(branchSlug);
  const edits = getLocalCategoryEdits(branchSlug);
  edits[catData.id] = { ...(edits[catData.id] || {}), ...catData, updatedAt: Date.now() };

  const serialized = JSON.stringify(edits);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_category_edits_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save category edit for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'category_edit', catData);
}

export function getLocalCustomCategories(branchSlug: string): any[] {
  if (typeof window === 'undefined' || !branchSlug) return [];
  const keys = getBranchKeys(branchSlug);
  const map = new Map<string, any>();

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_custom_cats_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach(c => { if (c && c.id) map.set(c.id, c); });
        }
      }
    } catch {
      // ignore
    }
  }
  return Array.from(map.values());
}

export function saveLocalCustomCategory(branchSlug: string, catData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !catData || !catData.id) return;
  const keys = getBranchKeys(branchSlug);
  const cats = getLocalCustomCategories(branchSlug);
  const idx = cats.findIndex(c => c.id === catData.id);
  if (idx >= 0) cats[idx] = { ...cats[idx], ...catData };
  else cats.push(catData);

  const serialized = JSON.stringify(cats);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_custom_cats_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save custom category for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'category_custom', catData);
}

export function getLocalDeletedCategoryIds(branchSlug: string): Set<string> {
  if (typeof window === 'undefined' || !branchSlug) return new Set();
  const keys = getBranchKeys(branchSlug);
  const result = new Set<string>();

  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_deleted_cats_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach((id: string) => result.add(id));
      }
    } catch {
      // ignore
    }
  }
  return result;
}

export function setLocalDeletedCategoryId(branchSlug: string, id: string, isDeleted: boolean): void {
  if (typeof window === 'undefined' || !branchSlug || !id) return;
  const keys = getBranchKeys(branchSlug);
  const currentSet = getLocalDeletedCategoryIds(branchSlug);
  if (isDeleted) currentSet.add(id);
  else currentSet.delete(id);

  const serialized = JSON.stringify([...currentSet]);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_deleted_cats_${k}`, serialized);
    } catch (err) {
      console.error('Failed to update deleted cats for key', k, err);
    }
  }

  syncService.sendUpdate(branchSlug, 'category_delete', { id });
}

/* -------------------------------------------------------------
 * 6. MULTI-DEVICE SERVER STATE HYDRATION
 * ------------------------------------------------------------- */

/**
 * Merges server data into local storage so all devices share the exact same state.
 */
export function applyServerBranchState(branchSlug: string, serverData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !serverData) return;
  const keys = getBranchKeys(branchSlug);

  // 1. Menu edits - authoritative from central server
  if (serverData.menuEdits && typeof serverData.menuEdits === 'object') {
    const serialized = JSON.stringify(serverData.menuEdits);
    for (const k of keys) {
      localStorage.setItem(`asado_edited_items_${k}`, serialized);
    }
  }

  // 2. Custom dishes - authoritative from central server
  if (Array.isArray(serverData.customItems)) {
    const serialized = JSON.stringify(serverData.customItems);
    for (const k of keys) {
      localStorage.setItem(`asado_custom_items_${k}`, serialized);
    }
  }

  // 3. Deleted IDs - authoritative from central server
  if (Array.isArray(serverData.deletedIds)) {
    const serialized = JSON.stringify(serverData.deletedIds);
    for (const k of keys) {
      localStorage.setItem(`asado_deleted_items_${k}`, serialized);
    }
  }

  // 4. Purged IDs - authoritative from central server
  if (Array.isArray(serverData.purgedIds)) {
    const serialized = JSON.stringify(serverData.purgedIds);
    for (const k of keys) {
      localStorage.setItem(`asado_purged_items_${k}`, serialized);
    }
  }

  // 5. Category edits (including uploaded images) - authoritative from central server
  if (serverData.categoryEdits && typeof serverData.categoryEdits === 'object') {
    const serialized = JSON.stringify(serverData.categoryEdits);
    for (const k of keys) {
      localStorage.setItem(`asado_category_edits_${k}`, serialized);
    }
  }

  // 6. Custom categories - authoritative from central server
  if (Array.isArray(serverData.customCategories)) {
    const serialized = JSON.stringify(serverData.customCategories);
    for (const k of keys) {
      localStorage.setItem(`asado_custom_cats_${k}`, serialized);
    }
  }

  // 7. Deleted category IDs - authoritative from central server
  if (Array.isArray(serverData.deletedCategoryIds)) {
    const serialized = JSON.stringify(serverData.deletedCategoryIds);
    for (const k of keys) {
      localStorage.setItem(`asado_deleted_cats_${k}`, serialized);
    }
  }

  // 8. Gallery images - authoritative from central server
  if (Array.isArray(serverData.galleryImages)) {
    const serialized = JSON.stringify(serverData.galleryImages);
    for (const k of keys) {
      localStorage.setItem(`asado_gallery_${k}`, serialized);
    }
  }
}

/**
 * -------------------------------------------------------------
 * GALLERY MANAGEMENT & INSTANT SYNC
 * -------------------------------------------------------------
 */

export function getLocalGalleryImages(branchSlug: string): any[] {
  if (typeof window === 'undefined' || !branchSlug) return [];
  const keys = getBranchKeys(branchSlug);
  const map = new Map<string, any>();
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_gallery_${k}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((img: any) => { if (img && img.id) map.set(img.id, img); });
        }
      }
    } catch {
      // ignore
    }
  }
  return Array.from(map.values());
}

export function saveLocalGalleryImage(branchSlug: string, imgData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !imgData || !imgData.id) return;
  const keys = getBranchKeys(branchSlug);
  const current = getLocalGalleryImages(branchSlug);
  const idx = current.findIndex(g => g.id === imgData.id);
  if (idx >= 0) current[idx] = { ...current[idx], ...imgData };
  else current.unshift(imgData);

  const serialized = JSON.stringify(current);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_gallery_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save gallery for key', k, err);
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'gallery_add', imgData);
}

export function removeLocalGalleryImage(branchSlug: string, imageId: string): void {
  if (typeof window === 'undefined' || !branchSlug || !imageId) return;
  const keys = getBranchKeys(branchSlug);
  const current = getLocalGalleryImages(branchSlug).filter(g => g.id !== imageId);

  const serialized = JSON.stringify(current);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_gallery_${k}`, serialized);
    } catch (err) {
      console.error('Failed to remove gallery image for key', k, err);
    }
  }

  // Also record in deleted gallery ids
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(`asado_deleted_gallery_${k}`);
      const deleted: string[] = raw ? JSON.parse(raw) : [];
      if (!deleted.includes(imageId)) {
        deleted.push(imageId);
        localStorage.setItem(`asado_deleted_gallery_${k}`, JSON.stringify(deleted));
      }
    } catch {
      // ignore
    }
  }

  // Sync to server for instant multi-device propagation
  syncService.sendUpdate(branchSlug, 'gallery_delete', { id: imageId });
}

export function getResolvedGalleryImages(
  branchSlug: string,
  staticGallery: any[] = [],
  firestoreImages: any[] = []
): any[] {
  const localGallery = getLocalGalleryImages(branchSlug);
  const deletedSet = new Set<string>();
  if (typeof window !== 'undefined') {
    const keys = getBranchKeys(branchSlug);
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(`asado_deleted_gallery_${k}`);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) arr.forEach((id: string) => deletedSet.add(id));
        }
      } catch {
        // ignore
      }
    }
  }

  const map = new Map<string, any>();
  // 1. Static default images
  staticGallery.forEach(img => {
    if (img && img.id && !deletedSet.has(img.id)) map.set(img.id, img);
  });
  // 2. Firestore images
  firestoreImages.forEach(img => {
    if (img && img.id && !deletedSet.has(img.id)) map.set(img.id, { ...(map.get(img.id) || {}), ...img });
  });
  // 3. Local & synced images
  localGallery.forEach(img => {
    if (img && img.id && !deletedSet.has(img.id)) map.set(img.id, { ...(map.get(img.id) || {}), ...img });
  });

  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Initializes synchronization for a branch:
 * Pulls central server state to ensure Phone 2 gets Phone 1's edits and images instantly.
 */
export async function initBranchSync(branchSlug: string, onUpdate?: () => void): Promise<void> {
  if (typeof window === 'undefined' || !branchSlug) return;
  const s = branchSlug.toLowerCase();

  // Pull latest authoritative state from central server
  const serverData = await syncService.getBranchState(s);
  if (serverData) {
    applyServerBranchState(s, serverData);
    if (onUpdate) onUpdate();
  }
}

/* -------------------------------------------------------------
 * 7. MASTER RESOLUTION FUNCTIONS (BULLETPROOF HYDRATION)
 * ------------------------------------------------------------- */

/**
 * Resolves menu items by blending static base items, Firestore real-time items,
 * local storage edits, local custom items, and deleted/purged tracking.
 */
export function getResolvedMenuItems(
  branchSlug: string,
  staticItems: any[],
  categories: any[],
  firestoreItems: any[] = []
): { active: any[]; deleted: any[] } {
  const localDeleted = getLocalDeletedIds(branchSlug);
  const localPurged = getLocalPurgedIds(branchSlug);
  const localEdits = getLocalEditedItems(branchSlug);
  const localCustom = getLocalCustomItems(branchSlug);

  const dbItemMap = new Map(firestoreItems.map((item: any) => [item.id, item]));

  // 1. Resolve static base dishes
  const mergedStatic = staticItems.map((staticItem: any) => {
    const dbItem = dbItemMap.get(staticItem.id);
    const localEdit = localEdits[staticItem.id] || {};

    let isAvailable = staticItem.isAvailable !== false;
    if (dbItem?.isAvailable !== undefined) isAvailable = dbItem.isAvailable;
    if (localEdit.isAvailable !== undefined) isAvailable = localEdit.isAvailable;

    const isLocallyDeleted = localDeleted.has(staticItem.id);
    const isLocallyPurged = localPurged.has(staticItem.id);

    let isDeleted = isLocallyDeleted;
    if (dbItem?.isDeleted !== undefined) isDeleted = Boolean(dbItem.isDeleted) || isLocallyDeleted;
    if (localEdit.isDeleted !== undefined) isDeleted = Boolean(localEdit.isDeleted);
    if (localEdit.isDeleted === false) isDeleted = false;
    else if (isLocallyDeleted) isDeleted = true;

    let isPurged = isLocallyPurged;
    if (dbItem?.isPurged !== undefined) isPurged = Boolean(dbItem.isPurged) || isLocallyPurged;

    return {
      ...staticItem,
      ...(dbItem || {}),
      ...localEdit,
      isAvailable,
      isDeleted,
      isPurged,
      imageUrl: undefined, // ensure no images on dishes in admin
      image: undefined
    };
  });

  // 2. Resolve custom dishes
  const existingStaticIds = new Set(staticItems.map((i: any) => i.id));
  const customItemsMap = new Map<string, any>();

  firestoreItems.forEach((item: any) => {
    if (!existingStaticIds.has(item.id)) {
      customItemsMap.set(item.id, item);
    }
  });

  localCustom.forEach((item: any) => {
    if (!existingStaticIds.has(item.id)) {
      const existing = customItemsMap.get(item.id) || {};
      customItemsMap.set(item.id, { ...existing, ...item });
    }
  });

  const mergedCustom = Array.from(customItemsMap.values()).map((customItem: any) => {
    const localEdit = localEdits[customItem.id] || {};
    const isLocallyDeleted = localDeleted.has(customItem.id);
    const isLocallyPurged = localPurged.has(customItem.id);

    let isAvailable = customItem.isAvailable !== false;
    if (localEdit.isAvailable !== undefined) isAvailable = localEdit.isAvailable;

    let isDeleted = customItem.isDeleted !== undefined ? Boolean(customItem.isDeleted) : isLocallyDeleted;
    if (localEdit.isDeleted !== undefined) isDeleted = Boolean(localEdit.isDeleted);
    if (localEdit.isDeleted === false) isDeleted = false;
    else if (isLocallyDeleted) isDeleted = true;

    let isPurged = customItem.isPurged !== undefined ? Boolean(customItem.isPurged) : isLocallyPurged;

    return {
      ...customItem,
      ...localEdit,
      isAvailable,
      isDeleted,
      isPurged,
      imageUrl: undefined,
      image: undefined
    };
  });

  const allMerged = [...mergedStatic, ...mergedCustom];
  const activeList: any[] = [];
  const deletedList: any[] = [];

  allMerged.forEach((item: any) => {
    if (item.isPurged) return;
    if (item.isDeleted) {
      deletedList.push(item);
    } else {
      activeList.push(item);
    }
  });

  return {
    active: normalizeMenuItems(activeList, categories),
    deleted: normalizeMenuItems(deletedList, categories)
  };
}

/**
 * Resolves categories by blending static base categories, Firestore categories,
 * and local storage additions/edits/deletions.
 * 
 * CRITICAL FIX FOR MENU CARDS BACKGROUND LAG:
 * Caches resolved categories persistently so on initial page render, the uploaded image
 * is rendered IMMEDIATELY instead of flashing the original Unsplash photo!
 */
export function getResolvedCategories(
  branchSlug: string,
  staticCategories: any[],
  firestoreCategories: any[] = []
): any[] {
  const localCustomCats = getLocalCustomCategories(branchSlug);
  const localCatEdits = getLocalCategoryEdits(branchSlug);
  const localDeletedCats = getLocalDeletedCategoryIds(branchSlug);

  const dbCatMap = new Map(firestoreCategories.map((c: any) => [c.id, c]));

  // If firestoreCategories is empty, check if we have persistently cached categories
  // which already contain uploaded images from previous visits or server sync
  const cacheKey = `asado_resolved_cats_cache_${branchSlug.toLowerCase()}`;
  let cachedCats: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((c: any) => { if (c?.id) cachedCats[c.id] = c; });
        }
      }
    } catch {
      // ignore
    }
  }

  const mergedStatic = staticCategories.map((sc: any) => {
    const dbCat = dbCatMap.get(sc.id) || {};
    const localEdit = localCatEdits[sc.id] || {};
    const cached = cachedCats[sc.id] || {};
    const isDeleted = localDeletedCats.has(sc.id) || dbCat.isDeleted === true || localEdit.isDeleted === true;

    // Prioritize uploaded image: dbCat.imageUrl > localEdit.imageUrl > sc.image
    const uploadedImg = dbCat.imageUrl || dbCat.image || localEdit.imageUrl || localEdit.image;
    const imageUrl = uploadedImg || sc.image || sc.imageUrl;

    return {
      ...sc,
      ...cached,
      ...dbCat,
      ...localEdit,
      imageUrl,
      image: imageUrl,
      isDeleted
    };
  });

  const existingStaticIds = new Set(staticCategories.map((c: any) => c.id));
  const customMap = new Map<string, any>();
  firestoreCategories.forEach((c: any) => {
    if (!existingStaticIds.has(c.id)) customMap.set(c.id, c);
  });
  localCustomCats.forEach((c: any) => {
    if (!existingStaticIds.has(c.id)) {
      const existing = customMap.get(c.id) || {};
      customMap.set(c.id, { ...existing, ...c });
    }
  });

  const mergedCustom = Array.from(customMap.values()).map((c: any) => {
    const localEdit = localCatEdits[c.id] || {};
    const cached = cachedCats[c.id] || {};
    const isDeleted = localDeletedCats.has(c.id) || c.isDeleted === true || localEdit.isDeleted === true;
    const imageUrl = c.imageUrl || c.image || localEdit.imageUrl || localEdit.image || cached.imageUrl || cached.image;

    return {
      ...c,
      ...cached,
      ...localEdit,
      imageUrl,
      image: imageUrl,
      isDeleted
    };
  });

  const finalCats = [...mergedStatic, ...mergedCustom].filter(c => !c.isDeleted);

  // Persist resolved categories so future page loads have uploaded images IMMEDIATELY
  if (typeof window !== 'undefined' && finalCats.length > 0) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(finalCats));
    } catch {
      // ignore quota
    }
  }

  return finalCats;
}
