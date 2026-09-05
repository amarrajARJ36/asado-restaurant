const fs = require('fs');

let kollam = fs.readFileSync('src/pages/kollam/KollamHome.tsx', 'utf-8');

const oldHero = `<video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-100 brightness-110 scale-105 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          >
            <source src="/hero kollam.mp4" type="video/mp4" />
          </video>`;

const newHero = `<motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="/asado-hero-image.jpeg"
            alt="Kollam Asado"
            className="w-full h-full object-cover opacity-100 brightness-110 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          />`;

kollam = kollam.replace(oldHero, newHero);
fs.writeFileSync('src/pages/kollam/KollamHome.tsx', kollam);
