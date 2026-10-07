import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { kollamGallery as staticKollamGallery } from '../../data';
import { getResolvedGalleryImages, initBranchSync } from '../../lib/localMenuStore';
import { syncService } from '../../lib/syncService';

export default function KollamGallery() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryList, setGalleryList] = useState<any[]>(() => {
    return getResolvedGalleryImages('kollam', staticKollamGallery);
  });
  
  useEffect(() => {
    let latestDbImages: any[] = [];

    const refreshGallery = () => {
      const resolved = getResolvedGalleryImages('kollam', staticKollamGallery, latestDbImages);
      setGalleryList(resolved);
    };

    // Central Multi-device sync
    initBranchSync('kollam', refreshGallery);
    const unsubSync = syncService.subscribe((payload) => {
      if (payload.branchSlug === 'kollam' || payload.branchSlug === 'all') {
        initBranchSync('kollam', refreshGallery);
      }
    });

    const handleCustomSyncEvent = (e: any) => {
      if (e.detail?.branchSlug === 'kollam' || e.detail?.branchSlug === 'all') {
        refreshGallery();
      }
    };
    window.addEventListener('asado-sync-update', handleCustomSyncEvent);

    const q = query(collection(db, 'galleryImages'), where('branchSlug', '==', 'kollam'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      latestDbImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshGallery();
    }, (error) => {
      console.warn('Firestore gallery snapshot warning:', error);
      // Fallback still keeps resolved static + local gallery!
      refreshGallery();
    });

    return () => {
      unsubscribe();
      unsubSync();
      window.removeEventListener('asado-sync-update', handleCustomSyncEvent);
    };
  }, []);

  const filters = [
    { id: 'all', name: 'All Photos' },
    { id: 'Ambience', name: 'Ambience' },
    { id: 'Lake View', name: 'Lake View' },
    { id: 'Boating', name: 'Boating' },
    { id: 'Decoration', name: 'Decoration' },
    { id: 'Food', name: 'Food & Dining' },
  ];

  const filteredGallery = activeFilter === 'all' 
    ? galleryList 
    : galleryList.filter(img => {
        if (activeFilter === 'Decoration') {
          return img.category === 'Decoration' || img.category === 'Decorations';
        }
        if (activeFilter === 'Food') {
          return img.category === 'Food' || img.category === 'Dining' || img.category === 'Menu';
        }
        return img.category === activeFilter;
      });

  return (
    <div className="min-h-screen bg-white pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Gallery</h1>
          <p className="text-neutral-500 max-w-xl mx-auto text-lg">A visual journey through Asado Kollam.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-colors border cursor-pointer",
                activeFilter === filter.id 
                  ? "bg-amber-600 border-amber-600 text-white" 
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-amber-600 hover:text-amber-600"
              )}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredGallery.map(img => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-md"
              >
                {img.url && (img.url.includes('.mp4') || img.url.includes('video')) ? (
                  <video src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" autoPlay muted loop playsInline />
                ) : (
                  <img src={img.url} alt={img.category || "Gallery Photo"} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-white font-medium uppercase tracking-wider text-xs border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">
                      {img.category || 'Asado'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {filteredGallery.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            <p>No images found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
