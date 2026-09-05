const fs = require('fs');
let code = fs.readFileSync('src/pages/kollam/KollamCruise.tsx', 'utf-8');

const oldMeal = `{ 
                title: "Traditional Kerala Meal", 
                desc: "Enjoy authentic local flavours served on a banana leaf.",
                img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2000&auto=format&fit=crop"
              }`;
const newMeal = `{ 
                title: "Traditional Kerala Meal", 
                desc: "Enjoy authentic local flavours served on a banana leaf.",
                img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sadhya_DSW.jpg/1280px-Sadhya_DSW.jpg"
              }`;

code = code.replace(oldMeal, newMeal);
fs.writeFileSync('src/pages/kollam/KollamCruise.tsx', code);
