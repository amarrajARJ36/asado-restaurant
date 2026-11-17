import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
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
  isActive?: boolean;
  order?: number;
}

const CACHE_KEY_PREFIX = 'asado_supabase_menu_';

/**
 * Returns baseline menu data if offline or initializing.
 */
export function getDefaultBranchData(branchSlug: string): { items: SyncedMenuItem[]; categories: SyncedCategory[] } {
  const normSlug = (branchSlug || 'kollam').toLowerCase().trim();

  if (normSlug === 'alappuzha' || normSlug === 'b2') {
    const categories: SyncedCategory[] = alappuzhaCategories.map((cat, idx) => ({
      ...cat,
      order: typeof (cat as any).order === 'number' ? (cat as any).order : idx,
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
  const categories: SyncedCategory[] = kollamCategories.map((cat, idx) => ({
    ...cat,
    order: typeof (cat as any).order === 'number' ? (cat as any).order : idx,
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

interface LocalMenuCache {
  items: SyncedMenuItem[];
  categories: SyncedCategory[];
  version: number;
  cachedAt?: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute cache TTL for public visitors to reduce egress

function getLocalCache(branchSlug: string): LocalMenuCache | null {
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
    console.warn('Error reading menu cache:', err);
  }
  return null;
}

function setLocalCache(branchSlug: string, data: { items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number; cachedAt?: number }) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...data,
      cachedAt: data.cachedAt || Date.now()
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${branchSlug}`, JSON.stringify(payload));
  } catch (err) {
    console.warn('Error setting menu cache:', err);
  }
}

export function getPendingSyncItems(branchSlug: string): SyncedMenuItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`asado_pending_sync_${branchSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function addPendingSyncItem(branchSlug: string, item: SyncedMenuItem) {
  if (typeof window === 'undefined') return;
  try {
    const pending = getPendingSyncItems(branchSlug);
    const existingIdx = pending.findIndex(p => p.id === item.id);
    if (existingIdx >= 0) {
      pending[existingIdx] = item;
    } else {
      pending.push(item);
    }
    localStorage.setItem(`asado_pending_sync_${branchSlug}`, JSON.stringify(pending));
  } catch {}
}

export function clearPendingSyncItems(branchSlug: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`asado_pending_sync_${branchSlug}`);
  } catch {}
}

export function getPendingSyncCategories(branchSlug: string): SyncedCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`asado_pending_sync_cats_${branchSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function addPendingSyncCategory(branchSlug: string, cat: SyncedCategory) {
  if (typeof window === 'undefined') return;
  try {
    const pending = getPendingSyncCategories(branchSlug);
    const existingIdx = pending.findIndex(p => p.id === cat.id || (p.name && cat.name && p.name.trim().toLowerCase() === cat.name.trim().toLowerCase()));
    if (existingIdx >= 0) {
      pending[existingIdx] = cat;
    } else {
      pending.push(cat);
    }
    localStorage.setItem(`asado_pending_sync_cats_${branchSlug}`, JSON.stringify(pending));
  } catch {}
}

export function clearPendingSyncCategories(branchSlug: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`asado_pending_sync_cats_${branchSlug}`);
  } catch {}
}

function rowToMenuItem(row: any): SyncedMenuItem {
  return {
    id: row.id,
    branchSlug: row.branch_slug,
    branch_id: row.branch_slug === 'kollam' ? 'b1' : (row.branch_slug === 'alappuzha' ? 'b2' : 'b3'),
    category_id: row.category_id,
    category: row.category,
    name: row.name,
    price: row.price,
    description: row.description || '',
    imageUrl: row.image_url || null,
    image: row.image_url || null,
    isVeg: Boolean(row.is_veg),
    isChefRecommendation: Boolean(row.is_chef_recommendation),
    isAvailable: row.is_available !== false,
    isDeleted: Boolean(row.is_deleted),
    isPurged: false,
    order: typeof row.order_num === 'number' ? row.order_num : 0,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function menuItemToRow(item: SyncedMenuItem, branchSlug: string): any {
  return {
    id: item.id,
    branch_slug: branchSlug,
    category_id: item.category_id || '',
    category: item.category || '',
    name: item.name,
    price: String(item.price),
    description: item.description || '',
    image_url: item.imageUrl || item.image || null,
    is_veg: Boolean(item.isVeg),
    is_chef_recommendation: Boolean(item.isChefRecommendation),
    is_available: item.isAvailable !== false,
    is_deleted: Boolean(item.isDeleted),
    order_num: typeof item.order === 'number' ? item.order : 0,
    updated_at: new Date().toISOString()
  };
}

function rowToCategory(row: any): SyncedCategory {
  return {
    id: row.id,
    branchSlug: row.branch_slug,
    branch_id: row.branch_slug === 'kollam' ? 'b1' : (row.branch_slug === 'alappuzha' ? 'b2' : 'b3'),
    name: row.name,
    imageUrl: row.image_url || null,
    image: row.image_url || null,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    order: typeof row.order_num === 'number' ? row.order_num : 0
  };
}

/**
 * Hook to manage real-time synchronized branch menu data using Supabase PostgreSQL.
 * - Instant rendering via local storage cache.
 * - Complete data integrity without 1MB document size limits.
 * - Real-time sync across all devices via Supabase PostgreSQL channels.
 */
export function useMenuSync(branchSlug: string | undefined) {
  const safeSlug = (branchSlug || 'kollam').toLowerCase().trim();
  const defaultData = getDefaultBranchData(safeSlug);
  const cached = getLocalCache(safeSlug);

  const [items, setItems] = useState<SyncedMenuItem[]>(() => cached?.items || defaultData.items);
  const [categories, setCategories] = useState<SyncedCategory[]>(() => cached?.categories || defaultData.categories);
  const [version, setVersion] = useState<number>(() => cached?.version || 1);
  const [loading, setLoading] = useState<boolean>(true);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const versionRef = useRef(version);
  versionRef.current = version;

  // Fetch complete branch menu from Supabase
  const fetchFromSupabase = useCallback(async () => {
    try {
      // Race against a 5-second timeout so customers on slow 4G/5G or with dropped packets never get stuck
      const [catRes, itemRes] = await Promise.race([
        Promise.all([
          supabase
            .from('categories')
            .select('*')
            .eq('branch_slug', safeSlug)
            .order('order_num', { ascending: true }),
          supabase
            .from('menu_items')
            .select('*')
            .eq('branch_slug', safeSlug)
            .order('order_num', { ascending: true })
        ]),
        new Promise<[any, any]>((resolve) =>
          setTimeout(() => resolve([
            { error: { message: 'Network timeout' }, data: null },
            { error: { message: 'Network timeout' }, data: null }
          ]), 5000)
        )
      ]);

      if (catRes.error) {
        console.warn('Error fetching categories from Supabase:', catRes.error.message);
      }
      if (itemRes.error) {
        console.warn('Error fetching menu items from Supabase:', itemRes.error.message);
      }

      // If Supabase failed or timed out (e.g. paused / 402 / poor reception):
      // 1. If customer has cached edits, keep their local cache.
      // 2. If it's a first-time customer with no cache, fall back to the bundled 145+ dishes so the menu NEVER fails!
      if (catRes.error || itemRes.error) {
        const cachedData = getLocalCache(safeSlug);
        if (cachedData && cachedData.items && cachedData.items.length > 0) {
          console.log('Supabase currently paused or unreachable; preserving local menu edits.');
          setItems(cachedData.items);
          setCategories(cachedData.categories);
        } else {
          console.log('Supabase unreachable or first-time visitor; rendering bundled default menu.');
          setItems(defaultData.items);
          setCategories(defaultData.categories);
        }
        setLoading(false);
        return;
      }

      // When Supabase succeeds:
      const cachedData = getLocalCache(safeSlug);
      const localCatMap = new Map((cachedData?.categories || categoriesRef.current || []).map(c => [c.id, c]));

      let fetchedCats = (catRes.data || []).map((row: any) => {
        const cat = rowToCategory(row);
        // If Supabase table does not yet have is_active column (or value is null/undefined),
        // preserve the user's local active state!
        if (row.is_active === undefined || row.is_active === null) {
          const local = localCatMap.get(cat.id);
          if (local && local.isActive !== undefined) {
            cat.isActive = local.isActive;
          }
        }
        return cat;
      });
      let fetchedItems = (itemRes.data || []).map(rowToMenuItem);

      // Re-apply and push any offline pending edits that were saved while Supabase was paused
      const pendingItems = getPendingSyncItems(safeSlug);
      if (pendingItems.length > 0) {
        const pendingMap = new Map(pendingItems.map(p => [p.id, p]));
        fetchedItems = fetchedItems.map(it => pendingMap.has(it.id) ? { ...it, ...pendingMap.get(it.id)! } : it);

        try {
          await Promise.all(pendingItems.map(p => supabase.from('menu_items').upsert(menuItemToRow(p, safeSlug))));
          clearPendingSyncItems(safeSlug);
          console.log(`Synced ${pendingItems.length} offline edits to Supabase!`);
        } catch (syncErr) {
          console.warn('Failed to sync pending items to Supabase:', syncErr);
        }
      }

      // Re-apply and push any offline pending category edits
      const pendingCats = getPendingSyncCategories(safeSlug);
      if (pendingCats.length > 0) {
        const pendingCatMap = new Map(pendingCats.map(c => [c.id, c]));
        fetchedCats = fetchedCats.map(c => pendingCatMap.has(c.id) ? { ...c, ...pendingCatMap.get(c.id)! } : c);

        try {
          await Promise.all(pendingCats.map(c => {
            const payload: any = {
              id: c.id,
              branch_slug: safeSlug,
              name: c.name,
              image_url: c.imageUrl || c.image || null,
              order_num: typeof c.order === 'number' ? c.order : 0
            };
            if (c.isActive !== undefined) {
              payload.is_active = c.isActive;
            }
            return supabase.from('categories').upsert(payload);
          }));
          clearPendingSyncCategories(safeSlug);
          console.log(`Synced ${pendingCats.length} offline category edits to Supabase!`);
        } catch (syncErr) {
          console.warn('Failed to sync pending categories to Supabase:', syncErr);
        }
      }

      if (fetchedCats.length === 0 && defaultData.categories.length > 0) {
        fetchedCats = defaultData.categories;
      }
      if (fetchedItems.length === 0 && defaultData.items.length > 0) {
        fetchedItems = defaultData.items;
      }

      fetchedCats.sort((a, b) => (typeof a.order === 'number' ? a.order : 9999) - (typeof b.order === 'number' ? b.order : 9999));
      fetchedItems.sort((a, b) => (typeof a.order === 'number' ? a.order : 9999) - (typeof b.order === 'number' ? b.order : 9999));

      const nextVer = versionRef.current + 1;
      setCategories(fetchedCats);
      setItems(fetchedItems);
      setVersion(nextVer);

      setLocalCache(safeSlug, {
        items: fetchedItems,
        categories: fetchedCats,
        version: nextVer
      });
    } catch (err) {
      console.warn('Supabase fetch failed, keeping local state:', err);
    } finally {
      setLoading(false);
    }
  }, [safeSlug, defaultData.categories, defaultData.items]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    let isMounted = true;
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    // Only hit Supabase if in Admin or if the cached menu is stale (>15 mins old).
    // This saves ~80-90% of Supabase database egress bandwidth.
    const isCacheFresh = Boolean(cached && cached.cachedAt && (Date.now() - cached.cachedAt < CACHE_TTL_MS));
    if (isAdmin || !isCacheFresh) {
      fetchFromSupabase();
    } else {
      setLoading(false);
    }

    // Subscribe to real-time changes ONLY for Admin devices.
    // Public guests do not need open WebSocket connections.
    let channel: any = null;
    if (isAdmin) {
      channel = supabase
        .channel(`menu_sync_${safeSlug}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items', filter: `branch_slug=eq.${safeSlug}` },
          () => {
            if (isMounted) fetchFromSupabase();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories', filter: `branch_slug=eq.${safeSlug}` },
          () => {
            if (isMounted) fetchFromSupabase();
          }
        )
        .subscribe();
    }

    // Cross-tab / cross-component sync listener for instant response
    const handleSyncEvent = (e: any) => {
      if (!isMounted) return;
      if (e.detail?.branchSlug === safeSlug) {
        if (e.detail.category) {
          const updatedCat = e.detail.category;
          setCategories(prev => {
            const idx = prev.findIndex(c => c.id === updatedCat.id || (c.name && updatedCat.name && c.name.trim().toLowerCase() === updatedCat.name.trim().toLowerCase()));
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...updatedCat };
              return copy;
            }
            return [...prev, updatedCat];
          });
        }
        if (e.detail.item) {
          const updatedItem = e.detail.item;
          setItems(prev => {
            const idx = prev.findIndex(i => i.id === updatedItem.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...updatedItem };
              return copy;
            }
            return [...prev, updatedItem];
          });
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('asado-sync-update', handleSyncEvent);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('asado-sync-update', handleSyncEvent);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [safeSlug, fetchFromSupabase]);

  // Save / Update an item
  const saveItem = useCallback(async (item: SyncedMenuItem) => {
    const itemWithSlug: SyncedMenuItem = {
      ...item,
      branchSlug: safeSlug,
      updatedAt: Date.now()
    };

    // Optimistic UI update
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
    setLocalCache(safeSlug, {
      items: updated,
      categories: categoriesRef.current,
      version: nextVer
    });

    // Notify other components & browser tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('asado-sync-update', { detail: { branchSlug: safeSlug, item: itemWithSlug } }));
    }

    // Write to Supabase PostgreSQL (or queue locally if Supabase is temporarily paused)
    try {
      const row = menuItemToRow(itemWithSlug, safeSlug);
      const { error } = await supabase.from('menu_items').upsert(row);
      if (error) {
        console.warn('Supabase saveItem warning (persisted locally in sync queue):', error.message);
        addPendingSyncItem(safeSlug, itemWithSlug);
      }
    } catch (err: any) {
      console.warn('Supabase unreachable or restricted (persisted locally in sync queue):', err?.message || err);
      addPendingSyncItem(safeSlug, itemWithSlug);
    }
  }, [safeSlug]);

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

  // Soft delete an item
  const deleteItem = useCallback(async (itemId: string) => {
    const current = itemsRef.current.find(i => i.id === itemId);
    if (!current) return;

    const updated = { ...current, isDeleted: true };
    await saveItem(updated);
  }, [saveItem]);

  // Restore a deleted item
  const restoreItem = useCallback(async (itemId: string) => {
    const current = itemsRef.current.find(i => i.id === itemId);
    if (!current) return;

    const updated = { ...current, isDeleted: false };
    await saveItem(updated);
  }, [saveItem]);

  // Permanently purge an item from database
  const purgeItem = useCallback(async (itemId: string) => {
    // Optimistic UI update
    const filtered = itemsRef.current.filter(i => i.id !== itemId);
    const nextVer = versionRef.current + 1;
    setItems(filtered);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: filtered,
      categories: categoriesRef.current,
      version: nextVer
    });

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (error) {
        console.warn('Supabase purgeItem warning (purged locally):', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase unreachable (purged locally):', err?.message || err);
    }
  }, [safeSlug]);

  // Reorder items: safely updates order_num without corrupting remaining items or failing NOT NULL constraints
  const reorderItems = useCallback(async (updates: { id: string; order: number }[]) => {
    if (!updates || updates.length === 0) return;

    const orderMap = new Map(updates.map(u => [u.id, u.order]));
    const updated = itemsRef.current.map(item => {
      if (orderMap.has(item.id)) {
        return { ...item, order: orderMap.get(item.id)! };
      }
      return item;
    });

    const nextVer = versionRef.current + 1;
    setItems(updated);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: updated,
      categories: categoriesRef.current,
      version: nextVer
    });

    try {
      await Promise.all(
        updates.map(u => 
          supabase
            .from('menu_items')
            .update({ order_num: u.order, updated_at: new Date().toISOString() })
            .eq('id', u.id)
        )
      );
    } catch (err: any) {
      console.warn('Supabase reorder sync warning (reordered locally):', err?.message || err);
    }
  }, [safeSlug]);

  // Reorder categories: updates order_num and keeps categories properly sorted
  const reorderCategories = useCallback(async (updates: { id: string; order: number }[]) => {
    if (!updates || updates.length === 0) return;

    const orderMap = new Map(updates.map(u => [u.id, u.order]));
    const updated = categoriesRef.current.map(c => {
      if (orderMap.has(c.id)) {
        return { ...c, order: orderMap.get(c.id)! };
      }
      return c;
    });

    updated.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 9999;
      const orderB = typeof b.order === 'number' ? b.order : 9999;
      return orderA - orderB;
    });

    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: itemsRef.current,
      categories: updated,
      version: nextVer
    });

    try {
      await Promise.all(
        updates.map(u => 
          supabase
            .from('categories')
            .update({ order_num: u.order })
            .eq('id', u.id)
        )
      );
    } catch (err: any) {
      console.warn('Supabase category reorder warning (reordered locally):', err?.message || err);
    }
  }, [safeSlug]);

  // Save / Update Category
  const saveCategory = useCallback(async (category: SyncedCategory) => {
    const currentCats = categoriesRef.current;
    const idx = currentCats.findIndex(c => c.id === category.id || (c.name && category.name && c.name.trim().toLowerCase() === category.name.trim().toLowerCase()));
    let updated: SyncedCategory[];
    const categoryWithSlug: SyncedCategory = { ...category, branchSlug: safeSlug };
    if (idx >= 0) {
      updated = [...currentCats];
      updated[idx] = { ...updated[idx], ...categoryWithSlug };
    } else {
      updated = [...currentCats, categoryWithSlug];
    }

    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: itemsRef.current,
      categories: updated,
      version: nextVer
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('asado-sync-update', { detail: { branchSlug: safeSlug, category: categoryWithSlug } }));
    }

    // Proactively queue in local pending sync queue for resilience
    addPendingSyncCategory(safeSlug, categoryWithSlug);

    try {
      const payload: any = {
        id: category.id,
        branch_slug: safeSlug,
        name: category.name,
        image_url: category.imageUrl || category.image || null,
        order_num: typeof category.order === 'number' ? category.order : (idx >= 0 ? idx : updated.length)
      };
      if (category.isActive !== undefined) {
        payload.is_active = category.isActive;
      }
      const { error } = await supabase.from('categories').upsert(payload);
      if (error) {
        if (error.message && error.message.includes('is_active')) {
          delete payload.is_active;
          await supabase.from('categories').upsert(payload);
        } else {
          console.warn('Supabase saveCategory warning (kept in local sync queue):', error.message);
        }
      } else {
        // Successfully upserted, remove from pending sync
        try {
          const remaining = getPendingSyncCategories(safeSlug).filter(p => p.id !== category.id);
          localStorage.setItem(`asado_pending_sync_cats_${safeSlug}`, JSON.stringify(remaining));
        } catch {}
      }
    } catch (err: any) {
      console.warn('Failed to save category to Supabase (kept in local sync queue):', err?.message || err);
    }
  }, [safeSlug]);

  // Toggle Category Availability (ON / OFF)
  const toggleCategoryAvailability = useCallback(async (category: SyncedCategory) => {
    const nextActive = !(category.isActive !== false);
    const updated = { ...category, isActive: nextActive };
    await saveCategory(updated);
  }, [saveCategory]);

  // Delete Category
  const deleteCategory = useCallback(async (catId: string) => {
    const updated = categoriesRef.current.filter(c => c.id !== catId);
    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: itemsRef.current,
      categories: updated,
      version: nextVer
    });

    try {
      const { error } = await supabase.from('categories').delete().eq('id', catId);
      if (error) {
        console.warn('Supabase deleteCategory warning (deleted locally):', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase deleteCategory offline (deleted locally):', err?.message || err);
    }
  }, [safeSlug]);

  // Refresh
  const refreshMenu = fetchFromSupabase;

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
    reorderCategories,
    saveCategory,
    toggleCategoryAvailability,
    deleteCategory,
    refreshMenu
  };
}
