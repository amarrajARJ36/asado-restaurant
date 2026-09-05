const fs = require('fs');

let code = fs.readFileSync('src/pages/MainHome.tsx', 'utf-8');

const imagePlaceholder = `{/* Image placeholder */}`;

const imageTag = `<img src="/asado-sign.jpeg" alt={branch.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />`;

code = code.replace(imagePlaceholder, imageTag);

fs.writeFileSync('src/pages/MainHome.tsx', code);
