const fs = require('fs');
let code = fs.readFileSync('src/pages/kollam/KollamCruise.tsx', 'utf-8');

const oldImage = `<img 
                src="https://images.unsplash.com/photo-1534430480872-3498384e54e6?q=80&w=3270&auto=format&fit=crop" 
                alt="Scenic Backwaters" 
                className="absolute inset-0 w-full h-full object-cover"
              />`;
const newImage = `<img 
                src="https://upload.wikimedia.org/wikipedia/commons/1/13/Kerala_Houseboat_%28191490747%29.jpeg" 
                alt="Scenic Backwaters Houseboat" 
                className="absolute inset-0 w-full h-full object-cover"
              />`;

code = code.replace(oldImage, newImage);
fs.writeFileSync('src/pages/kollam/KollamCruise.tsx', code);
