const fs = require('fs');

// 1. MainHome.tsx - brightness
let main = fs.readFileSync('src/pages/MainHome.tsx', 'utf-8');
const oldImage = `className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" 
                  />
                  
                  {/* Gradients for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />`;
const newImage = `className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                  />
                  
                  {/* Gradients for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />`;
main = main.replace(oldImage, newImage);
fs.writeFileSync('src/pages/MainHome.tsx', main);


// 2. KollamHome.tsx
let kollam = fs.readFileSync('src/pages/kollam/KollamHome.tsx', 'utf-8');
kollam = kollam.replace('src="/kollam-hero.mp4"', 'src="/hero kollam.mp4"');
fs.writeFileSync('src/pages/kollam/KollamHome.tsx', kollam);


// 3. AlappuzhaHome.tsx
let alappuzha = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf-8');
const oldAlaHero = `<motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.9 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?q=80&w=3132&auto=format&fit=crop"
            alt="Alappuzha Backwaters"
            className="w-full h-full object-cover"
          />`;
const newAlaHero = `<motion.video 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.9 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            autoPlay
            muted
            loop
            playsInline
            src="/hero alappuzha.mp4"
            className="w-full h-full object-cover"
          />`;
alappuzha = alappuzha.replace(oldAlaHero, newAlaHero);
fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', alappuzha);

