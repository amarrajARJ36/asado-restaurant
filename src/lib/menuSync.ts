import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { normalizeMenuItems } from './categoryUtils';

export interface SyncedMenuItem {
  id: string;
  name: string;
  price: string | number;
  category: string;
  category_id?: string;
  description?: string;
  isVeg?: boolean;
  isChefRecommendation?: boolean;
  isAvailable?: boolean;
  isDeleted?: boolean;
  isPurged?: boolean;
  deletedAt?: number | null;
  imageUrl?: string | null;
  image?: string | null;
  order?: number;
  status?: string;
  branchSlug?: string;
  branch_id?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface SyncedCategory {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  branch_id?: string;
  branchSlug?: string;
  isDeleted?: boolean;
}

const CACHE_KEY_PREFIX = 'asado_synced_menu_';

function getLocalCache(branchSlug: string): { items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${branchSlug}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading menu sync cache:', err);
  }
  return null;
}

function setLocalCache(branchSlug: string, data: { items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${branchSlug}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Error setting menu sync cache:', err);
  }
}

export async function fetchBranchMenu(branchSlug: string): Promise<{ items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number }> {
  try {
    const res = await fetch(`/api/menu/${branchSlug}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch menu: ${res.statusText}`);
    }
    const data = await res.json();
    const result = {
      items: data.items || [],
      categories: data.categories || [],
      version: data.version || 1
    };
    setLocalCache(branchSlug, result);
    return result;
  } catch (err) {
    console.warn('Fetch menu error, checking cache:', err);
    const cached = getLocalCache(branchSlug);
    if (cached) return cached;
    throw err;
  }
}

