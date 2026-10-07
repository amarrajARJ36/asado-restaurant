import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tagText: string;
  bgColor?: string;
  textColor?: string;
  tagBg?: string;
  tagColor?: string;
  branchSlug?: string; // 'all' | 'kollam' | 'alappuzha' | 'varkala'
  isActive?: boolean;
  createdAt?: number;
}

const starterBanners: Banner[] = [
  {
    id: 'starter-1',
    title: 'Buy 2 Mojitos Get 1 Free',
    subtitle: 'Available all weekend long. Perfect for a sunset by the lake.',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-950',
    tagText: "Today's Special",
    tagBg: 'bg-amber-200',
    tagColor: 'text-amber-900',
    branchSlug: 'all',
    isActive: true,
    createdAt: Date.now() - 2000,
  },
  {
    id: 'starter-2',
    title: 'Live Music Night',
    subtitle: 'Join us this Friday for an acoustic night under the stars.',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-950',
    tagText: 'Upcoming Event',
    tagBg: 'bg-blue-200',
    tagColor: 'text-blue-900',
    branchSlug: 'all',
    isActive: true,
    createdAt: Date.now() - 1000,
  }
];

const BANNER_STORAGE_KEY = 'asado_cached_banners_v1';

function getStoredBanners(): Banner[] {
  if (typeof window === 'undefined') return starterBanners;
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return starterBanners;
}

function saveStoredBanners(banners: Banner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
  } catch (err) {
    console.warn('Failed to save banners to localStorage:', err);
  }
}

let hasAttemptedSeed = false;

export function useBanners(branchSlug?: string, options?: { includeInactive?: boolean }) {
  const [allBanners, setAllBanners] = useState<Banner[]>(getStoredBanners);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if initial seeding is required once
    async function checkSeed() {
      if (hasAttemptedSeed) return;
      hasAttemptedSeed = true;
      try {
        const seededMarker = localStorage.getItem('asado_banners_seeded_v1');
        if (!seededMarker) {
          const snap = await getDocs(collection(db, 'banners'));
          if (snap.empty) {
            localStorage.setItem('asado_banners_seeded_v1', 'true');
            for (const b of starterBanners) {
              await setDoc(doc(db, 'banners', b.id), b);
            }
          }
        }
      } catch (err) {
        console.warn('Banner check seed warning:', err);
      }
    }
    checkSeed();

    const unsubscribe = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const fbBanners = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
      // Sort newest first
      fbBanners.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const finalBanners = fbBanners.length > 0 ? fbBanners : getStoredBanners();
      saveStoredBanners(finalBanners);
      setAllBanners(finalBanners);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
      setAllBanners(getStoredBanners());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter for display
  let filtered: Banner[] = [];

  if (branchSlug) {
    // Look for banners specifically configured for this branch
    const branchSpecific = allBanners.filter(b => b.branchSlug === branchSlug || b.id === `banner-${branchSlug}`);
    if (branchSpecific.length > 0) {
      // If branch has its own banner configured, that is authoritative for this branch!
      filtered = options?.includeInactive 
        ? branchSpecific 
        : branchSpecific.filter(b => b.isActive !== false);
    } else {
      // Fallback to global banners only if no branch-specific banner exists
      const globalBanners = allBanners.filter(b => !b.branchSlug || b.branchSlug === 'all');
      filtered = options?.includeInactive 
        ? globalBanners 
        : globalBanners.filter(b => b.isActive !== false);
    }
  } else {
    // No branchSlug specified (admin dashboard overview)
    if (!options?.includeInactive) {
      filtered = allBanners.filter(b => b.isActive !== false);
    } else {
      filtered = allBanners;
    }
  }

  const addBanner = async (banner: Partial<Banner>) => {
    const id = banner.id || (banner.branchSlug && banner.branchSlug !== 'all' ? `banner-${banner.branchSlug}` : 'banner-' + Date.now().toString());
    const newBanner: Banner = {
      id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tagText: banner.tagText || "Today's Special",
      bgColor: banner.bgColor || 'bg-amber-50',
      textColor: banner.textColor || 'text-amber-950',
      tagBg: banner.tagBg || 'bg-amber-200',
      tagColor: banner.tagColor || 'text-amber-900',
      branchSlug: banner.branchSlug || 'all',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      createdAt: banner.createdAt || Date.now(),
    };
    setAllBanners(prev => {
      const next = [newBanner, ...prev.filter(b => b.id !== id)];
      saveStoredBanners(next);
      return next;
    });
    try {
      await setDoc(doc(db, 'banners', id), newBanner, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `banners/${id}`);
    }
    return id;
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    setAllBanners(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      saveStoredBanners(next);
      return next;
    });
    try {
      await setDoc(doc(db, 'banners', id), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `banners/${id}`);
    }
  };

  const toggleBanner = async (id: string, newActiveState: boolean) => {
    setAllBanners(prev => {
      const next = prev.map(b => b.id === id ? { ...b, isActive: newActiveState } : b);
      saveStoredBanners(next);
      return next;
    });
    try {
      await setDoc(doc(db, 'banners', id), { isActive: newActiveState }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `banners/${id}`);
    }
  };

  const removeBanner = async (id: string) => {
    setAllBanners(prev => {
      const next = prev.filter(b => b.id !== id);
      saveStoredBanners(next);
      return next;
    });
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
    }
  };

  return {
    banners: filtered,
    allBanners,
    loading,
    addBanner,
    updateBanner,
    toggleBanner,
    removeBanner
  };
}
