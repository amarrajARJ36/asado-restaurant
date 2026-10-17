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
    console.warn('Error reading menu cache:', err);
  }
  return null;
}

function setLocalCache(branchSlug: string, data: { items: SyncedMenuItem[]; categories: SyncedCategory[]; version: number }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${branchSlug}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Error setting menu cache:', err);
  }
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
      const [catRes, itemRes] = await Promise.all([
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
      ]);

      if (catRes.error) {
        console.warn('Error fetching categories from Supabase:', catRes.error.message);
      }
      if (itemRes.error) {
        console.warn('Error fetching menu items from Supabase:', itemRes.error.message);
      }

      const fetchedCats = (catRes.data && catRes.data.length > 0)
        ? catRes.data.map(rowToCategory)
        : defaultData.categories;
      fetchedCats.sort((a, b) => (typeof a.order === 'number' ? a.order : 9999) - (typeof b.order === 'number' ? b.order : 9999));

      const fetchedItems = (itemRes.data && itemRes.data.length > 0)
        ? itemRes.data.map(rowToMenuItem)
        : defaultData.items;
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
    fetchFromSupabase();

    // Subscribe to real-time changes
    const channel = supabase
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

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
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

    // Write to Supabase PostgreSQL
    try {
      const row = menuItemToRow(itemWithSlug, safeSlug);
      const { error } = await supabase.from('menu_items').upsert(row);
      if (error) {
        console.error('Supabase saveItem error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to save item to Supabase:', err);
      throw err;
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
        console.error('Supabase purgeItem error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to purge item from Supabase:', err);
      throw err;
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
    } catch (err) {
      console.error('Supabase reorder sync error:', err);
      throw err;
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
    } catch (err) {
      console.error('Supabase category reorder error:', err);
      throw err;
    }
  }, [safeSlug]);

  // Save / Update Category
  const saveCategory = useCallback(async (category: SyncedCategory) => {
    const currentCats = categoriesRef.current;
    const idx = currentCats.findIndex(c => c.id === category.id);
    let updated: SyncedCategory[];
    if (idx >= 0) {
      updated = [...currentCats];
      updated[idx] = { ...updated[idx], ...category, branchSlug: safeSlug };
    } else {
      updated = [...currentCats, { ...category, branchSlug: safeSlug }];
    }

    const nextVer = versionRef.current + 1;
    setCategories(updated);
    setVersion(nextVer);
    setLocalCache(safeSlug, {
      items: itemsRef.current,
      categories: updated,
      version: nextVer
    });

    try {
      const { error } = await supabase.from('categories').upsert({
        id: category.id,
        branch_slug: safeSlug,
        name: category.name,
        image_url: category.imageUrl || category.image || null,
        order_num: category.order || (idx >= 0 ? idx : updated.length)
      });
      if (error) {
        console.error('Supabase saveCategory error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to save category to Supabase:', err);
      throw err;
    }
  }, [safeSlug]);

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
        console.error('Supabase deleteCategory error:', error.message);
        throw error;
      }
    } catch (err) {
      console.error('Failed to delete category from Supabase:', err);
      throw err;
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
    deleteCategory,
    refreshMenu
  };
}
