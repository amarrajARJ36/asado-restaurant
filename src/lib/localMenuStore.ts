/**
 * Persistent local storage fallback for branch menu deletions, purges, and custom items.
 * Ensures deletions and edits stay persistent on refresh even if Firestore hits daily read quotas or network delay.
 */

function getBranchKeys(slug: string): string[] {
  if (!slug) return [];
  const s = slug.toLowerCase();
  if (s === 'alappuzha' || s === 'b2') return ['alappuzha', 'b2'];
  if (s === 'kollam' || s === 'b1') return ['kollam', 'b1'];
  if (s === 'varkala' || s === 'b3') return ['varkala', 'b3'];
  return [s];
}

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
  } else {
    currentSet.delete(id);
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
}

