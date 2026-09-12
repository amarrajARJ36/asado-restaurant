const fs = require('fs');
let code = fs.readFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', 'utf-8');

const oldRecommendations = `const HOUSEBOAT_RECOMMENDATIONS = {
  couple: {
    title: '1-Bedroom Premium Houseboat',
    desc: 'Intimate, private, and luxurious. Perfect for a romantic getaway with a private deck and candlelight dinner options.',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop',
    tags: ['Private Chef', 'Jacuzzi Option', 'Decorations']
  },
  family: {
    title: '2-3 Bedroom Family Houseboat',
    desc: 'Spacious decks, safe for children, and multiple rooms. Enjoy quality family time cruising the backwaters.',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop',
    tags: ['Family Lounge', 'Kid Friendly Meals', 'AC Bedrooms']
  },
  friends: {
    title: '3-4 Bedroom Leisure Houseboat',
    desc: 'Large upper deck for lounging, great music system, and plenty of space to relax and catch up with friends.',
    img: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2000&auto=format&fit=crop',
    tags: ['Upper Deck', 'Music System', 'Group Dining']
  },
  corporate: {
    title: 'Luxury Conference Houseboat',
    desc: 'Equipped for team offsites with large seating areas, premium catering, and presentation facilities if needed.',
    img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2000&auto=format&fit=crop',
    tags: ['Large Capacity', 'Premium Catering', 'Lounge Area']
  },
  celebration: {
    title: 'Party & Celebration Houseboat',
    desc: 'Custom decorated boats with ample space for cake cutting, parties, and creating unforgettable memories.',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop',
    tags: ['Custom Decor', 'Event Space', 'Special Menu']
  }
};`;

const newRecommendations = `const HOUSEBOAT_RECOMMENDATIONS = {
  couple: {
    title: '1-Bedroom Premium Houseboat',
    desc: 'Intimate, private, and luxurious. Perfect for a romantic getaway with a private deck and candlelight dinner options.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Kerala_Houseboat_%28191490747%29.jpeg',
    tags: ['Private Chef', 'Jacuzzi Option', 'Decorations']
  },
  family: {
    title: '2-3 Bedroom Family Houseboat',
    desc: 'Spacious decks, safe for children, and multiple rooms. Enjoy quality family time cruising the backwaters.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/83/KumarakomHouseBoat.jpg',
    tags: ['Family Lounge', 'Kid Friendly Meals', 'AC Bedrooms']
  },
  friends: {
    title: '3-4 Bedroom Leisure Houseboat',
    desc: 'Large upper deck for lounging, great music system, and plenty of space to relax and catch up with friends.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/3/38/A_Houseboat_in_Backwaters_of_Kerala.jpg',
    tags: ['Upper Deck', 'Music System', 'Group Dining']
  },
  corporate: {
    title: 'Luxury Conference Houseboat',
    desc: 'Equipped for team offsites with large seating areas, premium catering, and presentation facilities if needed.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Alappuzha_Boat_Beauty_W.jpg',
    tags: ['Large Capacity', 'Premium Catering', 'Lounge Area']
  },
  celebration: {
    title: 'Party & Celebration Houseboat',
    desc: 'Custom decorated boats with ample space for cake cutting, parties, and creating unforgettable memories.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/House_Boat_View_DSW.jpg',
    tags: ['Custom Decor', 'Event Space', 'Special Menu']
  }
};`;

code = code.replace(oldRecommendations, newRecommendations);
fs.writeFileSync('src/pages/alappuzha/AlappuzhaHome.tsx', code);
