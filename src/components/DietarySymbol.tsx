import React from 'react';

interface DietarySymbolProps {
  isVeg?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function DietarySymbol({
  isVeg = false,
  size = 'md',
  showLabel = false,
  className = '',
}: DietarySymbolProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 p-[2px]',
    md: 'w-4 h-4 p-[2.5px]',
    lg: 'w-5 h-5 p-[3px]',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  if (isVeg) {
    return (
      <span className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
        <span
          className={`inline-flex items-center justify-center border-[1.5px] border-emerald-600 rounded-[3px] bg-white shrink-0 ${sizeClasses[size]}`}
          title="Vegetarian"
          aria-label="Vegetarian"
        >
          <span className={`rounded-full bg-emerald-600 shrink-0 ${dotSizes[size]}`} />
        </span>
        {showLabel && (
          <span className="text-xs font-semibold text-emerald-700 tracking-wide">Veg</span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      <span
        className={`inline-flex items-center justify-center border-[1.5px] border-rose-700 rounded-[3px] bg-white shrink-0 ${sizeClasses[size]}`}
        title="Non-Vegetarian"
        aria-label="Non-Vegetarian"
      >
        <span className={`rounded-full bg-rose-700 shrink-0 ${dotSizes[size]}`} />
      </span>
      {showLabel && (
        <span className="text-xs font-semibold text-rose-700 tracking-wide">Non-Veg</span>
      )}
    </span>
  );
}
