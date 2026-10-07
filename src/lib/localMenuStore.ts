import { normalizeMenuItems } from './categoryUtils';

/**
 * Persistent local storage fallback for branch menu deletions, purges, edits, and custom items.
 * Ensures all admin changes (price, availability, name, description, new dishes, deletions)
 * stay 100% persistent on refresh even if Firestore hits daily read quotas or network delay.
 */

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
      // ignore JSON parse errors
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
    // Also update any saved local edit
    saveLocalMenuItemEdit(branchSlug, { id, isDeleted: true });
  } else {
    currentSet.delete(id);
    saveLocalMenuItemEdit(branchSlug, { id, isDeleted: false, isPurged: false });
  }

  const serialized = JSON.stringify([...currentSet]);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_deleted_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to update local deleted ids for key', k, err);
    }
  }
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
      // ignore JSON parse errors
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

  // Also remove from custom items if present
  removeLocalCustomItem(branchSlug, id);
}

/* -------------------------------------------------------------
 * 3. MENU ITEM EDITS / OVERRIDES (PRICE, NAME, STOCK, ETC.)
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

export function saveLocalMenuItemEdit(branchSlug: string, itemData: any): void {
  if (typeof window === 'undefined' || !branchSlug || !itemData || !itemData.id) return;
  const keys = getBranchKeys(branchSlug);
  const currentEdits = getLocalEditedItems(branchSlug);
  
  const existing = currentEdits[itemData.id] || {};
  currentEdits[itemData.id] = {
    ...existing,
    ...itemData,
    updatedAt: Date.now()
  };

  const serialized = JSON.stringify(currentEdits);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_edited_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save local menu edit for key', k, err);
    }
  }
}

export function removeLocalMenuItemEdit(branchSlug: string, id: string): void {
  if (typeof window === 'undefined' || !branchSlug || !id) return;
  const keys = getBranchKeys(branchSlug);
  const currentEdits = getLocalEditedItems(branchSlug);
  delete currentEdits[id];

  const serialized = JSON.stringify(currentEdits);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_edited_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to remove local menu edit for key', k, err);
    }
  }
}

/* -------------------------------------------------------------
 * 4. CUSTOM CREATED MENU ITEMS
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
    items[index] = { ...items[index], ...itemData };
  } else {
    items.push(itemData);
  }

  const serialized = JSON.stringify(items);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_custom_items_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save custom item for key', k, err);
    }
  }
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
  edits[catData.id] = { ...(edits[catData.id] || {}), ...catData };

  const serialized = JSON.stringify(edits);
  for (const k of keys) {
    try {
      localStorage.setItem(`asado_category_edits_${k}`, serialized);
    } catch (err) {
      console.error('Failed to save category edit for key', k, err);
    }
  }
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
}

/* -------------------------------------------------------------
 * 6. MASTER RESOLUTION FUNCTIONS (BULLETPROOF HYDRATION)
 * ------------------------------------------------------------- */

/**
 * Resolves menu items by blending static base items, Firestore real-time items,
 * local storage edits, local custom items, and deleted/purged tracking.
 * This guarantees that refreshing the browser NEVER loses edits or deleted dishes.
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

  const mergedStatic = staticCategories.map((sc: any) => {
    const dbCat = dbCatMap.get(sc.id) || {};
    const localEdit = localCatEdits[sc.id] || {};
    const isDeleted = localDeletedCats.has(sc.id) || dbCat.isDeleted === true || localEdit.isDeleted === true;
    return {
      ...sc,
      ...dbCat,
      ...localEdit,
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
    const isDeleted = localDeletedCats.has(c.id) || c.isDeleted === true || localEdit.isDeleted === true;
    return {
      ...c,
      ...localEdit,
      isDeleted
    };
  });

  return [...mergedStatic, ...mergedCustom].filter(c => !c.isDeleted);
}


