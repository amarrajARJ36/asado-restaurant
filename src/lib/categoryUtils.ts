/**
 * Utility functions to consistently resolve categories and normalize menu items
 * across the admin dashboard and customer branch menus.
 */

export function resolveItemCategory(item: any, categories: any[]): string {
  if (!item) return 'Uncategorized';
  
  const catById = new Map(categories.map(c => [c.id, c.name]));
  const knownNames = new Set(categories.map(c => c.name));

  // 1. Direct match with a known category name
  if (item.category && knownNames.has(item.category)) {
    return item.category;
  }

  // 2. item.category contains category ID (e.g. "c11")
  if (item.category && catById.has(item.category)) {
    return catById.get(item.category)!;
  }

  // 3. item.category_id matches category ID (e.g. static data items have "category_id: c11")
  if (item.category_id && catById.has(item.category_id)) {
    return catById.get(item.category_id)!;
  }

  // 4. item.category_id matches a known name
  if (item.category_id && knownNames.has(item.category_id)) {
    return item.category_id;
  }

  // 5. Custom non-empty category name provided
  if (typeof item.category === 'string' && item.category.trim()) {
    return item.category.trim();
  }

  return 'Uncategorized';
}

export function normalizeMenuItems(items: any[], categories: any[]): any[] {
  return items.map((item, index) => {
    const resolvedCategory = resolveItemCategory(item, categories);
    return {
      ...item,
      category: resolvedCategory,
      order: typeof item.order === 'number' ? item.order : index
    };
  });
}
