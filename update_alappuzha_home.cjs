const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf8');

// The user wants nice scroll animations, so we'll wrap sections and elements in motion components
// and change the hero image since it's the same as Kollam's.
// New Hero image: "https://images.unsplash.com/photo-1593693397690-362cb9666cb3" was 404, let's use 1599487405270-864309b8214f (200), or 1592484080164-839213197171 (200), or 1587425126867-0c7f12e8489c (200)

code = code.replace(
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599487405270-864309b8214f?q=80&w=3132&auto=format&fit=crop'
);

code = code.replace(
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592484080164-839213197171?q=80&w=2000&auto=format&fit=crop'
);


fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', code);
