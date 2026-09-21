import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Search, Flame, ArrowRight, X, ChevronLeft, ChevronRight, List, LayoutGrid, Filter } from 'lucide-react';
import { useBanners } from '../../hooks/useBanners';
import { motion, AnimatePresence } from 'motion/react';
import { alappuzhaMenu as staticAlappuzhaMenu, alappuzhaCategories as staticAlappuzhaCategories } from '../../data';
import DietarySymbol from '../../components/DietarySymbol';
import DishDetailModal from '../../components/DishDetailModal';

const COMMON_CATEGORY_BG = "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";

export default function AlappuzhaMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [alappuzhaMenu, setAlappuzhaMenu] = useState<any[]>(staticAlappuzhaMenu);
  const [alappuzhaCategories, setAlappuzhaCategories] = useState<any[]>(staticAlappuzhaCategories);
  const { banners } = useBanners('alappuzha');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const unsubMenu = onSnapshot(query(collection(db, 'menuItems'), where('branchSlug', '==', 'alappuzha')), (snapshot) => {
      if (!snapshot.empty) {
        const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlappuzhaMenu(prev => {
          const dbItemMap = new Map(dbItems.map((item: any) => [item.id, item]));
          const merged = staticAlappuzhaMenu.map(staticItem => dbItemMap.get(staticItem.id) || staticItem);
          const existingIds = new Set(staticAlappuzhaMenu.map(i => i.id));
          dbItems.forEach((item: any) => {
            if (!existingIds.has(item.id)) merged.push(item);
          });
          return merged;
        });
      }
    });
    const unsubCat = onSnapshot(query(collection(db, 'categories'), where('branchSlug', '==', 'alappuzha')), (snapshot) => {
      if (!snapshot.empty) {
        const dbCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlappuzhaCategories(() => {
          const dbCatMap = new Map(dbCats.map((cat: any) => [cat.id, cat]));
          const merged = staticAlappuzhaCategories.map(staticCat => dbCatMap.get(staticCat.id) || staticCat);
          const existingIds = new Set(staticAlappuzhaCategories.map(c => c.id));
          dbCats.forEach((cat: any) => {
            if (!existingIds.has(cat.id)) merged.push(cat);
          });
          return merged;
        });
      }
    });
    return () => { unsubMenu(); unsubCat(); };
  }, []);
  
  const activeCategory = alappuzhaCategories.find(c => c.name === activeCategoryName) || alappuzhaCategories.find(c => c.id === activeCategoryName);
  const isSearchActive = searchQuery.length > 0;

  const filteredMenu = useMemo(() => {
    if (!isSearchActive) return [];
    return alappuzhaMenu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, isSearchActive]);

  const categoryItems = useMemo(() => {
    if (!activeCategoryName) return [];
    return alappuzhaMenu
      .filter(item => item.category === activeCategoryName)
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999;
        const orderB = typeof b.order === 'number' ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [activeCategoryName, alappuzhaMenu]);

  // All menu items organized category-wise for customer list view
  const categoryWiseMenu = useMemo(() => {
    let catList: string[] = [];
    if (selectedCategoryTab !== 'All') {
      catList = [selectedCategoryTab];
    } else {
      const knownNames = new Set(alappuzhaCategories.map(c => c.name));
      catList = alappuzhaCategories.map(c => c.name);
      alappuzhaMenu.forEach(item => {
        if (item.category && !knownNames.has(item.category) && !catList.includes(item.category)) {
          catList.push(item.category);
        }
      });
    }

    return catList.map(catName => {
      const items = alappuzhaMenu
        .filter(m => m.category === catName)
        .sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 9999;
          const orderB = typeof b.order === 'number' ? b.order : 9999;
          if (orderA !== orderB) return orderA - orderB;
          return (a.name || '').localeCompare(b.name || '');
        });
      const catObj = alappuzhaCategories.find(c => c.name === catName);
      return {
        categoryName: catName,
        categoryObj: catObj,
        items
      };
    }).filter(group => group.items.length > 0);
  }, [alappuzhaCategories, alappuzhaMenu, selectedCategoryTab]);

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
      <div className="bg-white border-b border-neutral-200 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-neutral-900 mb-4">Digital Menu</h1>
          <p className="text-neutral-500 mb-8 max-w-xl mx-auto">Savor authentic backwater cuisine and premium family dining.</p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-neutral-100 border-none focus:ring-2 focus:ring-teal-500 transition-shadow outline-none text-neutral-800"
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
                      className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center group"
                      onClick={() => setSelectedDish(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                          <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        {item.isChefRecommendation && (
                          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Flame className="w-3 h-3" /> Chef Rec
                          </span>
                        )}

                        {item.description && (
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <span className="font-bold text-teal-700 text-sm block">
                          {typeof item.price === 'string' && item.price.includes('/') 
                            ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                            : `₹${item.price}`}
                        </span>
                      </div>

                      {hasImg && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
                          <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
            {/* View Switcher & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Our Menu</h2>
                <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">Explore our handcrafted dishes arranged category by category.</p>
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-200/80 p-1 rounded-xl self-start sm:self-auto shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5 text-teal-600" />
                  <span>Category List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-teal-600" />
                  <span>Category Tiles</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips / Jump Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryTab === 'All'
                    ? 'bg-teal-600 text-white shadow-xs scale-105'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                All Categories ({alappuzhaMenu.length})
              </button>
              {alappuzhaCategories.map(c => {
                const count = alappuzhaMenu.filter(m => m.category === c.name).length;
                const isSelected = selectedCategoryTab === c.name;
                return (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryTab(c.name);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs scale-105'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>

            {viewMode === 'list' ? (
              /* CATEGORY-WISE LIST OF DISH ITEMS */
              <div className="space-y-10">
                {categoryWiseMenu.map((group) => (
                  <div key={group.categoryName} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b-2 border-teal-500/30 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {group.items.length}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                            {group.categoryName}
                          </h3>
                          <span className="text-xs text-neutral-500 font-medium">
                            {group.items.length} {group.items.length === 1 ? 'Dish' : 'Dishes'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dish Cards in this Category */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {group.items.map((item, index) => {
                        const hasImg = Boolean(item.imageUrl || item.image);
                        const imgUrl = item.imageUrl || item.image;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            key={item.id} 
                            className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-4 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center group relative overflow-hidden"
                            onClick={() => setSelectedDish(item)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                                <h4 className="font-bold text-neutral-900 leading-snug group-hover:text-teal-700 transition-colors">
                                  {item.name}
                                </h4>
                              </div>

                              {item.isChefRecommendation && (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                  <Flame className="w-3 h-3" /> Chef Rec
                                </span>
                              )}

                              {item.description && (
                                <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-2">
                                  {item.description}
                                </p>
                              )}

                              <span className="font-bold text-teal-700 text-sm block">
                                {typeof item.price === 'string' && item.price.includes('/') 
                                  ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                                  : `₹${item.price}`}
                              </span>
                            </div>

                            {hasImg && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
                                <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {categoryWiseMenu.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 text-neutral-500">
                    <p className="text-base font-semibold text-neutral-800">No dishes found</p>
                    <p className="text-xs text-neutral-400 mt-1">Try selecting another category or clear your search.</p>
                  </div>
                )}
              </div>
            ) : (
              /* CATEGORY TILES (IMAGE CARDS) */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {alappuzhaCategories.map((category, index) => {
                  const itemCount = alappuzhaMenu.filter(m => m.category === category.name).length;
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setActiveCategoryName(category.name)}
                      className="bg-neutral-950 rounded-2xl shadow-md border border-neutral-800/80 hover:border-teal-400 p-5 flex flex-col justify-end text-left transition-all duration-300 group aspect-[4/3] sm:aspect-square relative overflow-hidden hover:shadow-xl hover:scale-[1.02]"
                    >
                      {/* Category culinary background image */}
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={category.imageUrl || category.image || COMMON_CATEGORY_BG} 
                          alt={category.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-75" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 group-hover:from-black/90 group-hover:via-black/50 transition-colors" />
                      </div>

                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      
                      {/* Category Name & Details displayed over image */}
                      <div className="relative z-10 w-full flex flex-col justify-end">
                        <h3 className="font-extrabold text-base sm:text-lg md:text-xl text-white mb-1.5 leading-snug group-hover:text-teal-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {category.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-neutral-300 text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {itemCount} {itemCount === 1 ? 'Dish' : 'Dishes'}
                          </span>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 group-hover:bg-teal-500 backdrop-blur-md flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-sm text-white">
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeCategoryName && activeCategory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setActiveCategoryName(null)}
            />
            
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] bg-white z-50 rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-screen"
            >
              <div className="w-full flex justify-center pt-3 pb-1 md:hidden cursor-pointer" onClick={() => setActiveCategoryName(null)}>
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Panel Header with common background */}
              <div className="relative px-6 py-5 md:py-7 md:px-8 border-b border-neutral-200 flex items-center justify-between sticky top-0 overflow-hidden z-10 bg-neutral-900 text-white">
                <div className="absolute inset-0 z-0">
                  <img 
                    src={activeCategory.imageUrl || activeCategory.image || COMMON_CATEGORY_BG} 
                    alt={activeCategory.name} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-35" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-black/50" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">{activeCategory.name}</h2>
                  <p className="text-xs sm:text-sm text-teal-300/90 font-medium drop-shadow-sm">{categoryItems.length} Dishes Available</p>
                </div>
                <button 
                  onClick={() => setActiveCategoryName(null)}
                  className="relative z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                      className="bg-neutral-50 hover:bg-white rounded-2xl p-4 border border-neutral-100 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group"
                      onClick={() => setSelectedDish(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <DietarySymbol isVeg={item.isVeg} size="sm" className="mt-0.5" />
                          <h3 className="font-bold text-neutral-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        {item.isChefRecommendation && (
                          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Flame className="w-3 h-3" /> Chef Rec
                          </span>
                        )}

                        {item.description && (
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <span className="font-bold text-teal-700 text-sm block">
                          {typeof item.price === 'string' && item.price.includes('/') 
                            ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                            : `₹${item.price}`}
                        </span>
                      </div>

                      {hasImg && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative">
                          <img src={imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        theme="teal"
      />
    </div>
  );
}
