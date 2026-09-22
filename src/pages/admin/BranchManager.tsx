import React, { useMemo } from "react";
import { useParams, Link } from 'react-router-dom';
import { branches, kollamMenu, alappuzhaMenu, kollamCategories, alappuzhaCategories } from '../../data';
import { useState, useEffect, useRef } from 'react';
import { Image, Utensils, Tag, Store, Plus, Trash2, Camera, Upload, Flame, Edit3, X, ArrowUp, ArrowDown, Eye, EyeOff, Check, Filter, Sparkles, ExternalLink, Search, ChevronDown, ChevronUp, ChevronRight, Layers, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { compressImage } from '../../lib/imageCompressor';
import { motion, AnimatePresence } from 'motion/react';
import DietarySymbol from '../../components/DietarySymbol';
import { useBanners, Banner } from '../../hooks/useBanners';
import { resolveItemCategory, normalizeMenuItems } from '../../lib/categoryUtils';

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
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const rawBaseItems = useMemo(() => {
    return branchId === 'kollam' ? kollamMenu : branchId === 'alappuzha' ? alappuzhaMenu : [];
  }, [branchId]);

  const rawBaseCategories = useMemo(() => {
    return branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : [];
  }, [branchId]);

  const [categories, setCategories] = useState<any[]>(() => {
    return branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : [];
  });

  const [menuItems, setMenuItems] = useState<any[]>(() => {
    const raw = branchId === 'kollam' ? kollamMenu : branchId === 'alappuzha' ? alappuzhaMenu : [];
    const cats = branchId === 'kollam' ? kollamCategories : branchId === 'alappuzha' ? alappuzhaCategories : [];
    return normalizeMenuItems(raw, cats);
  });
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const newMenuFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [targetMenuId, setTargetMenuId] = useState<string | null>(null);
  const [uploadingMenuId, setUploadingMenuId] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');
  const [newMenuIsVeg, setNewMenuIsVeg] = useState(false);
  const [newMenuIsChefRec, setNewMenuIsChefRec] = useState(false);
  const [newMenuImage, setNewMenuImage] = useState('');
  const [compressingNewMenuImage, setCompressingNewMenuImage] = useState(false);
  
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
    imageUrl?: string;
  } | null>(null);
  const [compressingEditImage, setCompressingEditImage] = useState(false);

  const DEFAULT_CATEGORY_BG = "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [compressingNewCatImage, setCompressingNewCatImage] = useState(false);
  const newCatFileInputRef = useRef<HTMLInputElement>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const [targetCatId, setTargetCatId] = useState<string | null>(null);
  const [uploadingCatId, setUploadingCatId] = useState<string | null>(null);

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    imageUrl?: string;
  } | null>(null);
  const [compressingEditCatImage, setCompressingEditCatImage] = useState(false);
  const editCatFileInputRef = useRef<HTMLInputElement>(null);

  const [newImageCategory, setNewImageCategory] = useState('Food');

  const galleryCategories = ['Food', 'Ambience', 'Lake View', 'Boating', 'Events', 'Decorations'];

  useEffect(() => {
    if (!branchId) return;
    const q = query(collection(db, 'galleryImages'), where('branchSlug', '==', branchId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(images.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'galleryImages');
    });

    const qMenu = query(collection(db, 'menuItems'), where('branchSlug', '==', branchId));
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentCats = categories.length > 0 ? categories : rawBaseCategories;
      const dbItemMap = new Map(dbItems.map((item: any) => [item.id, item]));

      // Deep merge static items with Firestore updates so partial doc updates don't wipe static fields
      const merged = rawBaseItems.map((staticItem: any) => {
        const dbItem = dbItemMap.get(staticItem.id);
        if (!dbItem) return { ...staticItem, isAvailable: staticItem.isAvailable !== false };
        return {
          ...staticItem,
          ...dbItem,
          isAvailable: dbItem.isAvailable !== undefined ? dbItem.isAvailable : (staticItem.isAvailable !== false)
        };
      });

      // Add custom items created in Firestore
      const existingIds = new Set(rawBaseItems.map((i: any) => i.id));
      dbItems.forEach((item: any) => {
        if (!existingIds.has(item.id)) {
          merged.push({
            ...item,
            isAvailable: item.isAvailable !== false
          });
        }
      });

      const activeList: any[] = [];
      const deletedList: any[] = [];
      merged.forEach((item: any) => {
        if (item.isDeleted === true) {
          if (!item.isPurged) {
            deletedList.push(item);
          }
        } else {
          activeList.push(item);
        }
      });

      setMenuItems(normalizeMenuItems(activeList, currentCats));
      setDeletedItems(normalizeMenuItems(deletedList, currentCats));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menuItems');
    });

    const qCat = query(collection(db, 'categories'), where('branchSlug', '==', branchId));
    const unsubCat = onSnapshot(qCat, (snapshot) => {
      const dbCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (dbCats.length === 0) {
        setCategories(rawBaseCategories.filter((c: any) => !c.isDeleted));
      } else {
        const dbCatMap = new Map(dbCats.map((c: any) => [c.id, c]));
        const merged = rawBaseCategories.map((sc: any) => dbCatMap.get(sc.id) || sc);
        const existingIds = new Set(rawBaseCategories.map((c: any) => c.id));
        dbCats.forEach((c: any) => {
          if (!existingIds.has(c.id)) merged.push(c);
        });
        setCategories(merged.filter((c: any) => c.isDeleted !== true));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });
  
    return () => { unsubscribe(); unsubMenu(); unsubCat(); };
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

    try {
      await setDoc(doc(db, 'banners', id), {
        id,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        tagText: bannerTagText.trim(),
        branchSlug: branchId,
        isActive: bannerIsActive,
        updatedAt: Date.now(),
        ...themeConfig
      }, { merge: true });

      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    } catch (err: any) {
      console.error("Failed to save banner:", err);
      handleFirestoreError(err, OperationType.UPDATE, `banners/${id}`);
      alert("Error saving banner: " + (err?.message || "Unknown error"));
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

    try {
      await setDoc(doc(db, 'banners', id), {
        id,
        title: bannerTitle.trim() || (branch?.slug === 'kollam' ? "See Live FIFA 2026 Matches (Everyday)" : "Live Music Every Saturday"),
        subtitle: bannerSubtitle.trim() || "Promotional specials and lakeside dining.",
        tagText: bannerTagText.trim() || "Special Event",
        branchSlug: branchId,
        isActive: nextState,
        updatedAt: Date.now(),
        ...themeConfig
      }, { merge: true });

      setBannerSavedNotice(true);
      setTimeout(() => setBannerSavedNotice(false), 4000);
    } catch (err: any) {
      console.error("Error toggling banner", err);
      handleFirestoreError(err, OperationType.UPDATE, `banners/${id}`);
      alert("Error updating banner: " + (err?.message || "Unknown error"));
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
          description: item.description || '',
          imageUrl: item.imageUrl || null
        }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to commit item reorder", err);
      handleFirestoreError(err, OperationType.UPDATE, 'menuItems');
    } finally {
      setReorderSaving(false);
    }
  };

  if (!branch) return <div>Branch not found</div>;

  const tabs = [
    { id: 'menu', name: 'Menu Items', icon: Utensils },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'offers', name: 'Offers Banner', icon: Tag },
    { id: 'gallery', name: 'Gallery', icon: Image },
  ];

  const handleAddImage = async () => {
    if (!newImageUrl) return;
    const id = Date.now().toString();
    const newImg = {
      url: newImageUrl,
      category: newImageCategory,
      branchSlug: branchId,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'galleryImages', id), newImg);
      setNewImageUrl('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `galleryImages/${id}`);
    }
  };

  const handleRemoveImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'galleryImages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `galleryImages/${id}`);
    }
  };

  const triggerMenuUpload = (menuId: string) => {
    setTargetMenuId(menuId);
    if (menuFileInputRef.current) menuFileInputRef.current.click();
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const menuId = targetMenuId;
    if (!file || !branchId || !menuId) return;

    setUploadingMenuId(menuId);
    try {
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file (JPG, PNG, WEBP).");
        return;
      }
      // Compress image client-side to a crisp ~40-70KB Data URL (100% free direct to Firestore!)
      const compressedDataUrl = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 });
      
      await setDoc(doc(db, 'menuItems', menuId), { imageUrl: compressedDataUrl }, { merge: true });
    } catch (error) {
      console.error(error);
      alert("Image processing failed: " + (error as Error).message);
    } finally {
      setUploadingMenuId(null);
      setTargetMenuId(null);
      if (menuFileInputRef.current) menuFileInputRef.current.value = '';
    }
  };

  const handleNewMenuImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }
    setCompressingNewMenuImage(true);
    try {
      const compressedDataUrl = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 });
      setNewMenuImage(compressedDataUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to compress image: " + (error as Error).message);
    } finally {
      setCompressingNewMenuImage(false);
      if (newMenuFileInputRef.current) newMenuFileInputRef.current.value = '';
    }
  };

  const handleAddMenu = async () => {
    if (!newMenuName || !newMenuPrice || !newMenuCategory) return;
    const id = Date.now().toString();
    try {
      const catCount = menuItems.filter(m => m.category === newMenuCategory).length;
      await setDoc(doc(db, 'menuItems', id), {
        name: newMenuName,
        price: newMenuPrice,
        category: newMenuCategory,
        description: newMenuDescription.trim(),
        isVeg: newMenuIsVeg,
        isChefRecommendation: newMenuIsChefRec,
        isAvailable: true,
        isDeleted: false,
        imageUrl: newMenuImage || null,
        order: catCount,
        status: 'active',
        branchSlug: branchId,
        createdAt: Date.now()
      });
      setNewMenuName('');
      setNewMenuPrice('');
      setNewMenuDescription('');
      setNewMenuIsVeg(false);
      setNewMenuIsChefRec(false);
      setNewMenuImage('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'menuItems');
    }
  };

  const toggleItemAvailability = async (item: any) => {
    const currentStatus = item.isAvailable !== false;
    const nextStatus = !currentStatus;
    try {
      await setDoc(doc(db, 'menuItems', item.id), {
        isAvailable: nextStatus,
        branchSlug: branchId,
        updatedAt: Date.now()
      }, { merge: true });
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: nextStatus } : m));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `menuItems/${item.id}`);
    }
  };

  const toggleItemVeg = async (item: any) => {
    try {
      await setDoc(doc(db, 'menuItems', item.id), { isVeg: !item.isVeg, branchSlug: branchId }, { merge: true });
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isVeg: !item.isVeg } : m));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `menuItems/${item.id}`);
    }
  };

  const toggleItemChefRec = async (item: any) => {
    try {
      await setDoc(doc(db, 'menuItems', item.id), { isChefRecommendation: !item.isChefRecommendation, branchSlug: branchId }, { merge: true });
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isChefRecommendation: !item.isChefRecommendation } : m));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `menuItems/${item.id}`);
    }
  };

  const handleEditDescription = async (item: any) => {
    const newDesc = prompt(`Edit description for "${item.name}":`, item.description || "");
    if (newDesc !== null) {
      try {
        await setDoc(doc(db, 'menuItems', item.id), { description: newDesc.trim(), branchSlug: branchId }, { merge: true });
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, description: newDesc.trim() } : m));
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `menuItems/${item.id}`);
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
      isAvailable: item.isAvailable !== false,
      imageUrl: item.imageUrl || item.image || ''
    });
  };

  const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setCompressingEditImage(true);
    try {
      const compressedBase64 = await compressImage(file, { maxWidth: 800, quality: 0.7 });
      setEditingItem(prev => prev ? { ...prev, imageUrl: compressedBase64 } : null);
    } catch (err) {
      console.error("Failed to compress edit image", err);
      alert("Could not process image. Please try another image.");
    } finally {
      setCompressingEditImage(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editingItem.name.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    try {
      const updatedData: any = {
        name: editingItem.name.trim(),
        price: editingItem.price.trim(),
        category: editingItem.category.trim(),
        description: editingItem.description.trim(),
        isVeg: Boolean(editingItem.isVeg),
        isChefRecommendation: Boolean(editingItem.isChefRecommendation),
        isAvailable: editingItem.isAvailable !== false,
        imageUrl: editingItem.imageUrl || null,
        branchSlug: branchId,
        status: 'active',
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'menuItems', editingItem.id), updatedData, { merge: true });
      setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...updatedData } : m));
      setEditingItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menuItems/${editingItem.id}`);
    }
  };

  const handleRemoveMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item? It will be removed from the public menu and active management.')) return;
    try {
      await setDoc(doc(db, 'menuItems', id), {
        isDeleted: true,
        deletedAt: Date.now(),
        branchSlug: branchId
      }, { merge: true });
      const itemToDelete = menuItems.find(m => m.id === id);
      setMenuItems(prev => prev.filter(m => m.id !== id));
      if (itemToDelete) {
        setDeletedItems(prev => [{ ...itemToDelete, isDeleted: true, deletedAt: Date.now() }, ...prev.filter(d => d.id !== id)]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `menuItems/${id}`);
    }
  };

  const handleRestoreMenu = async (id: string) => {
    try {
      await setDoc(doc(db, 'menuItems', id), {
        isDeleted: false,
        isPurged: false,
        status: 'active',
        deletedAt: null,
        branchSlug: branchId,
        updatedAt: Date.now()
      }, { merge: true });
      const itemToRestore = deletedItems.find(d => d.id === id);
      setDeletedItems(prev => prev.filter(d => d.id !== id));
      if (itemToRestore) {
        setMenuItems(prev => [...prev, { ...itemToRestore, isDeleted: false, isPurged: false }]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `menuItems/${id}`);
    }
  };

  const handlePermanentDeleteMenu = async (id: string) => {
    if (!confirm('Permanently purge this item from history? This cannot be undone.')) return;
    try {
      const isBaseItem = rawBaseItems.some((i: any) => i.id === id);
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
      setDeletedItems(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `menuItems/${id}`);
    }
  };

  const handleNewCatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingNewCatImage(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 1000, quality: 0.75 });
      setNewCategoryImage(compressed);
    } catch (err) {
      console.error("Failed to compress category image", err);
      alert("Could not process image.");
    } finally {
      setCompressingNewCatImage(false);
      if (newCatFileInputRef.current) newCatFileInputRef.current.value = '';
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !branchId) return;
    const id = `cat_${Date.now()}`;
    const catData: any = {
      id,
      name: newCategoryName.trim(),
      branchSlug: branchId,
      image: newCategoryImage || null,
      imageUrl: newCategoryImage || null,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'categories', id), catData);
      setCategories(prev => [...prev, catData]);
      setNewCategoryName('');
      setNewCategoryImage('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'categories');
    }
  };

  const triggerCategoryPhotoUpload = (catId: string) => {
    setTargetCatId(catId);
    setTimeout(() => {
      catFileInputRef.current?.click();
    }, 50);
  };

  const handleCategoryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCatId || !branchId) return;
    const catToUpdate = categories.find(c => c.id === targetCatId);
    if (!catToUpdate) return;

    setUploadingCatId(targetCatId);
    try {
      const compressed = await compressImage(file, { maxWidth: 1000, quality: 0.75 });
      const updateData = {
        name: catToUpdate.name,
        branchSlug: branchId,
        image: compressed,
        imageUrl: compressed,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'categories', targetCatId), updateData, { merge: true });
      setCategories(prev => prev.map(c => c.id === targetCatId ? { ...c, ...updateData } : c));
    } catch (err) {
      console.error("Failed to process category photo", err);
      alert("Could not upload category photo.");
    } finally {
      setUploadingCatId(null);
      setTargetCatId(null);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    }
  };

  const handleRemoveCategoryPhoto = async (cat: any) => {
    if (!confirm(`Remove background photo from category "${cat.name}"? It will revert to the default culinary background.`)) return;
    try {
      const updateData = {
        image: null,
        imageUrl: null,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'categories', cat.id), updateData, { merge: true });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, image: undefined, imageUrl: undefined } : c));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `categories/${cat.id}`);
    }
  };

  const handleStartEditCategory = (cat: any) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl || cat.image || ''
    });
  };

  const handleEditCatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;
    setCompressingEditCatImage(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 1000, quality: 0.75 });
      setEditingCategory(prev => prev ? { ...prev, imageUrl: compressed } : null);
    } catch (err) {
      console.error("Failed to compress edit category image", err);
      alert("Could not process image.");
    } finally {
      setCompressingEditCatImage(false);
      if (editCatFileInputRef.current) editCatFileInputRef.current.value = '';
    }
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !branchId) return;
    try {
      const updateData = {
        name: editingCategory.name.trim(),
        branchSlug: branchId,
        image: editingCategory.imageUrl || null,
        imageUrl: editingCategory.imageUrl || null,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'categories', editingCategory.id), updateData, { merge: true });
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updateData } : c));
      setEditingCategory(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `categories/${editingCategory.id}`);
    }
  };

  const handleRemoveCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Dishes in this category may be affected.')) return;
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
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;
    setUploading(true);
    try {
      if (file.type.startsWith('video/')) {
        alert("Video files cannot be stored directly in free database documents due to size constraints. You can paste any direct video URL (e.g. from YouTube, Supabase Storage, or Cloudinary) into the URL box!");
        return;
      }

      // In-browser compression: scale & compress image client-side to ~60-100KB WebP
      const compressedDataUrl = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.78 });

      // Immediately add to gallery in Firestore - 100% free on Spark plan!
      const id = Date.now().toString();
      const newImg = {
        url: compressedDataUrl,
        category: newImageCategory,
        branchSlug: branchId,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'galleryImages', id), newImg);
      setNewImageUrl('');
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert("Failed to process image: " + (error?.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Item Name</label>
                    <input 
                      type="text" 
                      value={newMenuName} 
                      onChange={e => setNewMenuName(e.target.value)} 
                      placeholder="e.g. Asado Beef Steak" 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Price</label>
                    <input 
                      type="text" 
                      value={newMenuPrice} 
                      onChange={e => setNewMenuPrice(e.target.value)} 
                      placeholder="e.g. 260" 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="w-44">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Category</label>
                    <select 
                      value={newMenuCategory} 
                      onChange={e => setNewMenuCategory(e.target.value)} 
                      className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="w-40">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Photo (Optional)</label>
                    <input type="file" accept="image/*" ref={newMenuFileInputRef} onChange={handleNewMenuImageSelect} className="hidden" />
                    {newMenuImage ? (
                      <div className="flex items-center gap-2 h-[38px] px-2 bg-white border border-neutral-300 rounded-lg">
                        <img src={newMenuImage} alt="preview" className="w-6 h-6 rounded object-cover border border-neutral-200" />
                        <span className="text-xs text-green-700 font-medium truncate flex-1">Ready</span>
                        <button type="button" onClick={() => setNewMenuImage('')} className="text-xs text-red-500 hover:text-red-700 font-bold px-1">✕</button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => newMenuFileInputRef.current?.click()} 
                        disabled={compressingNewMenuImage}
                        className="w-full h-[38px] px-3 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-neutral-500" />
                        {compressingNewMenuImage ? 'Compressing...' : 'Add Photo'}
                      </button>
                    )}
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
                        <span>Chef Rec</span>
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

              <input type="file" accept="image/*" ref={menuFileInputRef} onChange={handleMenuImageUpload} className="hidden" />

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
                            <th className="px-4 py-2.5 text-center font-semibold text-neutral-600 w-28">Photo</th>
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
                                            <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Chef Rec
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
                                <td className="px-4 py-3 text-center">
                                  {item.imageUrl ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-neutral-200" />
                                      <button 
                                        onClick={() => triggerMenuUpload(item.id)} 
                                        disabled={uploadingMenuId === item.id}
                                        className="text-xs text-amber-600 hover:text-amber-800 font-medium underline"
                                      >
                                        {uploadingMenuId === item.id ? '...' : 'Change'}
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => triggerMenuUpload(item.id)} 
                                      disabled={uploadingMenuId === item.id} 
                                      className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-amber-600 border border-neutral-300 hover:border-amber-400 bg-white rounded-lg px-2.5 py-1.5 transition-colors"
                                    >
                                      <Upload className="w-3 h-3" />
                                      {uploadingMenuId === item.id ? 'Compressing...' : 'Upload'}
                                    </button>
                                  )}
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
                                    <th className="px-4 py-2.5 text-center font-semibold text-neutral-600 w-28">Photo</th>
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
                                                    <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Chef Rec
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
                                        <td className="px-4 py-3 text-center">
                                          {item.imageUrl ? (
                                            <div className="flex items-center justify-center gap-2">
                                              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-neutral-200" />
                                              <button 
                                                onClick={() => triggerMenuUpload(item.id)} 
                                                disabled={uploadingMenuId === item.id}
                                                className="text-xs text-amber-600 hover:text-amber-800 font-medium underline"
                                              >
                                                {uploadingMenuId === item.id ? '...' : 'Change'}
                                              </button>
                                            </div>
                                          ) : (
                                            <button 
                                              onClick={() => triggerMenuUpload(item.id)} 
                                              disabled={uploadingMenuId === item.id} 
                                              className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-amber-600 border border-neutral-300 hover:border-amber-400 bg-white rounded-lg px-2.5 py-1.5 transition-colors"
                                            >
                                              <Upload className="w-3 h-3" />
                                              {uploadingMenuId === item.id ? 'Compressing...' : 'Upload'}
                                            </button>
                                          )}
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

          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gallery Management</h2>
              </div>
              <p className="text-neutral-500 mb-6">Organize and upload images to the {branch.name} gallery.</p>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Image/Video URL or File</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-50 transition-colors text-sm"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
                <div className="w-48">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Category</label>
                  <select 
                    value={newImageCategory}
                    onChange={(e) => setNewImageCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {galleryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleAddImage}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm h-[38px]"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img) => (
                  <div key={img.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 aspect-square">
                    {img.url.toLowerCase().includes('.mp4') ? (
                      <video src={img.url} className="w-full h-full object-cover" controls muted playsInline />
                    ) : (
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div className="self-end">
                        <button 
                          onClick={() => handleRemoveImage(img.id)}
                          className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="bg-white text-neutral-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full self-start">
                        {img.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Categories & Background Photos</h2>
                  <p className="text-neutral-500 text-sm">Add or edit categories and assign custom background pictures to category cards on the menu.</p>
                </div>
              </div>

              {/* Hidden file inputs for category photo upload */}
              <input 
                type="file" 
                ref={catFileInputRef} 
                accept="image/*" 
                onChange={handleCategoryPhotoUpload} 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={newCatFileInputRef} 
                accept="image/*" 
                onChange={handleNewCatImageSelect} 
                className="hidden" 
              />

              {/* Add New Category Box */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 mb-8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Add New Category</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Category Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Seafood Starters, Signature Platters..." 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Background Picture (Optional)</label>
                    {newCategoryImage ? (
                      <div className="flex items-center gap-3 p-2 bg-white border border-neutral-300 rounded-xl">
                        <img src={newCategoryImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-green-700 font-semibold block">Photo attached</span>
                          <span className="text-[11px] text-neutral-400">Compressed</span>
                        </div>
                        <div className="flex items-center gap-1.5 pr-1">
                          <button 
                            type="button" 
                            onClick={() => newCatFileInputRef.current?.click()} 
                            disabled={compressingNewCatImage}
                            className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            Change
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setNewCategoryImage('')} 
                            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => newCatFileInputRef.current?.click()}
                        disabled={compressingNewCatImage}
                        className="w-full py-2.5 px-3 border border-dashed border-neutral-300 hover:border-amber-500 hover:bg-amber-50/40 rounded-xl text-neutral-600 hover:text-amber-800 flex items-center justify-center gap-2 text-xs font-medium transition-colors bg-white"
                      >
                        <Camera className="w-4 h-4 text-neutral-400" />
                        <span>{compressingNewCatImage ? 'Processing photo...' : 'Choose Category Background Photo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    onClick={handleAddCategory} 
                    disabled={!newCategoryName.trim()}
                    className="bg-neutral-900 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                </div>
              </div>

              {/* Categories List Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50/90 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-5 py-3.5">Background Photo</th>
                      <th className="px-5 py-3.5">Category Name</th>
                      <th className="px-5 py-3.5">Dishes</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {categories.map(c => {
                      const count = menuItems.filter(m => m.category === c.name).length;
                      const hasCustomPhoto = Boolean(c.imageUrl || c.image);
                      const bgPhotoUrl = c.imageUrl || c.image || DEFAULT_CATEGORY_BG;
                      const isUploadingThis = uploadingCatId === c.id;

                      return (
                        <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative group w-16 h-12 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm shrink-0">
                                <img 
                                  src={bgPhotoUrl} 
                                  alt={c.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                                <button
                                  type="button"
                                  onClick={() => triggerCategoryPhotoUpload(c.id)}
                                  disabled={isUploadingThis}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                  title="Change background photo"
                                >
                                  <Camera className="w-4 h-4" />
                                </button>
                              </div>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                hasCustomPhoto ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {isUploadingThis ? 'Uploading...' : hasCustomPhoto ? 'Custom BG' : 'Default BG'}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3 font-bold text-neutral-900">
                            {c.name}
                          </td>

                          <td className="px-5 py-3 text-neutral-500 font-medium">
                            <span className="inline-block px-2.5 py-0.5 bg-neutral-100 rounded-md text-xs font-semibold text-neutral-700">
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick Upload / Change Photo button */}
                              <button
                                type="button"
                                onClick={() => triggerCategoryPhotoUpload(c.id)}
                                disabled={isUploadingThis}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-amber-800 bg-neutral-100 hover:bg-amber-100/80 border border-neutral-200 hover:border-amber-300 transition-colors"
                                title="Upload or change background photo"
                              >
                                <Camera className="w-3.5 h-3.5 text-neutral-500" />
                                <span>{isUploadingThis ? 'Saving...' : hasCustomPhoto ? 'Change Photo' : 'Add Photo'}</span>
                              </button>

                              {/* Remove custom photo if present */}
                              {hasCustomPhoto && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategoryPhoto(c)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
                                  title="Reset to default background photo"
                                >
                                  <span>Reset BG</span>
                                </button>
                              )}

                              {/* Edit Name & Photo */}
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(c)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
                                title="Edit category name or photo"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Edit</span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleRemoveCategory(c.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
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
                        <td colSpan={4} className="px-5 py-10 text-center text-neutral-500">
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
                  <p className="text-xs text-neutral-500">Update item details, dietary flags, or photo</p>
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

                {/* Photo management */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">Dish Photo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={editFileInputRef} 
                    onChange={handleEditImageSelect} 
                    className="hidden" 
                  />
                  {editingItem.imageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                      <img src={editingItem.imageUrl} alt={editingItem.name} className="w-16 h-16 object-cover rounded-lg border border-neutral-300 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-green-700 font-semibold block">Photo attached</span>
                        <p className="text-[11px] text-neutral-400 truncate">Optimized and ready to save</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          disabled={compressingEditImage}
                          className="text-xs px-2.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg text-neutral-700 font-medium transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                          className="text-xs px-2.5 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg text-red-600 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={compressingEditImage}
                      className="w-full py-4 border-2 border-dashed border-neutral-300 hover:border-amber-400 rounded-xl text-neutral-600 hover:text-amber-700 flex flex-col items-center justify-center gap-1.5 transition-colors bg-neutral-50/50"
                    >
                      <Camera className="w-5 h-5 text-neutral-400" />
                      <span className="text-xs font-medium">
                        {compressingEditImage ? 'Compressing image...' : 'Click to upload a dish photo'}
                      </span>
                    </button>
                  )}
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

            {/* Hidden file input for edit category modal */}
            <input 
              type="file" 
              ref={editCatFileInputRef} 
              accept="image/*" 
              onChange={handleEditCatImageSelect} 
              className="hidden" 
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
                  <p className="text-xs text-neutral-500">Update category title and background photo</p>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Category Background Picture
                  </label>
                  
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-950 aspect-[16/9] mb-3 group shadow-inner">
                    <img 
                      src={editingCategory.imageUrl || DEFAULT_CATEGORY_BG} 
                      alt="Category Preview" 
                      className="w-full h-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                      <p className="text-white font-black text-xl drop-shadow-md">
                        {editingCategory.name || 'Category Name'}
                      </p>
                      <p className="text-amber-400 text-xs font-semibold">
                        Preview of category card presentation
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => editCatFileInputRef.current?.click()}
                      disabled={compressingEditCatImage}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{compressingEditCatImage ? 'Processing...' : 'Change Photo'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-500">
                      {editingCategory.imageUrl ? (
                        <span className="text-emerald-700 font-semibold">Custom background photo attached</span>
                      ) : (
                        <span>Currently using default culinary background</span>
                      )}
                    </div>
                    {editingCategory.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingCategory(prev => prev ? { ...prev, imageUrl: '' } : null)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                      >
                        Reset to default photo
                      </button>
                    )}
                  </div>
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
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-400 shrink-0 text-xs">
                            No Photo
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <DietarySymbol isVeg={item.isVeg} size="sm" />
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
