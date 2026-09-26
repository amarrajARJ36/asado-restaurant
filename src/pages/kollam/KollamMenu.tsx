import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Search, Flame, ArrowRight, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { kollamMenu as staticKollamMenu, kollamCategories as staticKollamCategories } from '../../data';
import { normalizeMenuItems } from '../../lib/categoryUtils';
import DietarySymbol from '../../components/DietarySymbol';
import DishDetailModal from '../../components/DishDetailModal';
import CategoryTile from '../../components/CategoryTile';
import { useBanners } from '../../hooks/useBanners';
import { optimizeImageUrl, preloadCategoryImages } from '../../lib/imageOptimization';
import { getLocalDeletedIds, getLocalPurgedIds } from '../../lib/localMenuStore';

const COMMON_CATEGORY_BG = "https://images.unsplash.com/photo-1544025162-d76694265947?q=75&w=600&auto=format&fit=crop";

export default function KollamMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [kollamMenu, setKollamMenu] = useState<any[]>(() => {
    const all = normalizeMenuItems(staticKollamMenu, staticKollamCategories);
    const localDeleted = getLocalDeletedIds('kollam');
    const localPurged = getLocalPurgedIds('kollam');
    return all.filter((item: any) => !localDeleted.has(item.id) && !localPurged.has(item.id) && item.isDeleted !== true && item.isPurged !== true && item.isAvailable !== false);
  });
  const [kollamCategories, setKollamCategories] = useState<any[]>(staticKollamCategories);
  const { banners } = useBanners('kollam');

  useEffect(() => {
    // Immediately preload initial static category images into browser cache
    preloadCategoryImages(staticKollamCategories);

    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    let latestCategories: any[] = staticKollamCategories;
    const initialDeleted = getLocalDeletedIds('kollam');
    const initialPurged = getLocalPurgedIds('kollam');
    let latestRawItems: any[] = staticKollamMenu.filter(
      (item: any) => !initialDeleted.has(item.id) && !initialPurged.has(item.id) && item.isDeleted !== true && item.isPurged !== true && item.isAvailable !== false
    );

    const unsubCat = onSnapshot(
      query(collection(db, 'categories'), where('branchSlug', '==', 'kollam')),
      (snapshot) => {
        const dbCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dbCatMap = new Map(dbCats.map((cat: any) => [cat.id, cat]));
        const merged = staticKollamCategories.map((staticCat: any) => {
          const dbCat = dbCatMap.get(staticCat.id);
          return dbCat ? { ...staticCat, ...dbCat } : staticCat;
        });
        const existingIds = new Set(staticKollamCategories.map(c => c.id));
        dbCats.forEach((cat: any) => {
          if (!existingIds.has(cat.id)) merged.push(cat);
        });
        const activeCats = merged.filter((cat: any) => cat.isDeleted !== true);
        latestCategories = activeCats;
        setKollamCategories(activeCats);
        preloadCategoryImages(activeCats);
        
        // Re-normalize current dishes with latest categories, ensuring deleted/purged items are filtered
        const currentDeleted = getLocalDeletedIds('kollam');
        const currentPurged = getLocalPurgedIds('kollam');
        const filteredItems = latestRawItems.filter(
          (item: any) => !currentDeleted.has(item.id) && !currentPurged.has(item.id) && item.isDeleted !== true && item.isPurged !== true && item.isAvailable !== false
        );
        setKollamMenu(normalizeMenuItems(filteredItems, activeCats));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );

    const unsubMenu = onSnapshot(
      query(collection(db, 'menuItems'), where('branchSlug', '==', 'kollam')),
      (snapshot) => {
        const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dbItemMap = new Map(dbItems.map((item: any) => [item.id, item]));

        // Deep merge static items with Firestore updates so partial doc updates don't wipe static fields
        const merged = staticKollamMenu.map((staticItem: any) => {
          const dbItem = dbItemMap.get(staticItem.id);
          if (!dbItem) return { ...staticItem, isAvailable: staticItem.isAvailable !== false };
          const resolved: any = {
            ...staticItem,
            ...dbItem,
            isAvailable: dbItem.isAvailable !== undefined ? dbItem.isAvailable : (staticItem.isAvailable !== false)
          };
          if (dbItem.imageUrl === null || dbItem.imageUrl === '') {
            resolved.imageUrl = undefined;
            resolved.image = undefined;
          }
          return resolved;
        });

        // Add any custom items created in Firestore that aren't in static list
        const existingIds = new Set(staticKollamMenu.map((i: any) => i.id));
        dbItems.forEach((item: any) => {
          if (!existingIds.has(item.id)) {
            merged.push({
              ...item,
              isAvailable: item.isAvailable !== false
            });
          }
        });

        // Filter out soft-deleted, permanently purged, and unavailable (sold out) items from customer menu
        const localDeleted = getLocalDeletedIds('kollam');
        const localPurged = getLocalPurgedIds('kollam');
        const activeItems = merged.filter(
          (item: any) => !localDeleted.has(item.id) && !localPurged.has(item.id) && item.isDeleted !== true && item.isPurged !== true && item.isAvailable !== false
        );
        latestRawItems = activeItems;
        setKollamMenu(normalizeMenuItems(activeItems, latestCategories));
      },
      (error) => {
        console.warn('Firestore kollamMenu snapshot warning:', error);
      }
    );

    return () => { unsubMenu(); unsubCat(); };
  }, []);
  
  // To handle the sliding panel state
  const activeCategory = kollamCategories.find(c => c.name === activeCategoryName) || kollamCategories.find(c => c.id === activeCategoryName);
  const isSearchActive = searchQuery.length > 0;

  // If search is active, we might want to show items instead of categories
  const filteredMenu = useMemo(() => {
    if (!isSearchActive) return [];
    return kollamMenu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && item.isAvailable !== false;
    });
  }, [searchQuery, isSearchActive, kollamMenu]);

  const categoryItems = useMemo(() => {
    if (!activeCategoryName) return [];
    return kollamMenu
      .filter(item => item.category === activeCategoryName)
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [activeCategoryName, kollamMenu]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (activeCategoryName) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeCategoryName]);

  const panelVariants = {
    hidden: { 
      opacity: 0, 
      x: isDesktop ? '100%' : '0%', 
      y: isDesktop ? '0%' : '100%' 
    },
    visible: { 
      opacity: 1, 
      x: '0%', 
      y: '0%',
      transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    exit: { 
      opacity: 0, 
      x: isDesktop ? '100%' : '0%', 
      y: isDesktop ? '0%' : '100%',
      transition: { type: "spring", damping: 25, stiffness: 200 }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Menu Header */}
      <div className="bg-white border-b border-neutral-200 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-neutral-900 mb-4">Digital Menu</h1>
          <p className="text-neutral-500 mb-6 max-w-xl mx-auto">Explore our signature dishes, grilled to perfection by the lakeside.</p>

          {/* Promotional Banner (Only visible when active) */}
          {banners.length > 0 && (
            <div className="mb-8 max-w-xl mx-auto">
              <div className={`p-4 sm:p-5 rounded-2xl border text-center shadow-xs transition-all ${
                banners[0]?.bgColor || 'bg-amber-50'
              } ${
                banners[0]?.bgColor === 'bg-amber-50' ? 'border-amber-200 text-amber-950' : 
                banners[0]?.bgColor?.includes('blue') ? 'border-blue-200 text-blue-950' :
                banners[0]?.bgColor?.includes('emerald') ? 'border-emerald-200 text-emerald-950' :
                banners[0]?.bgColor?.includes('neutral') ? 'border-neutral-800 text-white' : 'border-amber-200 text-amber-950'
              }`}>
                <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 ${banners[0]?.tagBg || 'bg-amber-200'} ${banners[0]?.tagColor || 'text-amber-900'}`}>
                  {banners[0]?.tagText || "Today's Special"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  {banners[0]?.title}
                </h3>
                <p className="text-xs sm:text-sm opacity-90">
                  {banners[0]?.subtitle}
                </p>
              </div>
            </div>
          )}
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-neutral-100 border-none focus:ring-2 focus:ring-amber-500 transition-shadow outline-none text-neutral-800"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {isSearchActive ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Search Results</h2>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                Clear Search
              </button>
            </div>
            
            {filteredMenu.length === 0 ? (
              <div className="text-center py-20 text-neutral-500 bg-white rounded-2xl shadow-sm border border-neutral-100">
                <p className="text-lg">No dishes found matching "{searchQuery}".</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenu.map((item, index) => {
                  const hasImg = Boolean(item.imageUrl || item.image);
                  const imgUrl = item.imageUrl || item.image;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id} 
                      className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center group"
                      onClick={() => setSelectedDish(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                          <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        {item.isChefRecommendation && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Flame className="w-3 h-3" /> Chef Recommended
                          </span>
                        )}

                        {item.isAvailable === false && (
                          <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-700 border border-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            Sold Out
                          </span>
                        )}

                        {item.description && (
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <span className="font-bold text-amber-700 text-sm block">
                          {typeof item.price === 'string' && item.price.includes('/') 
                            ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                            : `₹${item.price}`}
                        </span>
                      </div>

                      {hasImg && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
                          <img src={imgUrl} alt={item.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${item.isAvailable === false ? 'grayscale opacity-75' : ''}`} />
                          {item.isAvailable === false && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white bg-black/75 px-1 py-0.5 rounded uppercase tracking-wider">Sold Out</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Our Menu</h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">Explore our handcrafted dishes by selecting a category.</p>
            </div>

            {/* CATEGORY TILES (IMAGE CARDS) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {kollamCategories.map((category, index) => {
                const itemCount = kollamMenu.filter(m => m.category === category.name).length;
                return (
                  <CategoryTile
                    key={category.id}
                    category={category}
                    itemCount={itemCount}
                    index={index}
                    onClick={() => setActiveCategoryName(category.name)}
                    accentColor="amber"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sliding Panel */}
      <AnimatePresence>
        {activeCategoryName && activeCategory && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setActiveCategoryName(null)}
            />
            
            {/* Panel */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] bg-white z-50 rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-screen"
            >
              {/* Mobile handle */}
              <div className="w-full flex justify-center pt-3 pb-1 md:hidden cursor-pointer" onClick={() => setActiveCategoryName(null)}>
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Panel Header with common background */}
              <div className="relative px-6 py-5 md:py-7 md:px-8 border-b border-neutral-200 flex items-center justify-between sticky top-0 overflow-hidden z-10 bg-neutral-900 text-white">
                <div className="absolute inset-0 z-0 bg-neutral-900">
                  <img 
                    src={optimizeImageUrl(activeCategory.imageUrl || activeCategory.image || COMMON_CATEGORY_BG, 600, 75)} 
                    alt={activeCategory.name} 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover opacity-35" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-black/50" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">{activeCategory.name}</h2>
                  <p className="text-xs sm:text-sm text-amber-300/90 font-medium drop-shadow-sm">{categoryItems.length} Dishes Available</p>
                </div>
                <button 
                  onClick={() => setActiveCategoryName(null)}
                  className="relative z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                {categoryItems.map((item, index) => {
                  const hasImg = Boolean(item.imageUrl || item.image);
                  const imgUrl = item.imageUrl || item.image;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id} 
                      className="bg-neutral-50 hover:bg-white rounded-2xl p-4 border border-neutral-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group"
                      onClick={() => setSelectedDish(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                          <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        {item.isChefRecommendation && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Flame className="w-3 h-3" /> Chef Recommended
                          </span>
                        )}

                        {item.isAvailable === false && (
                          <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-700 border border-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            Sold Out
                          </span>
                        )}

                        {item.description && (
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <span className="font-bold text-amber-700 text-sm block">
                          {typeof item.price === 'string' && item.price.includes('/') 
                            ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                            : `₹${item.price}`}
                        </span>
                      </div>

                      {hasImg && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
                          <img src={imgUrl} alt={item.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${item.isAvailable === false ? 'grayscale opacity-75' : ''}`} />
                          {item.isAvailable === false && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white bg-black/75 px-1 py-0.5 rounded uppercase tracking-wider">Sold Out</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                
                {categoryItems.length === 0 && (
                  <div className="text-center py-12 text-neutral-400">
                    <p>No items in this category yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dish Detail Popup Modal */}
      <DishDetailModal
        dish={selectedDish ? (kollamMenu.find(d => d.id === selectedDish.id) || selectedDish) : null}
        onClose={() => setSelectedDish(null)}
        theme="amber"
      />
    </div>
  );
}
