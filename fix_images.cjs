const fs = require('fs');
let code = fs.readFileSync('src/pages/MainHome.tsx', 'utf-8');

const oldImage = `<img src="/asado-sign.jpeg" alt={branch.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />`;
const newImage = `{/* Conditional Background Image */}
                  <img 
                    src={
                      branch.slug === 'kollam' 
                        ? '/asado-sign.jpeg' 
                        : branch.slug === 'alappuzha' 
                          ? '/asado-sign 2.jpeg' 
                          : '/asado-sign 3.jpeg'
                    } 
                    alt={branch.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" 
                  />`;

code = code.replace(oldImage, newImage);
fs.writeFileSync('src/pages/MainHome.tsx', code);
