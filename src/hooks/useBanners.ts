import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface Banner {
  branchSlug?: string;
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  tagText: string;
  tagBg: string;
  tagColor: string;
}

const defaultBanners: Banner[] = [
  {
    id: '1',
    title: 'Buy 2 Mojitos Get 1 Free',
    subtitle: 'Available all weekend long. Perfect for a sunset by the lake.',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-950',
    tagText: "Today's Special",
    tagBg: 'bg-amber-200',
    tagColor: 'text-amber-900',
    branchSlug: 'all',
  },
  {
    id: '2',
    title: 'Live Music Night',
    subtitle: 'Join us this Friday for an acoustic night under the stars.',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-950',
    tagText: 'Upcoming Event',
    tagBg: 'bg-blue-200',
    tagColor: 'text-blue-900',
    branchSlug: 'all',
  }
];

export function useBanners(branchSlug?: string) {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const fbBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      
      let toDisplay = fbBanners;
      
      if (fbBanners.length === 0) {
        toDisplay = defaultBanners;
      }
      
      if (branchSlug) {
        toDisplay = toDisplay.filter(b => !b.branchSlug || b.branchSlug === 'all' || b.branchSlug === branchSlug);
      }
      
      setBanners(toDisplay);

    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
    });

    return () => unsubscribe();
  }, [branchSlug]);

  const addBanner = async (banner: Banner) => {
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `banners/${banner.id}`);
    }
  };

  const removeBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
    }
  };

  return { banners, addBanner, removeBanner };
}
