import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

export default function KollamGallery() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [kollamGallery, setKollamGallery] = useState<any[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, 'galleryImages'), where('branchSlug', '==', 'kollam'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setKollamGallery(images.sort((a: any, b: any) => b.createdAt - a.createdAt));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'galleryImages');
    });

    return () => unsubscribe();
  }, []);

  const filters = [
    { id: 'all', name: 'All Photos' },
    { id: 'Food', name: 'Food' },
    { id: 'Ambience', name: 'Ambience' },
    { id: 'Lake View', name: 'Lake View' },
    { id: 'Boating', name: 'Boating' },
    { id: 'Events', name: 'Events' },
    { id: 'Decorations', name: 'Decorations' },
  ];

  const filteredGallery = activeFilter === 'all' 
    ? kollamGallery 
    : kollamGallery.filter(img => img.category === activeFilter);

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
                "px-5 py-2 rounded-full text-sm font-medium transition-colors border",
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
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100"
              >
                {img.url.includes('.mp4') || img.url.includes('video') ? (
                  <video src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" autoPlay muted loop playsInline />
                ) : (
                  <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-white font-medium uppercase tracking-wider text-xs border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">
                      {img.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {filteredGallery.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            <p>No images found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
