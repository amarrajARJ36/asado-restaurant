const fs = require('fs');
let code = fs.readFileSync('src/pages/kollam/KollamCruise.tsx', 'utf-8');

// The 404 images are the 3rd, 4th, and 5th items in the array (index 2, 3, 4).
// Let's just replace all of them with valid known images to be safe.

const oldGallery = `[
              { title: "Boats", h: "h-96", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" },
              { title: "Backwaters", h: "h-64", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" },
              { title: "Sunset", h: "h-80", img: "https://images.unsplash.com/photo-1544485501-8395ea3f45f7?q=80&w=3270&auto=format&fit=crop" },
              { title: "Guests", h: "h-72", img: "https://images.unsplash.com/photo-1534430480872-3498384e54e6?q=80&w=3270&auto=format&fit=crop" },
              { title: "Meals", h: "h-96", img: "https://images.unsplash.com/photo-1627308595229-7830f5c927b8?q=80&w=3174&auto=format&fit=crop" },
              { title: "Morning Cruise", h: "h-64", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" }
            ]`;

const newGallery = `[
              { title: "Boats", h: "h-96", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop" },
              { title: "Backwaters", h: "h-64", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=3270&auto=format&fit=crop" },
              { title: "Sunset", h: "h-80", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Houseboats_at_Kerala.jpg/1280px-Houseboats_at_Kerala.jpg" },
              { title: "Guests", h: "h-72", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Kerala_backwaters.jpg/1280px-Kerala_backwaters.jpg" },
              { title: "Meals", h: "h-96", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg" },
              { title: "Morning Cruise", h: "h-64", img: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=3269&auto=format&fit=crop" }
            ]`;

code = code.replace(oldGallery, newGallery);
fs.writeFileSync('src/pages/kollam/KollamCruise.tsx', code);
