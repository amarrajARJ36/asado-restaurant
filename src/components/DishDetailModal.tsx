import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Utensils } from 'lucide-react';
import DietarySymbol from './DietarySymbol';

export interface DishItem {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  imageUrl?: string;
  image?: string;
  isVeg?: boolean;
  isChefRecommendation?: boolean;
  category?: string;
}

interface DishDetailModalProps {
  dish: DishItem | null;
  onClose: () => void;
  theme?: 'amber' | 'teal';
}

export default function DishDetailModal({
  dish,
  onClose,
  theme = 'amber',
}: DishDetailModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!dish) return null;

  const hasImage = Boolean(dish.imageUrl || dish.image);
  const displayImage = dish.imageUrl || dish.image;
  const hasDescription = Boolean(dish.description && dish.description.trim().length > 0);

  const priceColor = theme === 'amber' ? 'text-amber-600' : 'text-teal-600';
  const chefBadgeBg = theme === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-teal-100 text-teal-800 border-teal-200';

  return (
    <AnimatePresence>
      <motion.div
        key="dish-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          key="dish-modal-container"
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full relative my-auto border border-neutral-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dish preview"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Dish Image or Header Hero */}
          {hasImage ? (
            <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
              <img
                src={displayImage}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end gap-3 text-white">
                <div className="flex items-center gap-2">
                  <DietarySymbol isVeg={dish.isVeg} size="md" />
                  <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md">
                  {typeof dish.price === 'string' && dish.price.includes('/')
                    ? dish.price.split('/').map((p) => `₹${p}`).join('/')
                    : `₹${dish.price}`}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-6 sm:p-7 text-white relative">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                  <DietarySymbol isVeg={dish.isVeg} size="md" />
                  <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                    {dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  </span>
                </div>
                <div className={`text-xl sm:text-2xl font-black ${priceColor === 'text-amber-600' ? 'text-amber-400' : 'text-teal-300'}`}>
                  {typeof dish.price === 'string' && dish.price.includes('/')
                    ? dish.price.split('/').map((p) => `₹${p}`).join('/')
                    : `₹${dish.price}`}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mt-4 tracking-tight pr-10">{dish.name}</h2>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-5 bg-white">
            {/* If hasImage, show title & tags in body */}
            {hasImage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {dish.isChefRecommendation && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${chefBadgeBg}`}>
                      <Flame className="w-3.5 h-3.5" /> Chef's Recommendation
                    </span>
                  )}
                  {dish.category && (
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                      {dish.category}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-snug">
                  {dish.name}
                </h2>
              </div>
            )}

            {/* If no image, show chef tag in body if needed */}
            {!hasImage && dish.isChefRecommendation && (
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${chefBadgeBg}`}>
                  <Flame className="w-3.5 h-3.5" /> Chef's Recommendation
                </span>
              </div>
            )}

            {/* Description (if added) */}
            {hasDescription ? (
              <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-100">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Description</p>
                <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                  {dish.description}
                </p>
              </div>
            ) : (
              <div className="bg-neutral-50/50 rounded-2xl p-4 text-center border border-dashed border-neutral-200">
                <p className="text-xs text-neutral-600">Freshly prepared with authentic ingredients upon order.</p>
              </div>
            )}

            {/* Bottom info strip */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-xs text-neutral-600">
              <span className="flex items-center gap-1.5">
                <DietarySymbol isVeg={dish.isVeg} size="sm" />
                <span className="font-medium text-neutral-700">{dish.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}</span>
              </span>
              <span className="font-semibold text-neutral-700">Taxes Included</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
