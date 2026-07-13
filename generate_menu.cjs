const fs = require('fs');

const categoriesRaw = [
  "Fried Rice",
  "Noodles",
  "Gravy Items",
  "Soup",
  "Special Items",
  "Burgers",
  "Veg Burgers & Wraps",
  "Starters",
  "Asado Desserts & Specials",
  "Soft Drinks",
  "Mocktails",
  "Shakes",
  "Fresh Juice",
  "Barbeque",
  "Breads",
  "Asado Special Platters",
  "Sundae",
  "Pizza",
  "Pasta"
];

const categories = categoriesRaw.map((name, i) => ({
  id: `c1${i + 1}`,
  branch_id: 'b1',
  name
}));

const getCId = (name) => categories.find(c => c.name === name).id;

const itemsRaw = [
  // Fried Rice
  { cat: "Fried Rice", name: "Chicken Fried Rice", price: 200, veg: false },
  { cat: "Fried Rice", name: "Egg Fried Rice", price: 170, veg: false },
  { cat: "Fried Rice", name: "Veg Fried Rice", price: 150, veg: true },
  { cat: "Fried Rice", name: "Schezwan Fried Rice Chicken", price: 230, veg: false },
  { cat: "Fried Rice", name: "Egg Schezwan Fried Rice", price: 190, veg: false },
  { cat: "Fried Rice", name: "Veg Schezwan Fried Rice", price: 190, veg: true },
  { cat: "Fried Rice", name: "Boxer Chicken Fried Rice", price: 350, veg: false },
  { cat: "Fried Rice", name: "Triple Chicken Fried Rice", price: 300, veg: false },

  // Noodles
  { cat: "Noodles", name: "Chicken Noodles", price: 200, veg: false },
  { cat: "Noodles", name: "Egg Noodles", price: 180, veg: false },
  { cat: "Noodles", name: "Veg Noodles", price: 170, veg: true },
  { cat: "Noodles", name: "Chicken Schezwan Noodles", price: 240, veg: false },
  { cat: "Noodles", name: "Egg Schezwan Noodles", price: 190, veg: false },
  { cat: "Noodles", name: "Veg Schezwan Noodles", price: 190, veg: true },

  // Gravy Items
  { cat: "Gravy Items", name: "Chilli Chicken", price: 200, veg: false },
  { cat: "Gravy Items", name: "Ginger Chicken", price: 230, veg: false },
  { cat: "Gravy Items", name: "Chilli Gobi", price: 180, veg: true },
  { cat: "Gravy Items", name: "Ginger Gobi", price: 190, veg: true },
  { cat: "Gravy Items", name: "Garlic Gobi", price: 190, veg: true },
  { cat: "Gravy Items", name: "Chicken Manchurian", price: 220, veg: false },
  { cat: "Gravy Items", name: "Gobi Manchurian", price: 190, veg: true },
  { cat: "Gravy Items", name: "Chilli Mushroom", price: 200, veg: true },
  { cat: "Gravy Items", name: "Mushroom Manchurian", price: 210, veg: true },
  { cat: "Gravy Items", name: "Lemon Chicken", price: 250, veg: false },
  { cat: "Gravy Items", name: "Chilli Paneer", price: 200, veg: true },
  { cat: "Gravy Items", name: "Paneer Manchurian", price: 200, veg: true },
  { cat: "Gravy Items", name: "Butter Chicken", price: 240, veg: false },
  { cat: "Gravy Items", name: "Paneer Butter Masala", price: 210, veg: true },
  { cat: "Gravy Items", name: "Mushroom Masala", price: 210, veg: true },
  { cat: "Gravy Items", name: "Kadai Chicken", price: 240, veg: false },
  { cat: "Gravy Items", name: "Vegetable Kurma", price: 150, veg: true },
  { cat: "Gravy Items", name: "Chicken Tikka Masala", price: 250, veg: false },

  // Soup
  { cat: "Soup", name: "Cream of Tomato Soup", price: 150, veg: true },
  { cat: "Soup", name: "Cream of Mushroom Soup", price: 150, veg: true },
  { cat: "Soup", name: "Chicken Soup", price: 140, veg: false },
  { cat: "Soup", name: "Hot and Sour Chicken Soup", price: 150, veg: false },
  { cat: "Soup", name: "Hot and Sour Veg Soup", price: 130, veg: true },
  { cat: "Soup", name: "Chicken Clear Soup", price: 130, veg: false },
  { cat: "Soup", name: "Sweet Corn Chicken Soup", price: 140, veg: false },
  { cat: "Soup", name: "Sweet Corn Veg Soup", price: 120, veg: true },
  { cat: "Soup", name: "Mushroom Soup", price: 120, veg: true },

  // Special Items
  { cat: "Special Items", name: "Dragon Chicken", price: 230, veg: false },
  { cat: "Special Items", name: "Chilli Beef Dry", price: 230, veg: false },
  { cat: "Special Items", name: "BDF", price: 230, veg: false },
  { cat: "Special Items", name: "Chilli Chicken Special", price: 210, veg: false },
  { cat: "Special Items", name: "Beef Roast", price: 240, veg: false },

  // Burgers
  { cat: "Burgers", name: "Fat Boy", price: 300, veg: false },
  { cat: "Burgers", name: "Holy Chees", price: 280, veg: false },
  { cat: "Burgers", name: "Hawaiian Burger", price: 280, veg: false },
  { cat: "Burgers", name: "Cheezy Samurai", price: 280, veg: false },
  { cat: "Burgers", name: "Cheesy Loosy", price: 280, veg: false },
  { cat: "Burgers", name: "Galary Burger", price: 280, veg: false },
  { cat: "Burgers", name: "Mega Zinger", price: 280, veg: false },
  { cat: "Burgers", name: "Mac and Cheese", price: 280, veg: false },
  { cat: "Burgers", name: "Beef Patty", price: 200, veg: false },
  { cat: "Burgers", name: "Chicken Patty", price: 190, veg: false },
  { cat: "Burgers", name: "Zinger Burger", price: 190, veg: false },
  { cat: "Burgers", name: "Hole Burger", price: 220, veg: false },

  // Veg Burgers & Wraps
  { cat: "Veg Burgers & Wraps", name: "Veg Burger", price: 150, veg: true },
  { cat: "Veg Burgers & Wraps", name: "Vegan Burger", price: 250, veg: true },
  { cat: "Veg Burgers & Wraps", name: "Veg Wrap", price: 150, veg: true },
  { cat: "Veg Burgers & Wraps", name: "Veg Club Sandwich", price: 170, veg: true },

  // Starters
  { cat: "Starters", name: "French Fries", price: 100, veg: true },
  { cat: "Starters", name: "Peri Peri Fries", price: 130, veg: true },
  { cat: "Starters", name: "Chicken Loaded Fries", price: 220, veg: false },
  { cat: "Starters", name: "Chicken Strips", price: 220, veg: false },
  { cat: "Starters", name: "Twister Wrap", price: 190, veg: false },
  { cat: "Starters", name: "Tikka Wrap", price: 210, veg: false },
  { cat: "Starters", name: "Chicken Crispy Wrap", price: 190, veg: false },
  { cat: "Starters", name: "Beef Wrap", price: 200, veg: false },
  { cat: "Starters", name: "Zinger Club Sandwich", price: 300, veg: false },
  { cat: "Starters", name: "Chicken Club Sandwich", price: 240, veg: false },
  { cat: "Starters", name: "Beef Subway", price: 300, veg: false },
  { cat: "Starters", name: "Chilly Samoon", price: 150, veg: false },
  { cat: "Starters", name: "Crispy Chicken Slider", price: 350, veg: false },
  { cat: "Starters", name: "Beef Slider", price: 350, veg: false },

  // Asado Desserts & Specials
  { cat: "Asado Desserts & Specials", name: "Brownie Batter", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Popcorn Shake", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Mud Coffee", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Live on Chocolate", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Hot Chocolate Sizzler", price: 350, veg: true },
  { cat: "Asado Desserts & Specials", name: "Chocolate Crunchy", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Oreo Nut Blaster", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Bubblegum Shake", price: 150, veg: true },
  { cat: "Asado Desserts & Specials", name: "Mango Splash", price: 180, veg: true },
  { cat: "Asado Desserts & Specials", name: "Gud Bed", price: 180, veg: true },
  { cat: "Asado Desserts & Specials", name: "Caramel Gold", price: 160, veg: true },
  { cat: "Asado Desserts & Specials", name: "Dry Fruit", price: 160, veg: true },

  // Soft Drinks
  { cat: "Soft Drinks", name: "Red Chill", price: 90, veg: true },
  { cat: "Soft Drinks", name: "Blue Lime", price: 90, veg: true },

  // Mocktails
  { cat: "Mocktails", name: "Mango Mojito", price: 100, veg: true },
  { cat: "Mocktails", name: "Guava Mojito", price: 100, veg: true },
  { cat: "Mocktails", name: "Black Current", price: 100, veg: true },
  { cat: "Mocktails", name: "Kala Katta", price: 100, veg: true },
  { cat: "Mocktails", name: "Blue Ocean", price: 100, veg: true },
  { cat: "Mocktails", name: "Lichi", price: 100, veg: true },
  { cat: "Mocktails", name: "Peach Mojito", price: 140, veg: true },

  // Shakes
  { cat: "Shakes", name: "Avocado Shake", price: 140, veg: true },
  { cat: "Shakes", name: "Pomegranate", price: 120, veg: true },
  { cat: "Shakes", name: "Papaya", price: 100, veg: true },
  { cat: "Shakes", name: "Chikku", price: 100, veg: true },
  { cat: "Shakes", name: "Muskmelon", price: 100, veg: true },
  { cat: "Shakes", name: "Rose Milk", price: 100, veg: true },
  { cat: "Shakes", name: "Vanilla", price: 100, veg: true },
  { cat: "Shakes", name: "Chocolate", price: 100, veg: true },
  { cat: "Shakes", name: "Oreo", price: 100, veg: true },
  { cat: "Shakes", name: "Blueberry", price: 120, veg: true },
  { cat: "Shakes", name: "Banana Shake", price: 100, veg: true },
  { cat: "Shakes", name: "Badam Milk", price: 80, veg: true },
  { cat: "Shakes", name: "Apple Shake", price: 100, veg: true },
  { cat: "Shakes", name: "Strawberry", price: 100, veg: true },

  // Fresh Juice
  { cat: "Fresh Juice", name: "Cocktail", price: 130, veg: true },
  { cat: "Fresh Juice", name: "Papaya", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Orange", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Watermelon", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Pineapple", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Grape", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Mango", price: 90, veg: true },
  { cat: "Fresh Juice", name: "Shamam", price: 90, veg: true },

  // Barbeque
  { cat: "Barbeque", name: "Chicken Tikka", price: 350, veg: false },
  { cat: "Barbeque", name: "Chicken Wings", price: 350, veg: false },
  { cat: "Barbeque", name: "Chicken Kebab", price: 260, veg: false },
  { cat: "Barbeque", name: "Beef Kebab", price: 280, veg: false },
  { cat: "Barbeque", name: "Mutton Kebab", price: 400, veg: false },

  // Breads
  { cat: "Breads", name: "Butter Naan", price: 20, veg: true },
  { cat: "Breads", name: "Plain Naan", price: 20, veg: true },
  { cat: "Breads", name: "Arabic Naan", price: 20, veg: true },

  // Asado Special Platters
  { cat: "Asado Special Platters", name: "Beef Ribs", price: 400, veg: false },
  { cat: "Asado Special Platters", name: "Maqlooba (Full)", price: 800, veg: false },
  { cat: "Asado Special Platters", name: "Maqlooba (Half)", price: 400, veg: false },
  { cat: "Asado Special Platters", name: "Maqlooba (Quarter)", price: 200, veg: false },

  // Sundae
  { cat: "Sundae", name: "Water Family Sundae", price: 400, veg: true },
  { cat: "Sundae", name: "Choco Nut Sundae", price: 200, veg: true },
  { cat: "Sundae", name: "Dry Fruit Mix", price: 200, veg: true },
  { cat: "Sundae", name: "Apple Sundae", price: 200, veg: true },

  // Pizza
  { cat: "Pizza", name: "Veg Ridiculous Pizza (Small)", price: 170, veg: true },
  { cat: "Pizza", name: "Veg Ridiculous Pizza (Large)", price: 640, veg: true },
  { cat: "Pizza", name: "Green Garden Pizza (Small)", price: 200, veg: true },
  { cat: "Pizza", name: "Green Garden Pizza (Large)", price: 760, veg: true },
  { cat: "Pizza", name: "Truffle Mushroom Pizza (Small)", price: 220, veg: true },
  { cat: "Pizza", name: "Truffle Mushroom Pizza (Large)", price: 840, veg: true },
  { cat: "Pizza", name: "Paneer Tikka Pizza (Small)", price: 190, veg: true },
  { cat: "Pizza", name: "Paneer Tikka Pizza (Large)", price: 720, veg: true },
  { cat: "Pizza", name: "Chicken Tikka Pizza (Small)", price: 200, veg: false },
  { cat: "Pizza", name: "Chicken Tikka Pizza (Large)", price: 760, veg: false },
  { cat: "Pizza", name: "Hotdog Pizza (Small)", price: 180, veg: false },
  { cat: "Pizza", name: "Hotdog Pizza (Large)", price: 680, veg: false },
  { cat: "Pizza", name: "Fully Overloaded Pizza (Small)", price: 270, veg: false },
  { cat: "Pizza", name: "Fully Overloaded Pizza (Large)", price: 1040, veg: false },

  // Pasta
  { cat: "Pasta", name: "White Sauce Pasta (Alfredo) - Small", price: 180, veg: true },
  { cat: "Pasta", name: "White Sauce Pasta (Alfredo) - Large", price: 680, veg: true },
  { cat: "Pasta", name: "Pesto Pasta - Small", price: 180, veg: true },
  { cat: "Pasta", name: "Pesto Pasta - Large", price: 680, veg: true },
  { cat: "Pasta", name: "Pink Sauce Pasta - Small", price: 180, veg: true },
  { cat: "Pasta", name: "Pink Sauce Pasta - Large", price: 680, veg: true },
  { cat: "Pasta", name: "Red Sauce Pasta (Arrabbiata) - Small", price: 180, veg: true },
  { cat: "Pasta", name: "Red Sauce Pasta (Arrabbiata) - Large", price: 680, veg: true },
  { cat: "Pasta", name: "Classic Margherita - Small", price: 180, veg: true },
  { cat: "Pasta", name: "Classic Margherita - Large", price: 680, veg: true },
  { cat: "Pasta", name: "Add on: Chicken", price: 40, veg: false },
  { cat: "Pasta", name: "Add on: Prawns", price: 60, veg: false },
];

const menuItems = itemsRaw.map((item, index) => {
  return {
    id: `fk${index + 1}`,
    branch_id: 'b1',
    category_id: getCId(item.cat),
    name: item.name,
    price: item.price,
    description: '',
    isVeg: item.veg,
    isChefRecommendation: false
  };
});

let dataFile = fs.readFileSync('src/data.ts', 'utf8');

// replace kollamCategories
const categoriesStr = `export const kollamCategories: Category[] = ${JSON.stringify(categories, null, 2)};`;
const menuStr = `export const kollamMenu: FoodItem[] = ${JSON.stringify(menuItems, null, 2)};`;

dataFile = dataFile.replace(/export const kollamCategories: Category\[\] = \[[\s\S]*?\];/, categoriesStr);
dataFile = dataFile.replace(/export const kollamMenu: FoodItem\[\] = \[[\s\S]*?\];/, menuStr);

fs.writeFileSync('src/data.ts', dataFile);

console.log("Replaced successfully!");
