const fs = require('fs');
let code = fs.readFileSync('src/pages/kollam/KollamMenu.tsx', 'utf-8');

// 1. Add Camera icon import
code = code.replace("import { Search, Flame, Leaf, ArrowRight, X } from 'lucide-react';", "import { Search, Flame, Leaf, ArrowRight, X, Camera } from 'lucide-react';");

// 2. Add selectedDish state
const stateSearch = `const [searchQuery, setSearchQuery] = useState('');`;
const stateReplace = `const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<any | null>(null);`;
code = code.replace(stateSearch, stateReplace);

// 3. Add onClick and camera icon to filteredMenu items
const searchItemSearch = `className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex flex-col"
                  >`;
const searchItemReplace = `className={\`bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex flex-col \${item.imageUrl ? 'cursor-pointer hover:border-amber-200 transition-colors' : ''}\`}
                    onClick={() => item.imageUrl && setSelectedDish(item)}
                  >`;
code = code.replace(searchItemSearch, searchItemReplace);

const nameSearch1 = `{item.name}`;
const nameReplace1 = `{item.name}
                        {item.imageUrl && (
                          <span className="inline-block ml-2 align-middle" title="View Image">
                            <Camera className="w-4 h-4 text-amber-600" />
                          </span>
                        )}`;
code = code.replace(nameSearch1, nameReplace1); // Replaces the first match (filteredMenu)
code = code.replace(nameSearch1, nameReplace1); // Replaces the second match (categoryItems)

// 4. Add onClick to categoryItems items
const catItemSearch = `className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex gap-4"
                  >`;
const catItemReplace = `className={\`bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex gap-4 \${item.imageUrl ? 'cursor-pointer hover:border-amber-200 transition-colors bg-white shadow-sm' : ''}\`}
                    onClick={() => item.imageUrl && setSelectedDish(item)}
                  >`;
code = code.replace(catItemSearch, catItemReplace);

// 5. Add the modal at the bottom
const modalSearch = `    </div>
  );
}`;
const modalReplace = `      <AnimatePresence>
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
                        ? selectedDish.price.split('/').map((p: string) => \`₹\${p}\`).join('/') 
                        : \`₹\${selectedDish.price}\`}
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
}`;
code = code.replace(modalSearch, modalReplace);

fs.writeFileSync('src/pages/kollam/KollamMenu.tsx', code);
