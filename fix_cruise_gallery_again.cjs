const fs = require('fs');
let code = fs.readFileSync('src/pages/kollam/KollamCruise.tsx', 'utf-8');

const oldGallery = `[
              { title: "Boats", h: "h-96", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" },
              { title: "Backwaters", h: "h-64", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" },
              { title: "Sunset", h: "h-80", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Houseboats_at_Kerala.jpg/1280px-Houseboats_at_Kerala.jpg" },
              { title: "Guests", h: "h-72", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Kerala_backwaters.jpg/1280px-Kerala_backwaters.jpg" },
              { title: "Meals", h: "h-96", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg" },
              { title: "Morning Cruise", h: "h-64", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" }
            ]`;

const newGallery = `[
              { title: "Boats", h: "h-96", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" },
              { title: "Backwaters", h: "h-64", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" },
              { title: "Sunset", h: "h-80", img: "https://upload.wikimedia.org/wikipedia/commons/9/96/Kerala_Houseboat_View.JPG" },
              { title: "Guests", h: "h-72", img: "https://upload.wikimedia.org/wikipedia/commons/d/df/Kerala_Launch.JPG" },
              { title: "Meals", h: "h-96", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg" },
              { title: "Morning Cruise", h: "h-64", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" }
            ]`;

code = code.replace(oldGallery, newGallery);
fs.writeFileSync('src/pages/kollam/KollamCruise.tsx', code);
