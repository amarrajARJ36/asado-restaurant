const fs = require('fs');

let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', 'utf-8');

if (!code.includes('useBanners')) {
  code = code.replace("import { Search, Flame, Leaf, ArrowRight, X } from 'lucide-react';", "import { Search, Flame, Leaf, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { useBanners } from '../../hooks/useBanners';");
  
  const stateInjection = `  const [alappuzhaCategories, setAlappuzhaCategories] = useState<any[]>([]);
  const { banners } = useBanners('alappuzha');
  const [currentBanner, setCurrentBanner] = useState(0);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
`;

  code = code.replace("  const [alappuzhaCategories, setAlappuzhaCategories] = useState<any[]>([]);", stateInjection);

  const bannerJsx = `
      {banners.length > 0 && (
        <div className={\`w-full py-6 relative overflow-hidden transition-colors duration-500 \${banners[currentBanner]?.bgColor || 'bg-amber-50'}\`}>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex items-center justify-center">
            {banners.length > 1 && (
              <button onClick={prevBanner} className="absolute left-0 md:left-4 p-2 rounded-full hover:bg-black/5 transition-colors z-20">
                <ChevronLeft className="w-5 h-5 text-neutral-600" />
              </button>
            )}
            <div className="w-full px-8 md:px-12 overflow-hidden relative min-h-[60px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={\`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 \${banners[currentBanner]?.tagBg || 'bg-amber-200'} \${banners[currentBanner]?.tagColor || 'text-amber-900'}\`}>
                    {banners[currentBanner]?.tagText}
                  </span>
                  <h3 className={\`text-sm font-bold \${banners[currentBanner]?.textColor || 'text-amber-950'}\`}>{banners[currentBanner]?.title}</h3>
                </motion.div>
              </AnimatePresence>
            </div>
            {banners.length > 1 && (
              <button onClick={nextBanner} className="absolute right-0 md:right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-20">
                <ChevronRight className="w-5 h-5 text-neutral-600" />
              </button>
            )}
          </div>
        </div>
      )}
`;

  code = code.replace('      <div className="max-w-7xl mx-auto px-4 py-8 relative">', bannerJsx + '      <div className="max-w-7xl mx-auto px-4 py-8 relative">');
  
  fs.writeFileSync('src/pages/alappuzha/AlappuzhaMenu.tsx', code);
}
