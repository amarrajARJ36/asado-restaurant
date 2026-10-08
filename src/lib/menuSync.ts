import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { normalizeMenuItems, resolveItemCategory } from './categoryUtils';
import {
  kollamMenu,
  alappuzhaMenu,
  kollamCategories,
  alappuzhaCategories
} from '../data';

export interface SyncedMenuItem {
  id: string;
  name: string;
  price: string | number;
  category?: string;
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

/**
 * Returns the rich, built-in baseline menu items and categories for each branch.
 * This guarantees the user NEVER sees an empty menu even when newly deployed,
 * in incognito mode, offline, or while database synchronization is in progress.
 */
export function getDefaultBranchData(branchSlug: string): { items: SyncedMenuItem[]; categories: SyncedCategory[] } {
  const normSlug = (branchSlug || 'kollam').toLowerCase().trim();

  if (normSlug === 'alappuzha' || normSlug === 'b2') {
    const categories: SyncedCategory[] = alappuzhaCategories.map(cat => ({
      ...cat,
      branchSlug: 'alappuzha',
      branch_id: 'b2'
    }));
    const items: SyncedMenuItem[] = alappuzhaMenu.map((item, idx) => ({
      ...item,
      category: resolveItemCategory(item, categories),
      branchSlug: 'alappuzha',
      branch_id: 'b2',
      order: typeof item.order === 'number' ? item.order : idx,
      isAvailable: item.isAvailable !== false,
      isDeleted: false,
      isPurged: false
    }));
    return { items, categories };
  }

  // Default: Kollam
  const categories: SyncedCategory[] = kollamCategories.map(cat => ({
    ...cat,
    branchSlug: 'kollam',
    branch_id: 'b1'
  }));
  const items: SyncedMenuItem[] = kollamMenu.map((item, idx) => ({
    ...item,
    category: resolveItemCategory(item, categories),
    branchSlug: 'kollam',
    branch_id: 'b1',
    order: typeof item.order === 'number' ? item.order : idx,
    isAvailable: item.isAvailable !== false,
    isDeleted: false,
    isPurged: false
  }));
  return { items, categories };
}

function getLocalCache(branchSlug: string): { items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${branchSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0 && Array.isArray(parsed.categories)) {
        return parsed;
      }
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

/**
 * Hook to manage real-time synchronized branch menu data.
 * - Always initializes with populated data (from cache or rich default data) so items are never gone.
 * - Uses a single consolidated document per branch in Firestore (`branchMenus/${safeSlug}`) for
 *   blazing fast real-time cross-device sync without exceeding daily read quotas.
 * - Persists updates immediately to localStorage so reloads never revert changes.
 * - Gracefully falls back if network or server is offline.
 */
export function useMenuSync(branchSlug: string | undefined) {
  const safeSlug = (branchSlug || 'kollam').toLowerCase().trim();
  const defaultData = getDefaultBranchData(safeSlug);
  const cached = getLocalCache(safeSlug);

  const [items, setItems] = useState<SyncedMenuItem[]>(() => cached?.items || defaultData.items);
  const [categories, setCategories] = useState<SyncedCategory[]>(() => cached?.categories || defaultData.categories);
  const [version, setVersion] = useState<number>(() => cached?.version || 1);
  const [loading, setLoading] = useState<boolean>(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const versionRef = useRef(version);
  versionRef.current = version;

  // Real-time Firestore sync via single consolidated document per branch
  useEffect(() => {
    let isMounted = true;
    const docRef = doc(db, 'branchMenus', safeSlug);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!isMounted) return;

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const incomingItems = data.items as SyncedMenuItem[];
            const incomingCats = Array.isArray(data.categories) && data.categories.length > 0
              ? (data.categories as SyncedCategory[])
              : categoriesRef.current;
            const incomingVersion = typeof data.version === 'number' ? data.version : (versionRef.current + 1);

            setItems(incomingItems);
            setCategories(incomingCats);
            setVersion(incomingVersion);
            setLocalCache(safeSlug, {
              items: incomingItems,
              categories: incomingCats,
              version: incomingVersion
            });
            setLoading(false);
            return;
          }
        }

        // If document doesn't exist yet in Firestore, seed it once in the cloud so all devices sync
        const currentItems = itemsRef.current.length > 0 ? itemsRef.current : defaultData.items;
        const currentCats = categoriesRef.current.length > 0 ? categoriesRef.current : defaultData.categories;
        setDoc(docRef, {
          branchSlug: safeSlug,
          version: 1,
          lastUpdated: Date.now(),
          items: currentItems,
          categories: currentCats
        }, { merge: true }).catch((err) => {
          console.warn('Initial branchMenus cloud seed warning:', err);
        });
      },
      (error) => {
        // Safe warning on quota limit, permission, or offline without breaking the UI
        console.warn('Firestore branchMenus snapshot warning:', error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [safeSlug]);

  // Optional background fetch from API server if running in full-stack mode
  const refreshMenu = useCallback(async () => {
    try {
      const res = await fetch(`/api/menu/${safeSlug}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data?.items) && data.items.length > 0) {
            setItems(data.items);
            if (Array.isArray(data.categories) && data.categories.length > 0) {
              setCategories(data.categories);
            }
            if (data.version) {
              setVersion(data.version);
            }
            setLocalCache(safeSlug, {
              items: data.items,
              categories: data.categories || categoriesRef.current,
              version: data.version || versionRef.current
            });
          }
        }
      }
    } catch {
      // Ignore API errors when running client-only
    }
  }, [safeSlug]);

  // Multi-device helper to broadcast consolidated branch state to Firestore and local storage
  const syncConsolidatedMenu = useCallback(async (
    newItems: SyncedMenuItem[],
    newCats: SyncedCategory[],
    newVersion: number
  ) => {
    // 1. Save to localStorage immediately (guarantees no reverts on refresh)
    setLocalCache(safeSlug, {
      items: newItems,
      categories: newCats,
      version: newVersion
    });

    // 2. Broadcast to Firestore single consolidated doc (real-time sync across devices)
    try {
      const docRef = doc(db, 'branchMenus', safeSlug);
      await setDoc(docRef, {
        branchSlug: safeSlug,
        version: newVersion,
        lastUpdated: Date.now(),
        items: newItems,
        categories: newCats
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore branchMenus sync warning:', err);
    }
  }, [safeSlug]);

  // Save / Update an item
  const saveItem = useCallback(async (item: SyncedMenuItem) => {
    const itemWithSlug: SyncedMenuItem = {
      ...item,
      branchSlug: safeSlug,
      updatedAt: Date.now()
    };

    const currentItems = itemsRef.current;
    const idx = currentItems.findIndex(i => i.id === item.id);
    let updated: SyncedMenuItem[];
    if (idx >= 0) {
      updated = [...currentItems];
      updated[idx] = { ...updated[idx], ...itemWithSlug };
    } else {
      updated = [...currentItems, itemWithSlug];
    }

    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(updated, categoriesRef.current, nextVer);

    // Also notify companion API if running
    try {
      fetch(`/api/menu/${safeSlug}/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemWithSlug })
      }).catch(() => {});
    } catch {
      // Ignore
    }

    // Individual item doc backup
    try {
      const { id, ...rest } = itemWithSlug;
      setDoc(doc(db, 'menuItems', id), { id, ...rest }, { merge: true }).catch(() => {});
    } catch {
      // Ignore
    }
  }, [safeSlug, syncConsolidatedMenu]);

  // Toggle item availability (Available vs Sold Out)
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

  // Soft delete item (moves to trash)
  const deleteItem = useCallback(async (itemId: string) => {
    const currentItems = itemsRef.current;
    const updated = currentItems.map(i =>
      i.id === itemId ? { ...i, isDeleted: true, deletedAt: Date.now() } : i
    );
    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(updated, categoriesRef.current, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/item/${itemId}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    try {
      setDoc(doc(db, 'menuItems', itemId), {
        id: itemId,
        isDeleted: true,
        deletedAt: Date.now(),
        branchSlug: safeSlug
      }, { merge: true }).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

  // Restore deleted item from trash
  const restoreItem = useCallback(async (itemId: string) => {
    const currentItems = itemsRef.current;
    const updated = currentItems.map(i =>
      i.id === itemId
        ? { ...i, isDeleted: false, isPurged: false, status: 'active', deletedAt: null }
        : i
    );
    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(updated, categoriesRef.current, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/item/${itemId}/restore`, { method: 'POST' }).catch(() => {});
    } catch {}

    try {
      setDoc(doc(db, 'menuItems', itemId), {
        id: itemId,
        isDeleted: false,
        isPurged: false,
        status: 'active',
        deletedAt: null,
        branchSlug: safeSlug
      }, { merge: true }).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

  // Permanent purge
  const purgeItem = useCallback(async (itemId: string) => {
    const currentItems = itemsRef.current;
    const updated = currentItems.filter(i => i.id !== itemId);
    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(updated, categoriesRef.current, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/item/${itemId}?purge=true`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    try {
      deleteDoc(doc(db, 'menuItems', itemId)).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

  // Reorder items
  const reorderItems = useCallback(async (reordered: Array<{ id: string; order: number; category?: string }>) => {
    const orderMap = new Map<string, number>();
    reordered.forEach(r => orderMap.set(r.id, r.order));

    const currentItems = itemsRef.current;
    const updated = currentItems.map(item => {
      if (orderMap.has(item.id)) {
        return { ...item, order: orderMap.get(item.id) };
      }
      return item;
    });

    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(updated, categoriesRef.current, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedItems: reordered })
      }).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

  // Save / Update Category
  const saveCategory = useCallback(async (cat: SyncedCategory) => {
    const catWithSlug: SyncedCategory = {
      ...cat,
      branchSlug: safeSlug
    };

    const currentCats = categoriesRef.current;
    const idx = currentCats.findIndex(c => c.id === cat.id);
    let updated: SyncedCategory[];
    if (idx >= 0) {
      updated = [...currentCats];
      updated[idx] = { ...updated[idx], ...catWithSlug };
    } else {
      updated = [...currentCats, catWithSlug];
    }

    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(itemsRef.current, updated, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: catWithSlug })
      }).catch(() => {});
    } catch {}

    try {
      setDoc(doc(db, 'categories', cat.id), catWithSlug, { merge: true }).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

  // Delete Category
  const deleteCategory = useCallback(async (catId: string) => {
    const currentCats = categoriesRef.current;
    const updated = currentCats.filter(c => c.id !== catId);
    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    await syncConsolidatedMenu(itemsRef.current, updated, nextVer);

    try {
      fetch(`/api/menu/${safeSlug}/category/${catId}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    try {
      deleteDoc(doc(db, 'categories', catId)).catch(() => {});
    } catch {}
  }, [safeSlug, syncConsolidatedMenu]);

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
