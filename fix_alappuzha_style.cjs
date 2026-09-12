const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf-8');

// 1. Remove white fade from the curated houseboats
const oldImageContainer = `<img 
                  src={recommendedBoat.img} 
                  alt={recommendedBoat.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-50 to-transparent opacity-80 md:opacity-100" />
              </div>`;

const newImageContainer = `<img 
                  src={recommendedBoat.img} 
                  alt={recommendedBoat.title}
                  className="w-full h-full object-cover"
                />
              </div>`;

code = code.replace(oldImageContainer, newImageContainer);

// 2. Brighten hero video
const oldHeroVideo = `autoPlay
            muted
            loop
            playsInline
            src="/hero alappuzha.mp4"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/40 to-transparent" />`;

const newHeroVideo = `autoPlay
            muted
            loop
            playsInline
            src="/hero alappuzha.mp4"
            className="w-full h-full object-cover brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/20 to-transparent" />`;

code = code.replace(oldHeroVideo, newHeroVideo);
fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', code);
