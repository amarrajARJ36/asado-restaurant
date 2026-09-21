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

let hasAttemptedSeed = false;

export function useBanners(branchSlug?: string, options?: { includeInactive?: boolean }) {
  const [allBanners, setAllBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if initial seeding is required once
    async function checkSeed() {
      if (hasAttemptedSeed) return;
      hasAttemptedSeed = true;
      try {
        const snap = await getDocs(collection(db, 'banners'));
        if (snap.empty) {
          // Check if user has explicitly seeded or deleted
          const seededMarker = localStorage.getItem('asado_banners_seeded_v1');
          if (!seededMarker) {
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
      setAllBanners(fbBanners);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter for display
  let filtered = allBanners;

  // Unless explicitly requested, consumer views only see active banners
  if (!options?.includeInactive) {
    filtered = filtered.filter(b => b.isActive !== false);
  }

  // Filter by branch
  if (branchSlug) {
    filtered = filtered.filter(b => !b.branchSlug || b.branchSlug === 'all' || b.branchSlug === branchSlug);
  }

  const addBanner = async (banner: Partial<Banner>) => {
    const id = banner.id || 'banner-' + Date.now().toString();
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
    try {
      await setDoc(doc(db, 'banners', id), newBanner);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `banners/${id}`);
      throw error;
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      await updateDoc(doc(db, 'banners', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `banners/${id}`);
      throw error;
    }
  };

  const toggleBanner = async (id: string, newActiveState: boolean) => {
    try {
      await updateDoc(doc(db, 'banners', id), { isActive: newActiveState });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `banners/${id}`);
      throw error;
    }
  };

  const removeBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
      throw error;
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
