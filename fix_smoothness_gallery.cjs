const fs = require('fs');
let code = fs.readFileSync('src/pages/MainHome.tsx', 'utf-8');

// Replace gallery images
code = code.replace(
  `[
                 "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=3144&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2864&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=3169&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=3270&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=3174&auto=format&fit=crop"
               ]`,
  `[
                 "/H1.jpeg",
                 "/H2.jpeg",
                 "/H3.jpeg",
                 "/H4.jpeg",
                 "/H5.jpeg"
               ]`
);

// Fix smoothness (change once: false to once: true)
code = code.replace(/once: false/g, 'once: true');

fs.writeFileSync('src/pages/MainHome.tsx', code);
