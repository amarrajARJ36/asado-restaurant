import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Search, Flame, Leaf, ArrowRight, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KollamMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [kollamMenu, setKollamMenu] = useState<any[]>([]);
  const [kollamCategories, setKollamCategories] = useState<any[]>([]);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    const unsubMenu = onSnapshot(query(collection(db, 'menuItems'), where('branchSlug', '==', 'kollam')), (snapshot) => {
      setKollamMenu(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCat = onSnapshot(query(collection(db, 'categories'), where('branchSlug', '==', 'kollam')), (snapshot) => {
      setKollamCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
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
      return matchesSearch;
    });
  }, [searchQuery, isSearchActive]);

  const categoryItems = useMemo(() => {
    if (!activeCategoryName) return [];
    return kollamMenu.filter(item => item.category === activeCategoryName);
  }, [activeCategoryName]);

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
          <p className="text-neutral-500 mb-8 max-w-xl mx-auto">Explore our signature dishes, grilled to perfection by the lakeside.</p>
          
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
                {filteredMenu.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id} 
                    className={`bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex flex-col ${item.imageUrl ? 'cursor-pointer hover:border-amber-200 transition-colors' : ''}`}
                    onClick={() => item.imageUrl && setSelectedDish(item)}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-neutral-900 leading-tight">
                        {item.name}
                        {item.imageUrl && (
                          <span className="inline-flex ml-2 items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full align-middle">
                            <Camera className="w-2.5 h-2.5" /> Photo
                          </span>
                        )}
                        {item.isVeg && (
                          <span className="inline-block ml-2 align-middle" title="Vegetarian">
                            <Leaf className="w-3 h-3 text-green-600" />
                          </span>
                        )}
                        {item.isChefRecommendation && (
                          <span className="inline-flex ml-2 align-middle items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Flame className="w-3 h-3" /> Chef Rec
                          </span>
                        )}
                      </h3>
                      <span className="font-bold text-amber-700 shrink-0">
                        {typeof item.price === 'string' && item.price.includes('/') 
                          ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                          : `₹${item.price}`}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-neutral-500 text-xs leading-relaxed flex-1">
                        {item.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {kollamCategories.map((category, index) => {
                const itemCount = kollamMenu.filter(m => m.category === category.name).length;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveCategoryName(category.name)}
                    className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 hover:border-amber-400 p-6 flex flex-col items-start text-left transition-colors group aspect-square justify-center relative overflow-hidden"
                  >
                    {category.image && (
                      <div className="absolute inset-0 z-0">
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    
                    <div className="relative z-10 w-full h-full flex flex-col">
                      <h3 className="font-bold text-lg text-white mb-2 leading-tight group-hover:text-amber-300 transition-colors drop-shadow-md">
                        {category.name}
                      </h3>
                      <p className="text-neutral-300 text-sm font-medium drop-shadow-md">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </p>
                      
                      <div className="mt-auto w-full flex justify-end">
                        <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-amber-500/80 backdrop-blur-sm flex items-center justify-center transition-colors">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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
                <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
              </div>

              {/* Panel Header */}
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10 md:pt-8 md:px-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{activeCategory.name}</h2>
                  <p className="text-sm text-neutral-500">{categoryItems.length} Items</p>
                </div>
                <button 
                  onClick={() => setActiveCategoryName(null)}
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                {categoryItems.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id} 
                    className={`bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex gap-4 items-center ${item.imageUrl ? 'cursor-pointer hover:border-amber-300 hover:shadow-md transition-all bg-white' : ''}`}
                    onClick={() => item.imageUrl && setSelectedDish(item)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                          {item.name}
                          {item.isVeg && (
                            <span className="inline-block align-middle" title="Vegetarian">
                              <Leaf className="w-3.5 h-3.5 text-green-600" />
                            </span>
                          )}
                          {item.imageUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              <Camera className="w-2.5 h-2.5" /> Tap for photo
                            </span>
                          )}
                        </h3>
                        <span className="font-bold text-amber-700 shrink-0">
                          {typeof item.price === 'string' && item.price.includes('/') 
                            ? item.price.split('/').map((p: string) => `₹${p}`).join('/') 
                            : `₹${item.price}`}
                        </span>
                      </div>
                      
                      {item.isChefRecommendation && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                          <Flame className="w-3 h-3" /> Chef Rec
                        </span>
                      )}
                      
                      {item.description && (
                        <p className="text-neutral-500 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.imageUrl && (
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm relative group">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
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

      <AnimatePresence>
        {selectedDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDish(null)}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 z-10 backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="aspect-[4/3] w-full bg-neutral-100 relative">
                <img src={selectedDish.imageUrl} alt={selectedDish.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex justify-between items-end gap-4">
                    <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{selectedDish.name}</h3>
                    <span className="font-bold text-amber-400 text-xl drop-shadow-md">
                      {typeof selectedDish.price === 'string' && selectedDish.price.includes('/') 
                        ? selectedDish.price.split('/').map((p: string) => `₹${p}`).join('/') 
                        : `₹${selectedDish.price}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDish.isVeg && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      <Leaf className="w-3 h-3" /> Vegetarian
                    </span>
                  )}
                  {selectedDish.isChefRecommendation && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      <Flame className="w-3 h-3" /> Chef's Special
                    </span>
                  )}
                </div>
                {selectedDish.description && (
                  <p className="text-neutral-600 leading-relaxed">{selectedDish.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
