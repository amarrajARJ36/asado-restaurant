const fs = require('fs');
let content = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf8');

// Replace background colors
content = content.replace(/bg-\[\#0F1115\]/g, 'bg-slate-50');
content = content.replace(/bg-\[\#1A1D22\]/g, 'bg-white');
content = content.replace(/from-\[\#0F1115\]/g, 'from-slate-50');
content = content.replace(/from-\[\#D4AF37\]/g, 'from-teal-600');
content = content.replace(/via-black\/40/g, 'via-white/40');
content = content.replace(/to-transparent/g, 'to-transparent'); // no change
content = content.replace(/bg-black\/50/g, 'bg-white/80');

// Replace text colors
content = content.replace(/text-\[\#F8F6F2\]/g, 'text-slate-900');
content = content.replace(/text-\[\#B8B8B8\]/g, 'text-slate-600');
content = content.replace(/text-\[\#D4AF37\]/g, 'text-teal-700');
content = content.replace(/text-\[\#E8CBA8\]/g, 'text-teal-900');

// Replace border colors
content = content.replace(/border-\[\#D4AF37\]/g, 'border-teal-700');

// Replace background colors for accents
content = content.replace(/bg-\[\#D4AF37\]/g, 'bg-teal-700');
content = content.replace(/hover:bg-\[\#D4AF37\]/g, 'hover:bg-teal-700');
content = content.replace(/hover:bg-\[\#E8CBA8\]/g, 'hover:bg-teal-600');
content = content.replace(/hover:text-\[\#0F1115\]/g, 'hover:text-white');
content = content.replace(/hover:text-\[\#D4AF37\]/g, 'hover:text-teal-700');

// Replace specific elements for light mode
content = content.replace(/bg-black/g, 'bg-slate-200'); // Some image backgrounds
content = content.replace(/opacity-60/g, 'opacity-90'); // Brighter hero image
content = content.replace(/opacity-30/g, 'opacity-40');
content = content.replace(/selection:bg-\[\#D4AF37\]\/30/g, 'selection:bg-teal-700/30');
content = content.replace(/selection:text-white/g, 'selection:text-teal-900');

fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', content);
