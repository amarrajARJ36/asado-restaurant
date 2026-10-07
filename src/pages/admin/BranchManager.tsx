import React, { useMemo } from "react";
import { useParams, Link } from 'react-router-dom';
import { branches, kollamMenu, alappuzhaMenu, kollamCategories, alappuzhaCategories } from '../../data';
import { useState, useEffect, useRef } from 'react';
import { Utensils, Tag, Store, Plus, Trash2, Flame, Edit3, X, ArrowUp, ArrowDown, Eye, EyeOff, Check, Filter, Sparkles, ExternalLink, Search, ChevronDown, ChevronUp, ChevronRight, Layers, List, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import DietarySymbol from '../../components/DietarySymbol';
import { useBanners, Banner } from '../../hooks/useBanners';
import { resolveItemCategory, normalizeMenuItems } from '../../lib/categoryUtils';
import { 
  getLocalDeletedIds, 
  setLocalDeletedId, 
  getLocalPurgedIds, 
  setLocalPurgedId,
  saveLocalMenuItemEdit,
  saveLocalCustomItem,
  removeLocalCustomItem,
  saveLocalCategoryEdit,
  saveLocalCustomCategory,
  setLocalDeletedCategoryId,
  getResolvedMenuItems,
  getResolvedCategories,
  initBranchSync
} from '../../lib/localMenuStore';
import { syncService } from '../../lib/syncService';

export default function BranchManager() {
  const { branchId } = useParams();
  const branch = branches.find(b => b.slug === branchId);
  const [activeTab, setActiveTab] = useState('menu');
  
  // Offers Banner Hook & State
  const { allBanners, loading: bannersLoading, addBanner, updateBanner, toggleBanner } = useBanners(undefined, { includeInactive: true });
  const targetBanner = allBanners.find(b => b.branchSlug === branchId || b.id === `banner-${branchId}`);

  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTagText, setBannerTagText] = useState("Today's Special");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerTheme, setBannerTheme] = useState('amber');
  const [bannerSavedNotice, setBannerSavedNotice] = useState(false);
  const [bannerInitDone, setBannerInitDone] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Menu Category Filter, Search, View Mode & Reordering State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuViewMode, setMenuViewMode] = useState<'grouped' | 'table'>('grouped');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [reorderSaving, setReorderSaving] = useState(false);

  const rawBaseItems = useMemo(() => {
    return branchId === 'kollam' ? kollamMenu : branchId === 'alappuzha' ? alappuzhaMenu : [];
  }, [branchId]);

  const rawBaseCategories = useMemo(() => {
    return branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : [];
  }, [branchId]);

  const [categories, setCategories] = useState<any[]>(() => {
    return getResolvedCategories(branchId || '', branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : []);
  });

  const [menuItems, setMenuItems] = useState<any[]>(() => {
    const cats = getResolvedCategories(branchId || '', branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : []);
    const items = branchId === 'kollam' ? kollamMenu : branchId === 'alappuzha' ? alappuzhaMenu : [];
    return getResolvedMenuItems(branchId || '', items, cats).active;
  });

  const [deletedItems, setDeletedItems] = useState<any[]>(() => {
    const cats = getResolvedCategories(branchId || '', branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : []);
    const items = branchId === 'kollam' ? kollamMenu : branchId === 'alappuzha' ? alappuzhaMenu : [];
    return getResolvedMenuItems(branchId || '', items, cats).deleted;
  });

  const [showTrashModal, setShowTrashModal] = useState(false);

  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');
  const [newMenuIsVeg, setNewMenuIsVeg] = useState(false);
  const [newMenuIsChefRec, setNewMenuIsChefRec] = useState(false);
  
  // Edit Menu Item Modal State
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    price: string;
    category: string;
    description: string;
    isVeg: boolean;
    isChefRecommendation: boolean;
    isAvailable: boolean;
  } | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCatId, setUploadingCatId] = useState<string | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleCategoryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingCatId || !branchId) return;

    try {
      const compressed = await compressImage(file);
      const updateData = {
        id: uploadingCatId,
        imageUrl: compressed,
        image: compressed,
        branchSlug: branchId,
        updatedAt: Date.now()
      };
      saveLocalCategoryEdit(branchId, updateData);
      setCategories(prev => prev.map(c => c.id === uploadingCatId ? { ...c, ...updateData } : c));
      try {
        await setDoc(doc(db, 'categories', uploadingCatId), updateData, { merge: true });
      } catch (err) {
        console.warn('Firestore category photo sync warning:', err);
      }
    } catch (err) {
      console.error('Error compressing category photo:', err);
    } finally {
      setUploadingCatId(null);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    }
  };

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!branchId) return;

    const refreshBranchData = () => {
      const currentCats = getResolvedCategories(branchId, rawBaseCategories);
      setCategories(currentCats);
      const resolved = getResolvedMenuItems(branchId, rawBaseItems, currentCats);
      setMenuItems(resolved.active);
      setDeletedItems(resolved.deleted);
    };

    // Multi-device central sync
    initBranchSync(branchId, refreshBranchData);
    const unsubSync = syncService.subscribe((payload) => {
      if (payload.branchSlug === branchId || payload.branchSlug === 'all') {
        initBranchSync(branchId, refreshBranchData);
      }
    });

    const handleCustomSync = (e: any) => {
      if (e.detail?.branchSlug === branchId || e.detail?.branchSlug === 'all') {
        refreshBranchData();
      }
    };
    window.addEventListener('asado-sync-update', handleCustomSync);

    const qMenu = query(collection(db, 'menuItems'), where('branchSlug', '==', branchId));
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentCats = categories.length > 0 ? categories : rawBaseCategories;
      const resolved = getResolvedMenuItems(branchId, rawBaseItems, currentCats, dbItems);
      setMenuItems(resolved.active);
      setDeletedItems(resolved.deleted);
    }, (error) => {
      console.warn('Firestore menuItems snapshot warning:', error);
    });

    const qCat = query(collection(db, 'categories'), where('branchSlug', '==', branchId));
    const unsubCat = onSnapshot(qCat, (snapshot) => {
      const dbCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const resolvedCats = getResolvedCategories(branchId, rawBaseCategories, dbCats);
      setCategories(resolvedCats);
    }, (error) => {
      console.warn('Firestore categories snapshot warning:', error);
    });
  
    return () => { 
      unsubMenu(); 
      unsubCat(); 
      unsubSync();
      window.removeEventListener('asado-sync-update', handleCustomSync);
    };
  }, [branchId, rawBaseItems, rawBaseCategories]);

  // Sync banner state for this branch
  useEffect(() => {
    if (bannersLoading) return; // Wait until Firestore snapshot finishes loading

    if (targetBanner) {
      setBannerTitle(targetBanner.title || '');
      setBannerSubtitle(targetBanner.subtitle || '');
      setBannerTagText(targetBanner.tagText || "Today's Special");
      setBannerIsActive(targetBanner.isActive !== false);
      const th = targetBanner.bgColor?.includes('blue') ? 'blue' : targetBanner.bgColor?.includes('emerald') ? 'green' : targetBanner.bgColor?.includes('neutral-900') ? 'dark' : 'amber';
      setBannerTheme(th);
      setBannerInitDone(true);
    } else if (!targetBanner && !bannerInitDone && branch) {
      setBannerTitle(branch.slug === 'kollam' ? "See Live FIFA 2026 Matches (Everyday)" : "Live Music Every Saturday");
      setBannerSubtitle(branch.slug === 'kollam' ? "Watch live match screenings daily by the lakeside terrace." : "Acoustic performances and signature barbecue specials.");
      setBannerTagText("Special Event");
      setBannerIsActive(true);
      setBannerTheme('amber');
      setBannerInitDone(true);
    }
  }, [targetBanner, branch, bannersLoading, bannerInitDone]);

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      alert("Please provide a banner title.");
      return;
    }
    setIsSavingBanner(true);
    const themeConfig = bannerTheme === 'blue'
      ? { bgColor: 'bg-blue-50', textColor: 'text-blue-950', tagBg: 'bg-blue-200', tagColor: 'text-blue-900' }
      : bannerTheme === 'green'
      ? { bgColor: 'bg-emerald-50', textColor: 'text-emerald-950', tagBg: 'bg-emerald-200', tagColor: 'text-emerald-900' }
      : bannerTheme === 'dark'
      ? { bgColor: 'bg-neutral-900', textColor: 'text-white', tagBg: 'bg-amber-500', tagColor: 'text-neutral-950' }
      : { bgColor: 'bg-amber-50', textColor: 'text-amber-950', tagBg: 'bg-amber-200', tagColor: 'text-amber-900' };

    const id = targetBanner?.id || `banner-${branchId}`;
    const bannerPayload = {
      id,
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      tagText: bannerTagText.trim(),
      branchSlug: branchId,
      isActive: bannerIsActive,
      updatedAt: Date.now(),
      ...themeConfig
    };

    try {
      if (targetBanner) {
        await updateBanner(id, bannerPayload);
      } else {
        await addBanner(bannerPayload);
      }
      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    } catch (err: any) {
      console.warn("Deferred banner save:", err);
      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleToggleBannerActive = async (bannerIdToToggle?: string, currentState?: boolean) => {
    const id = bannerIdToToggle || targetBanner?.id || `banner-${branchId}`;
    const nextState = currentState !== undefined ? !currentState : !bannerIsActive;
    setBannerIsActive(nextState);

    const themeConfig = bannerTheme === 'blue'
      ? { bgColor: 'bg-blue-50', textColor: 'text-blue-950', tagBg: 'bg-blue-200', tagColor: 'text-blue-900' }
      : bannerTheme === 'green'
      ? { bgColor: 'bg-emerald-50', textColor: 'text-emerald-950', tagBg: 'bg-emerald-200', tagColor: 'text-emerald-900' }
      : bannerTheme === 'dark'
      ? { bgColor: 'bg-neutral-900', textColor: 'text-white', tagBg: 'bg-amber-500', tagColor: 'text-neutral-950' }
      : { bgColor: 'bg-amber-50', textColor: 'text-amber-950', tagBg: 'bg-amber-200', tagColor: 'text-amber-900' };

    const bannerPayload = {
      id,
      title: bannerTitle.trim() || (branch?.slug === 'kollam' ? "See Live FIFA 2026 Matches (Everyday)" : "Live Music Every Saturday"),
      subtitle: bannerSubtitle.trim() || "Promotional specials and lakeside dining.",
      tagText: bannerTagText.trim() || "Special Event",
      branchSlug: branchId,
      isActive: nextState,
      updatedAt: Date.now(),
      ...themeConfig
    };

    try {
      if (targetBanner || bannerIdToToggle) {
        await updateBanner(id, bannerPayload);
      } else {
        await addBanner(bannerPayload);
      }
      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    } catch (err: any) {
      console.warn("Deferred banner toggle:", err);
      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    }
  };

  // Normalized list of all menu items ensuring every item has resolved human category name
  const normalizedMenuItems = useMemo(() => {
    return normalizeMenuItems(menuItems, categories);
  }, [menuItems, categories]);

  // Arrange all dishes in a clean category-wise list with real-time search & filter
  const categoryWiseMenu = useMemo(() => {
    let catList: string[] = [];
    if (selectedCategoryFilter !== 'All') {
      catList = [selectedCategoryFilter];
    } else {
      const knownNames = new Set(categories.map(c => c.name));
      catList = categories.map(c => c.name);
      normalizedMenuItems.forEach(item => {
        if (item.category && !knownNames.has(item.category) && !catList.includes(item.category)) {
          catList.push(item.category);
        }
      });
    }

    const queryText = menuSearchQuery.trim().toLowerCase();

    return catList.map(catName => {
      let items = normalizedMenuItems.filter(m => m.category === catName);

      // Filter by availability toggle
      if (availabilityFilter === 'available') {
        items = items.filter(m => m.isAvailable !== false);
      } else if (availabilityFilter === 'unavailable') {
        items = items.filter(m => m.isAvailable === false);
      }

      if (queryText) {
        items = items.filter(m => 
          (m.name && m.name.toLowerCase().includes(queryText)) ||
          (m.description && m.description.toLowerCase().includes(queryText)) ||
          (m.price && String(m.price).toLowerCase().includes(queryText)) ||
          (m.category && m.category.toLowerCase().includes(queryText))
        );
      }

      items.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });

      const catObj = categories.find(c => c.name === catName);
      return {
        categoryName: catName,
        categoryObj: catObj,
        items
      };
    }).filter(group => {
      // When a single category is selected, keep it visible even if 0 items to allow adding items
      if (selectedCategoryFilter !== 'All') return true;
      // In "All Categories" view, only show categories that contain matching items
      return group.items.length > 0;
    });
  }, [categories, normalizedMenuItems, selectedCategoryFilter, menuSearchQuery, availabilityFilter]);

  const availableCount = useMemo(() => {
    return normalizedMenuItems.filter(m => m.isAvailable !== false).length;
  }, [normalizedMenuItems]);

  const unavailableCount = useMemo(() => {
    return normalizedMenuItems.filter(m => m.isAvailable === false).length;
  }, [normalizedMenuItems]);

  const totalFilteredCount = useMemo(() => {
    return categoryWiseMenu.reduce((acc, g) => acc + g.items.length, 0);
  }, [categoryWiseMenu]);

  // All matching dishes across all categories for continuous table view
  const allFilteredDishes = useMemo(() => {
    return categoryWiseMenu.flatMap(g => g.items);
  }, [categoryWiseMenu]);

  // Category collapse / expand helpers
  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const handleExpandAll = () => {
    setCollapsedCategories({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    categoryWiseMenu.forEach(g => {
      allCollapsed[g.categoryName] = true;
    });
    setCollapsedCategories(allCollapsed);
  };

  // Reordering function within each category
  const handleMoveItem = async (itemToMove: any, direction: 'up' | 'down') => {
    if (reorderSaving) return;
    const catName = itemToMove.category;
    // Get all items in this category in current order
    const catItems = normalizedMenuItems
      .filter(m => m.category === catName)
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });

    const curIndex = catItems.findIndex(m => m.id === itemToMove.id);
    if (curIndex === -1) return;
    const targetIndex = direction === 'up' ? curIndex - 1 : curIndex + 1;
    if (targetIndex < 0 || targetIndex >= catItems.length) return;

    setReorderSaving(true);
    const swapped = [...catItems];
    const temp = swapped[curIndex];
    swapped[curIndex] = swapped[targetIndex];
    swapped[targetIndex] = temp;

    const updatedMap = new Map<string, number>();
    swapped.forEach((item, index) => {
      updatedMap.set(item.id, index);
    });

    // Immediate optimistic update
    setMenuItems(prev => prev.map(m => {
      if (updatedMap.has(m.id)) {
        return { ...m, order: updatedMap.get(m.id), category: catName };
      }
      return m;
    }));

    swapped.forEach((item, index) => {
      saveLocalMenuItemEdit(branchId || '', { id: item.id, order: index, category: catName });
    });

    try {
      const batch = writeBatch(db);
      swapped.forEach((item, index) => {
        const ref = doc(db, 'menuItems', item.id);
        batch.set(ref, {
          order: index,
          name: item.name,
          price: item.price,
          category: catName,
          branchSlug: branchId,
          isVeg: Boolean(item.isVeg),
          isChefRecommendation: Boolean(item.isChefRecommendation),
          description: item.description || ''
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("Deferred batch commit for item reorder", err);
    } finally {
      setReorderSaving(false);
    }
  };

  if (!branch) return <div>Branch not found</div>;

  const tabs = [
    { id: 'menu', name: 'Menu Items', icon: Utensils },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'offers', name: 'Offers Banner', icon: Sparkles },
  ];

  const handleAddMenu = async () => {
    if (!newMenuName.trim() || !newMenuPrice.trim() || !newMenuCategory.trim()) {
      return;
    }
    const id = 'custom_' + Date.now();
    const newPriceNum = parseFloat(newMenuPrice.trim()) || newMenuPrice.trim();
    const catCount = menuItems.filter(m => m.category === newMenuCategory).length;
    const newItemData: any = {
      id,
      name: newMenuName.trim(),
      price: newPriceNum,
      category: newMenuCategory.trim(),
      description: newMenuDescription.trim(),
      isVeg: newMenuIsVeg,
      isChefRecommendation: newMenuIsChefRec,
      isAvailable: true,
      isDeleted: false,
      order: catCount,
      status: 'active',
      branchSlug: branchId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveLocalCustomItem(branchId || '', newItemData);
    setMenuItems(prev => [...prev, newItemData]);
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuDescription('');
    setNewMenuIsVeg(false);
    setNewMenuIsChefRec(false);
    try {
      await setDoc(doc(db, 'menuItems', id), newItemData);
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const toggleItemAvailability = async (item: any) => {
    const currentStatus = item.isAvailable !== false;
    const nextStatus = !currentStatus;
    saveLocalMenuItemEdit(branchId || '', { id: item.id, isAvailable: nextStatus });
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: nextStatus } : m));
    try {
      await setDoc(doc(db, 'menuItems', item.id), {
        isAvailable: nextStatus,
        branchSlug: branchId,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const toggleItemVeg = async (item: any) => {
    const nextVeg = !item.isVeg;
    saveLocalMenuItemEdit(branchId || '', { id: item.id, isVeg: nextVeg });
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isVeg: nextVeg } : m));
    try {
      await setDoc(doc(db, 'menuItems', item.id), { isVeg: nextVeg, branchSlug: branchId, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const toggleItemChefRec = async (item: any) => {
    const nextChefRec = !item.isChefRecommendation;
    saveLocalMenuItemEdit(branchId || '', { id: item.id, isChefRecommendation: nextChefRec });
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isChefRecommendation: nextChefRec } : m));
    try {
      await setDoc(doc(db, 'menuItems', item.id), { isChefRecommendation: nextChefRec, branchSlug: branchId, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const handleEditDescription = async (item: any) => {
    const newDesc = prompt(`Edit description for "${item.name}":`, item.description || "");
    if (newDesc !== null) {
      const descVal = newDesc.trim();
      saveLocalMenuItemEdit(branchId || '', { id: item.id, description: descVal });
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, description: descVal } : m));
      try {
        await setDoc(doc(db, 'menuItems', item.id), { description: descVal, branchSlug: branchId, updatedAt: Date.now() }, { merge: true });
      } catch (e) {
        console.warn('Firestore deferred sync:', e);
      }
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem({
      id: item.id,
      name: item.name || '',
      price: typeof item.price === 'number' ? String(item.price) : (item.price || ''),
      category: item.category || '',
      description: item.description || '',
      isVeg: Boolean(item.isVeg),
      isChefRecommendation: Boolean(item.isChefRecommendation),
      isAvailable: item.isAvailable !== false
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    const updatedData: any = {
      id: editingItem.id,
      name: editingItem.name.trim(),
      price: editingItem.price.trim(),
      category: editingItem.category.trim(),
      description: editingItem.description.trim(),
      isVeg: Boolean(editingItem.isVeg),
      isChefRecommendation: Boolean(editingItem.isChefRecommendation),
      isAvailable: editingItem.isAvailable !== false,
      branchSlug: branchId,
      status: 'active',
      updatedAt: Date.now()
    };
    saveLocalMenuItemEdit(branchId || '', updatedData);
    setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...updatedData } : m));
    setEditingItem(null);
    try {
      await setDoc(doc(db, 'menuItems', editingItem.id), updatedData, { merge: true });
    } catch (error) {
      console.warn('Firestore deferred sync:', error);
    }
  };

  const handleRemoveMenu = async (id: string) => {
    setLocalDeletedId(branchId || '', id, true);
    const itemToDelete = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    if (itemToDelete) {
      setDeletedItems(prev => [{ ...itemToDelete, isDeleted: true, deletedAt: Date.now() }, ...prev.filter(d => d.id !== id)]);
    }
    try {
      await setDoc(doc(db, 'menuItems', id), {
        id,
        isDeleted: true,
        deletedAt: Date.now(),
        branchSlug: branchId
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const handleRestoreMenu = async (id: string) => {
    setLocalDeletedId(branchId || '', id, false);
    const itemToRestore = deletedItems.find(d => d.id === id);
    setDeletedItems(prev => prev.filter(d => d.id !== id));
    if (itemToRestore) {
      setMenuItems(prev => [...prev, { ...itemToRestore, isDeleted: false, isPurged: false }]);
    }
    try {
      await setDoc(doc(db, 'menuItems', id), {
        id,
        isDeleted: false,
        isPurged: false,
        status: 'active',
        deletedAt: null,
        branchSlug: branchId,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const handlePermanentDeleteMenu = async (id: string) => {
    setLocalPurgedId(branchId || '', id);
    setLocalDeletedId(branchId || '', id, true);
    setDeletedItems(prev => prev.filter(d => d.id !== id));
    const isBaseItem = rawBaseItems.some((i: any) => i.id === id);
    try {
      if (isBaseItem) {
        await setDoc(doc(db, 'menuItems', id), {
          id,
          isDeleted: true,
          isPurged: true,
          branchSlug: branchId,
          deletedAt: Date.now()
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'menuItems', id));
      }
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !branchId) return;
    const id = `cat_${Date.now()}`;
    const catData: any = {
      id,
      name: newCategoryName.trim(),
      branchSlug: branchId,
      createdAt: Date.now()
    };
    saveLocalCustomCategory(branchId, catData);
    setCategories(prev => [...prev, catData]);
    setNewCategoryName('');
    try {
      await setDoc(doc(db, 'categories', id), catData);
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const handleStartEditCategory = (cat: any) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name
    });
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !branchId) return;
    const updateData = {
      id: editingCategory.id,
      name: editingCategory.name.trim(),
      branchSlug: branchId,
      updatedAt: Date.now()
    };
    saveLocalCategoryEdit(branchId, updateData);
    setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updateData } : c));
    setEditingCategory(null);
    try {
      await setDoc(doc(db, 'categories', editingCategory.id), updateData, { merge: true });
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  const handleRemoveCategory = async (id: string) => {
    setLocalDeletedCategoryId(branchId || '', id, true);
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      const isBaseCat = rawBaseCategories.some((c: any) => c.id === id);
      if (isBaseCat) {
        await setDoc(doc(db, 'categories', id), {
          id,
          isDeleted: true,
          branchSlug: branchId,
          deletedAt: Date.now()
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'categories', id));
      }
    } catch (e) {
      console.warn('Firestore deferred sync:', e);
    }
  };

  return (
    <div className="w-full">
      {/* Branch Header & Live Link */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Branch Management</span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500">{branch.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">Manage {branch.name}</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Update promotional banners, dishes, categories, and branch details.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to={`/${branch.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:text-amber-800 hover:border-amber-300 transition-colors shadow-2xs"
          >
            <span>Preview Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="bg-white border border-neutral-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5">
            <span className="text-neutral-500">Status:</span>
            {branch.status === 'active' ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Active
              </span>
            ) : (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Branch Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-neutral-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer",
                isActive 
                  ? "bg-neutral-900 text-white shadow-xs scale-[1.01]" 
                  : "bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-neutral-400")} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area - Responsive padding and full available width */}
      <div className="w-full bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[500px] shadow-xs">
          {activeTab === 'offers' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Offers & Announcement Banner</h2>
                  <p className="text-neutral-500 text-sm mt-0.5">Manage the promotional banner displayed on {branch.name}'s homepage and digital menu.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBannerActive(targetBanner?.id, bannerIsActive)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      bannerIsActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 border border-neutral-300'
                    }`}
                  >
                    {bannerIsActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Banner is Active (Visible)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Banner is Turned Off (Hidden)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Banner Live Visual Preview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Live Website Preview</span>
                  {!bannerIsActive && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Currently Turned Off (Visitors won't see this)
                    </span>
                  )}
                </div>

                <div className={`relative p-6 rounded-2xl border transition-all ${
                  bannerIsActive 
                    ? bannerTheme === 'blue'
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : bannerTheme === 'green'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : bannerTheme === 'dark'
                      ? 'bg-neutral-900 border-neutral-800 text-white'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-neutral-100 border-dashed border-neutral-300 text-neutral-600 opacity-80'
                } flex flex-col justify-center items-center text-center shadow-sm`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 ${
                    bannerTheme === 'blue'
                      ? 'bg-blue-200 text-blue-900'
                      : bannerTheme === 'green'
                      ? 'bg-emerald-200 text-emerald-900'
                      : bannerTheme === 'dark'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {bannerTagText || "Today's Special"} • {branch.name}
                  </span>

                  <h3 className="text-xl md:text-2xl font-bold mb-1">
                    {bannerTitle || "Enter banner title..."}
                  </h3>
                  <p className="text-sm opacity-90 max-w-xl">
                    {bannerSubtitle || "Enter subtitle or details regarding this offer..."}
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-5 mb-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Banner Heading / Title
                    </label>
                    <input 
                      type="text" 
                      value={bannerTitle}
                      onChange={e => setBannerTitle(e.target.value)}
                      placeholder="e.g., Buy 2 Mojitos Get 1 Free, Live FIFA Matches Everyday"
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Offer Details / Subtitle
                    </label>
                    <input 
                      type="text" 
                      value={bannerSubtitle}
                      onChange={e => setBannerSubtitle(e.target.value)}
                      placeholder="e.g., Valid all weekend by the lake. Screenings start 7 PM."
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Tag / Badge Text
                    </label>
                    <input 
                      type="text" 
                      value={bannerTagText}
                      onChange={e => setBannerTagText(e.target.value)}
                      placeholder="e.g., Today's Special, Live Event, Happy Hour"
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Color Palette
                    </label>
                    <select
                      value={bannerTheme}
                      onChange={e => setBannerTheme(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="amber">Warm Amber (Signature)</option>
                      <option value="blue">Cool Waterfront Blue</option>
                      <option value="green">Fresh Emerald Green</option>
                      <option value="dark">Luxury Obsidian Dark</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input 
                      type="checkbox" 
                      id="bannerActiveCheckbox" 
                      checked={bannerIsActive} 
                      onChange={e => setBannerIsActive(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="bannerActiveCheckbox" className="text-sm font-semibold text-neutral-800 cursor-pointer">
                      Enable Banner (Visible to visitors)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div>
                    {bannerSavedNotice && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Banner updated and saved successfully!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(targetBanner?.id, bannerIsActive)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      {bannerIsActive ? 'Turn Off Banner' : 'Turn On Banner'}
                    </button>

                    <button 
                      type="button"
                      disabled={isSavingBanner}
                      onClick={handleSaveBanner}
                      className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSavingBanner ? 'Saving...' : 'Save Banner'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Menu Items ({normalizedMenuItems.length} Dishes)</h2>
                  <p className="text-neutral-500 text-sm mt-0.5">Manage and reorder dishes for {branch.name} across all {categories.length} categories.</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMenuViewMode('grouped')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      menuViewMode === 'grouped'
                        ? 'bg-white text-neutral-950 shadow-xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Category Sections ({categories.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      menuViewMode === 'table'
                        ? 'bg-white text-neutral-950 shadow-xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5 text-amber-600" />
                    <span>Master Table (All {normalizedMenuItems.length})</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Dropdown & Quick Selector Chips */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl mb-6 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Real-time search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" />
                    <input
                      type="text"
                      value={menuSearchQuery}
                      onChange={e => setMenuSearchQuery(e.target.value)}
                      placeholder="Search any dish name, category, price..."
                      className="w-full pl-9 pr-8 py-1.5 bg-white border border-amber-300/80 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                    {menuSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMenuSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-700 w-4 h-4 flex items-center justify-center rounded-full hover:bg-neutral-100"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Dropdown Filter */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Filter Category:</span>
                    </div>
                    <select 
                      value={selectedCategoryFilter} 
                      onChange={e => {
                        const val = e.target.value;
                        setSelectedCategoryFilter(val);
                        if (val !== 'All') {
                          setNewMenuCategory(val);
                        }
                      }}
                      className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-900 shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="All">All Categories ({normalizedMenuItems.length} dishes in {categories.length} categories)</option>
                      {categories.map(c => {
                        const count = normalizedMenuItems.filter(m => m.category === c.name).length;
                        return (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name} ({count} {count === 1 ? 'dish' : 'dishes'})
                          </option>
                        );
                      })}
                    </select>

                    {selectedCategoryFilter !== 'All' && (
                      <button
                        onClick={() => setSelectedCategoryFilter('All')}
                        className="text-xs font-medium text-amber-800 hover:text-amber-950 underline px-1"
                      >
                        Show All
                      </button>
                    )}
                  </div>

                  {/* Expand / Collapse buttons when in grouped mode */}
                  {menuViewMode === 'grouped' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExpandAll}
                        className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-2.5 py-1 bg-white border border-amber-200 rounded-md shadow-2xs hover:bg-amber-100/50 transition-colors"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={handleCollapseAll}
                        className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-2.5 py-1 bg-white border border-amber-200 rounded-md shadow-2xs hover:bg-amber-100/50 transition-colors"
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-xs text-neutral-600">
                  <div>
                    <span>Showing <strong>{totalFilteredCount}</strong> {totalFilteredCount === 1 ? 'dish' : 'dishes'} in <strong>{categoryWiseMenu.length}</strong> {categoryWiseMenu.length === 1 ? 'category' : 'categories'}</span>
                    {menuSearchQuery && (
                      <span className="ml-2 text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-medium">
                        Filtered by "{menuSearchQuery}"
                      </span>
                    )}
                  </div>
                  {reorderSaving && (
                    <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded animate-pulse">
                      Updating order...
                    </span>
                  )}
                </div>

                {/* Quick Category Jump / Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-amber-200/60 pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('All')}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategoryFilter === 'All'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-white/80 text-neutral-700 hover:bg-white border border-amber-200/80'
                    }`}
                  >
                    All Categories ({normalizedMenuItems.length})
                  </button>
                  {categories.map(c => {
                    const count = normalizedMenuItems.filter(m => m.category === c.name).length;
                    const isSelected = selectedCategoryFilter === c.name;
                    return (
                      <button
                        key={c.id || c.name}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(c.name);
                          setNewMenuCategory(c.name);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 shadow-xs'
                            : 'bg-white/80 text-neutral-700 hover:bg-white border border-amber-200/80'
                        }`}
                      >
                        {c.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Live Availability Status Filter & Trash Archive */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Availability:</span>
                    <button
                      type="button"
                      onClick={() => setAvailabilityFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        availabilityFilter === 'all'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                      }`}
                    >
                      All Items ({normalizedMenuItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailabilityFilter('available')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        availabilityFilter === 'available'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>In Stock / Available ({availableCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailabilityFilter('unavailable')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        availabilityFilter === 'unavailable'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>Out of Stock / OFF ({unavailableCount})</span>
                    </button>
                  </div>

                  {deletedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowTrashModal(true)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 transition-colors shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Deleted Trash ({deletedItems.length})</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 mb-8 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Item Name *</label>
                    <input 
                      type="text" 
                      value={newMenuName} 
                      onChange={e => setNewMenuName(e.target.value)} 
                      placeholder="e.g. Asado Beef Steak" 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Price (₹) *</label>
                    <input 
                      type="text" 
                      value={newMenuPrice} 
                      onChange={e => setNewMenuPrice(e.target.value)} 
                      placeholder="e.g. 260" 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="w-56">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Category *</label>
                    <select 
                      value={newMenuCategory} 
                      onChange={e => setNewMenuCategory(e.target.value)} 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-end pt-2 border-t border-neutral-200">
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Description (Optional)</label>
                    <input 
                      type="text" 
                      value={newMenuDescription} 
                      onChange={e => setNewMenuDescription(e.target.value)} 
                      placeholder="e.g. Juicy grilled steak served with signature pepper sauce" 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Dietary</label>
                      <button
                        type="button"
                        onClick={() => setNewMenuIsVeg(!newMenuIsVeg)}
                        className={`h-[38px] px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                          newMenuIsVeg ? 'bg-green-50 border-green-300 text-green-700 shadow-sm' : 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                        }`}
                        title="Click to toggle Veg / Non-Veg"
                      >
                        <DietarySymbol isVeg={newMenuIsVeg} size="sm" />
                        <span>{newMenuIsVeg ? 'Vegetarian' : 'Non-Veg'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Highlight</label>
                      <button
                        type="button"
                        onClick={() => setNewMenuIsChefRec(!newMenuIsChefRec)}
                        className={`h-[38px] px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          newMenuIsChefRec ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                        }`}
                        title="Click to toggle Chef's Recommendation"
                      >
                        <Flame className={`w-3.5 h-3.5 ${newMenuIsChefRec ? 'text-amber-600 fill-amber-500' : 'text-neutral-400'}`} />
                        <span>Chef Recommended</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={handleAddMenu} className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm h-[38px] ml-auto">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>

              {/* Notice explaining reordering */}
              <div className="text-xs text-neutral-500 mb-4 flex items-center justify-between">
                <span>💡 Dishes are arranged in a <strong>category-wise list</strong>. Use the <strong>▲</strong> and <strong>▼</strong> buttons to adjust the sequence of dishes within each category.</span>
              </div>

              {/* Category-Wise List / Master Table of Menu Items */}
              {menuViewMode === 'table' ? (
                /* Master Table Mode (All Dishes) */
                <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-neutral-100/90 border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-amber-600" />
                      <h3 className="font-bold text-neutral-900 text-base">
                        Master Dishes Table
                      </h3>
                      <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                        {allFilteredDishes.length} {allFilteredDishes.length === 1 ? 'dish' : 'dishes'}
                      </span>
                    </div>
                    {menuSearchQuery && (
                      <span className="text-xs text-neutral-500">
                        Filtering by: <strong className="text-neutral-800">"{menuSearchQuery}"</strong>
                      </span>
                    )}
                  </div>

                  {allFilteredDishes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50/70 border-b border-neutral-200 text-xs text-neutral-500 uppercase font-semibold">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center w-14">#</th>
                            <th className="px-3 py-2.5 font-semibold text-neutral-600 w-36">Category</th>
                            <th className="px-4 py-2.5 font-semibold text-neutral-600">Item & Description</th>
                            <th className="px-4 py-2.5 font-semibold text-neutral-600 w-28">Type</th>
                            <th className="px-4 py-2.5 font-semibold text-neutral-600 w-24">Price</th>
                            <th className="px-4 py-2.5 text-center font-semibold text-neutral-600 w-32">Status / Stock</th>
                            <th className="px-4 py-2.5 text-right font-semibold text-neutral-600 w-36">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {allFilteredDishes.map((item, itemIdx) => {
                            const isAvailable = item.isAvailable !== false;
                            return (
                              <tr key={item.id} className={`hover:bg-neutral-50/50 transition-colors ${!isAvailable ? 'bg-rose-50/20' : ''}`}>
                                <td className="px-3 py-3 text-center whitespace-nowrap text-xs font-semibold text-neutral-500">
                                  {itemIdx + 1}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCategoryFilter(item.category || 'All');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                                    title={`Filter by ${item.category}`}
                                  >
                                    <span>{item.category || 'Unassigned'}</span>
                                  </button>
                                </td>
                                <td className="px-4 py-3 max-w-[280px]">
                                  <div className="flex items-start gap-2">
                                    <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                                    <div className="min-w-0">
                                      <div className="font-semibold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                                        <span>{item.name}</span>
                                        {item.isChefRecommendation && (
                                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Chef Recommended
                                          </span>
                                        )}
                                        {!isAvailable && (
                                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            Out of Stock
                                          </span>
                                        )}
                                      </div>
                                      {item.description ? (
                                        <p className="text-neutral-500 text-xs mt-0.5 line-clamp-2 leading-relaxed flex items-center gap-1">
                                          <span>{item.description}</span>
                                          <button onClick={() => handleEditDescription(item)} title="Edit description" className="text-neutral-400 hover:text-amber-600 shrink-0">
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                        </p>
                                      ) : (
                                        <button onClick={() => handleEditDescription(item)} className="text-[11px] text-amber-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                                          <Plus className="w-2.5 h-2.5" /> Add description
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => toggleItemVeg(item)}
                                    title="Click to switch Veg / Non-Veg"
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      item.isVeg 
                                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                    }`}
                                  >
                                    <DietarySymbol isVeg={item.isVeg} size="sm" />
                                    <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                                  </button>
                                </td>
                                <td className="px-4 py-3 font-semibold text-neutral-900">₹{item.price}</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemAvailability(item)}
                                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                      isAvailable
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                                        : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 shadow-2xs'
                                    }`}
                                    title={isAvailable ? "Dish is LIVE. Click to toggle OFF (Out of Stock)" : "Dish is OFF. Click to toggle ON (In Stock)"}
                                  >
                                    <span className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                                      isAvailable ? 'bg-emerald-500' : 'bg-neutral-300'
                                    }`}>
                                      <span className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                                        isAvailable ? 'translate-x-3' : 'translate-x-0'
                                      }`} />
                                    </span>
                                    <span>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleStartEdit(item)} 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-amber-800 bg-neutral-100 hover:bg-amber-100/80 border border-neutral-200 hover:border-amber-300 transition-colors"
                                      title="Edit item details"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                      <span>Edit</span>
                                    </button>
                                    <button 
                                      onClick={() => handleRemoveMenu(item.id)} 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                      title="Delete item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-neutral-500">
                      <p className="text-base font-semibold text-neutral-800">No dishes match your filter</p>
                      {menuSearchQuery && (
                        <button
                          onClick={() => setMenuSearchQuery('')}
                          className="mt-2 text-xs text-amber-700 hover:underline font-semibold"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Grouped by Category View */
                <div className="space-y-4">
                  {categoryWiseMenu.map((group) => {
                    const isCollapsed = Boolean(collapsedCategories[group.categoryName]);

                    return (
                      <div key={group.categoryName} className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        {/* Category Header Bar */}
                        <div 
                          className="bg-neutral-100/90 hover:bg-neutral-200/70 border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                          onClick={() => toggleCategoryCollapse(group.categoryName)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-neutral-500 hover:text-neutral-800">
                              {isCollapsed ? (
                                <ChevronRight className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                            <span className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-xs shadow-xs">
                              {group.items.length}
                            </span>
                            <div>
                              <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                                <span>{group.categoryName}</span>
                              </h3>
                              <span className="text-xs text-neutral-500 font-medium">
                                {group.items.length} {group.items.length === 1 ? 'dish' : 'dishes'} in this category {isCollapsed && '(Click to expand)'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setNewMenuCategory(group.categoryName);
                                const nameInput = document.querySelector('input[placeholder="e.g. Asado Beef Steak"]') as HTMLInputElement | null;
                                nameInput?.focus();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:text-amber-800 hover:border-amber-400 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-600" />
                              <span>Add dish to {group.categoryName}</span>
                            </button>
                          </div>
                        </div>

                        {/* Dishes Table for this Category */}
                        {!isCollapsed && (
                          group.items.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50/70 border-b border-neutral-200 text-xs text-neutral-500 uppercase font-semibold">
                                  <tr>
                                    <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center w-20">Order</th>
                                    <th className="px-4 py-2.5 font-semibold text-neutral-600">Item & Description</th>
                                    <th className="px-4 py-2.5 font-semibold text-neutral-600 w-28">Type</th>
                                    <th className="px-4 py-2.5 font-semibold text-neutral-600 w-24">Price</th>
                                    <th className="px-4 py-2.5 text-center font-semibold text-neutral-600 w-32">Status / Stock</th>
                                    <th className="px-4 py-2.5 text-right font-semibold text-neutral-600 w-36">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                  {group.items.map((item, itemIdx) => {
                                    const isFirst = itemIdx === 0;
                                    const isLast = itemIdx === group.items.length - 1;
                                    const isAvailable = item.isAvailable !== false;

                                    return (
                                      <tr key={item.id} className={`hover:bg-neutral-50/50 transition-colors ${!isAvailable ? 'bg-rose-50/20' : ''}`}>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                          <div className="inline-flex items-center gap-0.5 bg-neutral-100 border border-neutral-200 rounded-lg p-0.5">
                                            <button
                                              type="button"
                                              onClick={() => handleMoveItem(item, 'up')}
                                              disabled={isFirst || reorderSaving}
                                              title={isFirst ? "At top of category" : "Move up"}
                                              className="p-1 text-neutral-600 hover:text-amber-700 hover:bg-white rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                            >
                                              <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-[11px] font-bold text-neutral-700 px-1 min-w-[20px] text-center">
                                              {itemIdx + 1}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleMoveItem(item, 'down')}
                                              disabled={isLast || reorderSaving}
                                              title={isLast ? "At bottom of category" : "Move down"}
                                              className="p-1 text-neutral-600 hover:text-amber-700 hover:bg-white rounded transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                            >
                                              <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-[280px]">
                                          <div className="flex items-start gap-2">
                                            <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                                            <div className="min-w-0">
                                              <div className="font-semibold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                                                <span>{item.name}</span>
                                                {item.isChefRecommendation && (
                                                  <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Chef Recommended
                                                  </span>
                                                )}
                                                {!isAvailable && (
                                                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    Out of Stock
                                                  </span>
                                                )}
                                              </div>
                                              {item.description ? (
                                                <p className="text-neutral-500 text-xs mt-0.5 line-clamp-2 leading-relaxed flex items-center gap-1">
                                                  <span>{item.description}</span>
                                                  <button onClick={() => handleEditDescription(item)} title="Edit description" className="text-neutral-400 hover:text-amber-600 shrink-0">
                                                    <Edit3 className="w-3 h-3" />
                                                  </button>
                                                </p>
                                              ) : (
                                                <button onClick={() => handleEditDescription(item)} className="text-[11px] text-amber-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                                                  <Plus className="w-2.5 h-2.5" /> Add description
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <button
                                            onClick={() => toggleItemVeg(item)}
                                            title="Click to switch Veg / Non-Veg"
                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                                              item.isVeg 
                                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                            }`}
                                          >
                                            <DietarySymbol isVeg={item.isVeg} size="sm" />
                                            <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-neutral-900">₹{item.price}</td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                          <button
                                            type="button"
                                            onClick={() => toggleItemAvailability(item)}
                                            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                              isAvailable
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                                                : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 shadow-2xs'
                                            }`}
                                            title={isAvailable ? "Dish is LIVE. Click to toggle OFF (Out of Stock)" : "Dish is OFF. Click to toggle ON (In Stock)"}
                                          >
                                            <span className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                                              isAvailable ? 'bg-emerald-500' : 'bg-neutral-300'
                                            }`}>
                                              <span className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                                                isAvailable ? 'translate-x-3' : 'translate-x-0'
                                              }`} />
                                            </span>
                                            <span>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                          <div className="flex items-center justify-end gap-2">
                                            <button 
                                              onClick={() => handleStartEdit(item)} 
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-amber-800 bg-neutral-100 hover:bg-amber-100/80 border border-neutral-200 hover:border-amber-300 transition-colors"
                                              title="Edit item details"
                                            >
                                              <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                              <span>Edit</span>
                                            </button>
                                            <button 
                                              onClick={() => handleRemoveMenu(item.id)} 
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                              title="Delete item"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-4 py-10 text-center text-neutral-500 bg-neutral-50/50">
                              <p className="text-sm font-medium">No dishes in category "{group.categoryName}" yet.</p>
                              <p className="text-xs text-neutral-400 mt-1">Use the "Add dish to {group.categoryName}" button to add the first item.</p>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}

                  {categoryWiseMenu.length === 0 && (
                    <div className="border border-neutral-200 rounded-xl p-12 text-center text-neutral-500 bg-white">
                      <p className="text-base font-semibold text-neutral-800">No dishes found</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {selectedCategoryFilter !== 'All' 
                          ? `No items found in category "${selectedCategoryFilter}". Add an item using the form above.`
                          : "No dishes added to this branch yet. Add your first dish using the form above."}
                      </p>
                      {menuSearchQuery && (
                        <button
                          onClick={() => setMenuSearchQuery('')}
                          className="mt-3 text-xs text-amber-700 hover:underline font-semibold"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Categories Management</h2>
                  <p className="text-neutral-500 text-sm">Add, edit, and organize menu categories for this branch.</p>
                </div>
              </div>

              {/* Add New Category Box */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 mb-8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Add New Category</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Category Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Seafood Starters, Signature Platters..." 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newCategoryName.trim()) {
                          handleAddCategory();
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div className="w-full sm:w-auto self-end pt-1 sm:pt-0">
                    <button 
                      onClick={handleAddCategory} 
                      disabled={!newCategoryName.trim()}
                      className="w-full sm:w-auto bg-neutral-900 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden file input for category photo upload */}
              <input 
                type="file" 
                ref={catFileInputRef} 
                accept="image/*" 
                onChange={handleCategoryPhotoUpload} 
                className="hidden" 
              />

              {/* Categories List Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50/90 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-5 py-3.5 w-16 text-center">#</th>
                      <th className="px-5 py-3.5">Category Name</th>
                      <th className="px-5 py-3.5">Card Background</th>
                      <th className="px-5 py-3.5">Dishes</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {categories.map((c, idx) => {
                      const count = menuItems.filter(m => m.category === c.name).length;
                      const catBgUrl = c.imageUrl || c.image;

                      return (
                        <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-center text-xs font-semibold text-neutral-400">
                            {idx + 1}
                          </td>

                          <td className="px-5 py-3.5 font-bold text-neutral-900">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{c.name}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0 relative">
                                {catBgUrl ? (
                                  <img 
                                    src={catBgUrl} 
                                    alt={c.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadingCatId(c.id);
                                  catFileInputRef.current?.click();
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                title="Change card background photo"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{catBgUrl ? 'Change Photo' : 'Add Photo'}</span>
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-neutral-500 font-medium">
                            <span className="inline-block px-2.5 py-0.5 bg-neutral-100 rounded-md text-xs font-semibold text-neutral-700">
                              {count} {count === 1 ? 'dish' : 'dishes'}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Name */}
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(c)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors cursor-pointer"
                                title="Edit category name"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Edit</span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(c.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                          No categories found. Add your first category above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      {/* Edit Menu Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Edit Menu Item</h3>
                  <p className="text-xs text-neutral-500">Update item name, price, category, and dietary options</p>
                </div>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Item Name</label>
                  <input 
                    type="text" 
                    value={editingItem.name} 
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} 
                    className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="Item name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Price (₹)</label>
                    <input 
                      type="text" 
                      value={editingItem.price} 
                      onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} 
                      className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="e.g. 260"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Category</label>
                    <select 
                      value={editingItem.category} 
                      onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} 
                      className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Description</label>
                  <textarea 
                    rows={3}
                    value={editingItem.description} 
                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} 
                    placeholder="Flavor notes, ingredients, preparation..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500 resize-none" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Dietary Type</label>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, isVeg: !editingItem.isVeg })}
                      className={`w-full py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        editingItem.isVeg ? 'bg-green-50 border-green-300 text-green-700 shadow-sm' : 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                      }`}
                    >
                      <DietarySymbol isVeg={editingItem.isVeg} size="sm" />
                      <span>{editingItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Recommendation</label>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, isChefRecommendation: !editingItem.isChefRecommendation })}
                      className={`w-full py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        editingItem.isChefRecommendation ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' : 'bg-neutral-50 border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${editingItem.isChefRecommendation ? 'text-amber-600 fill-amber-500' : 'text-neutral-400'}`} />
                      <span>{editingItem.isChefRecommendation ? "Chef's Special" : 'Standard'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Availability (Live)</label>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, isAvailable: editingItem.isAvailable === false ? true : false })}
                      className={`w-full py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        editingItem.isAvailable !== false
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                          : 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${editingItem.isAvailable !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{editingItem.isAvailable !== false ? 'In Stock (ON)' : 'Out of Stock (OFF)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingCategory(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Edit Category</h3>
                  <p className="text-xs text-neutral-500">Update category title</p>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditCategory}
                  disabled={!editingCategory.name.trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trash / Deleted Items Management Modal */}
      <AnimatePresence>
        {showTrashModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTrashModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Deleted Items ({deletedItems.length})</h3>
                    <p className="text-xs text-neutral-500">Deleted items are hidden from public menus. You can restore or permanently delete them.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrashModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {deletedItems.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">
                    <Trash2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Trash is empty</p>
                    <p className="text-xs text-neutral-400 mt-0.5">No deleted menu items for this branch.</p>
                  </div>
                ) : (
                  deletedItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-neutral-200/70 border border-neutral-300 flex items-center justify-center shrink-0">
                          <DietarySymbol isVeg={item.isVeg} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-neutral-900 truncate">{item.name}</h4>
                            <span className="text-xs font-semibold text-neutral-600 bg-neutral-200/70 px-2 py-0.5 rounded">
                              ₹{item.price}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Category: <span className="font-medium text-neutral-700">{item.category || 'General'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestoreMenu(item.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore to Menu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDeleteMenu(item.id)}
                          className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-neutral-200 hover:border-rose-300 rounded-lg text-xs font-medium transition-colors"
                          title="Permanently remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowTrashModal(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