export function useMenuSync(branchSlug: string | undefined) {
  const safeSlug = (branchSlug || 'kollam').toLowerCase();
  const cached = getLocalCache(safeSlug);

  const [items, setItems] = useState<SyncedMenuItem[]>(() => cached?.items || []);
  const [categories, setCategories] = useState<SyncedCategory[]>(() => cached?.categories || []);
  const [version, setVersion] = useState<number>(() => cached?.version || 0);
  const [loading, setLoading] = useState<boolean>(!cached);
  const versionRef = useRef(version);
  versionRef.current = version;

  const refreshMenu = useCallback(async () => {
    try {
      const data = await fetchBranchMenu(safeSlug);
      setItems(data.items);
      setCategories(data.categories);
      setVersion(data.version);
      setLoading(false);
    } catch (err) {
      console.error('refreshMenu failed:', err);
      setLoading(false);
    }
  }, [safeSlug]);

  // Initial load
  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  // Multi-device real-time sync via fast version polling (every 2.5s)
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/menu/${safeSlug}/version`);
        if (res.ok) {
          const vData = await res.json();
          if (isMounted && vData.version && vData.version !== versionRef.current) {
            console.log(`[MenuSync] Newer version detected (${vData.version} vs ${versionRef.current}), syncing across devices...`);
            refreshMenu();
          }
        }
      } catch {
        // Silently catch background poll glitches
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [safeSlug, refreshMenu]);

  // Save / Update an item
  const saveItem = useCallback(async (item: SyncedMenuItem) => {
    const itemWithSlug: SyncedMenuItem = {
      ...item,
      branchSlug: safeSlug,
      updatedAt: Date.now()
    };

    // Immediate local optimistic state update
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      let updated: SyncedMenuItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...itemWithSlug };
      } else {
        updated = [...prev, itemWithSlug];
      }
      setLocalCache(safeSlug, { items: updated, categories, version: versionRef.current + 1 });
      return updated;
    });

    try {
      // 1. Send to server persistence (for cross-device & refresh sync)
      const res = await fetch(`/api/menu/${safeSlug}/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemWithSlug })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) {
          setVersion(json.version);
        }
      }
    } catch (err) {
      console.warn('API saveItem error:', err);
    }

    // 2. Background Firestore update (so Firestore cloud copy is updated when possible)
    try {
      const { id, ...firestoreData } = itemWithSlug;
      await setDoc(doc(db, 'menuItems', id), {
        id,
        ...firestoreData
      }, { merge: true });
    } catch (err) {
      // Non-blocking Firestore error (e.g. quota limit)
      console.warn('Firestore menuItems write warning:', err);
    }
  }, [safeSlug, categories]);

  // Toggle item availability
  const toggleAvailability = useCallback(async (item: SyncedMenuItem) => {
    const nextAvailability = !(item.isAvailable !== false);
    const updated = { ...item, isAvailable: nextAvailability };
    await saveItem(updated);
  }, [saveItem]);

  // Toggle item veg status
  const toggleVeg = useCallback(async (item: SyncedMenuItem) => {
    const updated = { ...item, isVeg: !item.isVeg };
    await saveItem(updated);
  }, [saveItem]);

  // Toggle chef recommendation
  const toggleChefRec = useCallback(async (item: SyncedMenuItem) => {
    const updated = { ...item, isChefRecommendation: !item.isChefRecommendation };
    await saveItem(updated);
  }, [saveItem]);

  // Soft delete item
  const deleteItem = useCallback(async (itemId: string) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, isDeleted: true, deletedAt: Date.now() } : i);
      setLocalCache(safeSlug, { items: updated, categories, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/item/${itemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API deleteItem error:', err);
    }

    try {
      await setDoc(doc(db, 'menuItems', itemId), {
        id: itemId,
        isDeleted: true,
        deletedAt: Date.now(),
        branchSlug: safeSlug
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    }
  }, [safeSlug, categories]);

  // Restore deleted item
  const restoreItem = useCallback(async (itemId: string) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, isDeleted: false, isPurged: false, status: 'active', deletedAt: null } : i);
      setLocalCache(safeSlug, { items: updated, categories, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/item/${itemId}/restore`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API restoreItem error:', err);
    }

    try {
      await setDoc(doc(db, 'menuItems', itemId), {
        id: itemId,
        isDeleted: false,
        isPurged: false,
        status: 'active',
        deletedAt: null,
        branchSlug: safeSlug
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore restore warning:', err);
    }
  }, [safeSlug, categories]);

  // Permanent purge
  const purgeItem = useCallback(async (itemId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== itemId);
      setLocalCache(safeSlug, { items: updated, categories, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/item/${itemId}?purge=true`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API purgeItem error:', err);
    }

    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
    } catch (err) {
      console.warn('Firestore purge warning:', err);
    }
  }, [safeSlug, categories]);

  // Reorder items
  const reorderItems = useCallback(async (reordered: Array<{ id: string; order: number; category?: string }>) => {
    const orderMap = new Map<string, number>();
    reordered.forEach(r => orderMap.set(r.id, r.order));

    setItems(prev => {
      const updated = prev.map(item => {
        if (orderMap.has(item.id)) {
          return { ...item, order: orderMap.get(item.id) };
        }
        return item;
      });
      setLocalCache(safeSlug, { items: updated, categories, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedItems: reordered })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API reorder error:', err);
    }

    try {
      const batch = writeBatch(db);
      reordered.forEach(r => {
        const ref = doc(db, 'menuItems', r.id);
        batch.set(ref, { order: r.order, branchSlug: safeSlug }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore batch reorder warning:', err);
    }
  }, [safeSlug, categories]);

  // Save / Update Category
  const saveCategory = useCallback(async (cat: SyncedCategory) => {
    const catWithSlug: SyncedCategory = {
      ...cat,
      branchSlug: safeSlug
    };

    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      let updated: SyncedCategory[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...catWithSlug };
      } else {
        updated = [...prev, catWithSlug];
      }
      setLocalCache(safeSlug, { items, categories: updated, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catWithSlug })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API saveCategory error:', err);
    }

    try {
      await setDoc(doc(db, 'categories', cat.id), catWithSlug, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCategory warning:', err);
    }
  }, [safeSlug, items]);

  // Delete Category
  const deleteCategory = useCallback(async (catId: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== catId);
      setLocalCache(safeSlug, { items, categories: updated, version: versionRef.current + 1 });
      return updated;
    });

    try {
      const res = await fetch(`/api/menu/${safeSlug}/category/${catId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.version) setVersion(json.version);
      }
    } catch (err) {
      console.warn('API deleteCategory error:', err);
    }

    try {
      await deleteDoc(doc(db, 'categories', catId));
    } catch (err) {
      console.warn('Firestore deleteCategory warning:', err);
    }
  }, [safeSlug, items]);

  // Normalized active items for guest view or active admin view
  const activeItems = items.filter(i => i.isDeleted !== true && i.isPurged !== true);
  const deletedItems = items.filter(i => i.isDeleted === true && i.isPurged !== true);
  const normalizedActiveItems = normalizeMenuItems(activeItems, categories);
  const normalizedDeletedItems = normalizeMenuItems(deletedItems, categories);

  return {
    items,
    activeItems,
    deletedItems,
    normalizedActiveItems,
    normalizedDeletedItems,
    categories,
    loading,
    version,
    saveItem,
    toggleAvailability,
    toggleVeg,
    toggleChefRec,
    deleteItem,
    restoreItem,
    purgeItem,
    reorderItems,
    saveCategory,
    deleteCategory,
    refreshMenu
  };
}
