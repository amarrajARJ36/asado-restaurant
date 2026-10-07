import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { optimizeImageUrl } from '../lib/imageOptimization';

const DEFAULT_CATEGORY_BG = "https://images.unsplash.com/photo-1544025162-d76694265947?q=75&w=600&auto=format&fit=crop";

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

  const rawImg = category.imageUrl || category.image || DEFAULT_CATEGORY_BG;
  const optimizedImg = optimizeImageUrl(rawImg, 500, 75);

  const isAmber = accentColor === 'amber';
  const hoverBorderClass = isAmber ? 'hover:border-amber-400' : 'hover:border-teal-400';
  const hoverTextClass = isAmber ? 'group-hover:text-amber-300' : 'group-hover:text-teal-300';
  const arrowBgClass = isAmber ? 'group-hover:bg-amber-500' : 'group-hover:bg-teal-500';
  const topBarClass = isAmber 
    ? 'via-amber-400' 
    : 'via-teal-400';

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
      className={`bg-neutral-900 rounded-2xl shadow-md border border-neutral-800/80 ${hoverBorderClass} p-4 sm:p-5 flex flex-col justify-end text-left transition-all duration-300 group aspect-[4/3] sm:aspect-square relative overflow-hidden hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
    >
      {/* Category culinary background image & placeholder */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 overflow-hidden">
        {/* Placeholder shimmer / subtle food pattern until loaded */}
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

      {/* Top accent glow line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${topBarClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10`} />
      
      {/* Category Name & Details displayed over image */}
      <div className="relative z-10 w-full flex flex-col justify-end">
        <h3 className={`font-extrabold text-base sm:text-lg md:text-xl text-white mb-1 leading-snug ${hoverTextClass} transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
          {category.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-neutral-300 text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {itemCount} {itemCount === 1 ? 'Dish' : 'Dishes'}
          </span>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 ${arrowBgClass} backdrop-blur-md flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-sm text-white`}>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
