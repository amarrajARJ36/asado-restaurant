import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Utensils } from 'lucide-react';
import { optimizeImageUrl } from '../lib/imageOptimization';

interface CategoryTileProps {
  key?: React.Key;
  category: {
    id: string;
    name: string;
    imageUrl?: string;
    image?: string;
  };
  itemCount: number;
  index: number;
  onClick: () => void;
  accentColor?: 'amber' | 'teal';
}

export default function CategoryTile({
  category,
  itemCount,
  index,
  onClick,
  accentColor = 'amber'
}: CategoryTileProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const rawImg = (category.imageUrl || category.image || "").trim();
  const hasImage = Boolean(rawImg);
  const optimizedImg = hasImage ? optimizeImageUrl(rawImg, 500, 75) : "";

  const isAmber = accentColor === 'amber';
  const hoverBorderClass = isAmber ? 'hover:border-amber-400/80 hover:bg-neutral-850' : 'hover:border-teal-400/80 hover:bg-neutral-850';
  const hoverTextClass = isAmber ? 'group-hover:text-amber-400' : 'group-hover:text-teal-400';
  const arrowBgClass = isAmber ? 'group-hover:bg-amber-500 group-hover:text-neutral-950' : 'group-hover:bg-teal-500 group-hover:text-neutral-950';
  const topBarClass = isAmber 
    ? 'via-amber-400' 
    : 'via-teal-400';
  const iconBgClass = isAmber ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.15, 
        delay: Math.min(index * 0.02, 0.15),
        ease: 'easeOut'
      }}
      onClick={onClick}
      className={`bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 ${hoverBorderClass} p-4 sm:p-5 flex flex-col justify-between text-left transition-all duration-300 group aspect-[4/3] sm:aspect-square relative overflow-hidden hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
    >
      {/* Background: either uploaded photo OR clean dark culinary pattern */}
      {hasImage ? (
        <div className="absolute inset-0 z-0 bg-neutral-900 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-neutral-800 transition-opacity duration-300 ${
              isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse'
            }`} 
          />

          <img 
            src={optimizedImg} 
            alt={category.name} 
            loading="eager"
            // @ts-ignore fetchpriority is valid in modern browsers
            fetchpriority={index < 8 ? "high" : "auto"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
              isLoaded ? 'opacity-60 group-hover:opacity-75 scale-100' : 'opacity-0 scale-105'
            }`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 group-hover:from-black/90 group-hover:via-black/50 transition-colors" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 overflow-hidden">
          {/* Subtle ambient glow in top-right */}
          <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${isAmber ? 'bg-amber-500' : 'bg-teal-500'}`} />
          {/* Subtle noise/grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        </div>
      )}

      {/* Top accent glow line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${topBarClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10`} />

      {/* Top section: subtle culinary icon if no image uploaded */}
      <div className="relative z-10 w-full flex items-start justify-between">
        {!hasImage && (
          <div className={`w-8 h-8 rounded-xl border ${iconBgClass} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Utensils className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {/* Category Name & Details */}
      <div className="relative z-10 w-full flex flex-col justify-end mt-auto">
        <h3 className={`font-bold text-base sm:text-lg text-white mb-1 leading-snug ${hoverTextClass} transition-colors drop-shadow-xs`}>
          {category.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-neutral-400 text-xs font-medium">
            {itemCount} {itemCount === 1 ? 'Dish' : 'Dishes'}
          </span>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 ${arrowBgClass} flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-xs text-white`}>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
