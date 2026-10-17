import { Branch, Category, FoodItem } from './types';

export const branches: Branch[] = [
  {
    "id": "b1",
    "name": "Kollam",
    "slug": "kollam",
    "city": "Kollam",
    "status": "active",
    "description": "Lake View • Boating • Events • Signature BBQ",
    "heroImage": "https://images.unsplash.com/photo-1543418215-685d0d8dc821?q=80&w=2938&auto=format&fit=crop"
  },
  {
    "id": "b2",
    "name": "Alappuzha",
    "slug": "alappuzha",
    "city": "Alappuzha",
    "status": "active",
    "description": "Backwater Experience • Family Dining • Premium Ambience",
    "heroImage": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2864&auto=format&fit=crop"
  },
  {
    "id": "b3",
    "name": "Varkala",
    "slug": "varkala",
    "city": "Varkala",
    "status": "coming_soon",
    "description": "Experience Asado Above the Cliffs • Opening 2026",
    "heroImage": "https://images.unsplash.com/photo-1592657279768-3dce46b1f062?q=80&w=2940&auto=format&fit=crop"
  }
];

export const kollamCategories: Category[] = [
  {
    "id": "c11",
    "branch_id": "b1",
    "name": "Fried Rice"
  },
  {
    "id": "c12",
    "branch_id": "b1",
    "name": "Noodles"
  },
  {
    "id": "c14",
    "branch_id": "b1",
    "name": "Soup"
  },
  {
    "id": "c13",
    "branch_id": "b1",
    "name": "Gravy Items"
  },
  {
    "id": "c15",
    "branch_id": "b1",
    "name": "Special Items"
  },
  {
    "id": "c16",
    "branch_id": "b1",
    "name": "Burgers"
  },
  {
    "id": "c17",
    "branch_id": "b1",
    "name": "Veg Burgers & Wraps"
  },
  {
    "id": "c18",
    "branch_id": "b1",
    "name": "Starters"
  },
  {
    "id": "c114",
    "branch_id": "b1",
    "name": "Barbeque"
  },
  {
    "id": "c115",
    "branch_id": "b1",
    "name": "Breads"
  },
  {
    "id": "c116",
    "branch_id": "b1",
    "name": "Asado Special Platters"
  },
  {
    "id": "c120",
    "branch_id": "b1",
    "name": "Asado Special Rice Items"
  },
  {
    "id": "c111",
    "branch_id": "b1",
    "name": "Mocktails"
  },
  {
    "id": "c112",
    "branch_id": "b1",
    "name": "Shakes"
  },
  {
    "id": "c113",
    "branch_id": "b1",
    "name": "Fresh Juice"
  },
  {
    "id": "c19",
    "branch_id": "b1",
    "name": "Asado Desserts & Specials"
  }
];

export const kollamMenu: FoodItem[] = [
  {
    "id": "fk1",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Chicken Fried Rice",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk2",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Egg Fried Rice",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk3",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Veg Fried Rice",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk4",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Schezwan Fried Rice Chicken",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk5",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Schezwan Fried Rice Veg",
    "price": 220,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk6",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Schezwan Egg Fried Rice",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk8",
    "branch_id": "b1",
    "category_id": "c11",
    "category": "Fried Rice",
    "name": "Triple Chicken Fried Rice",
    "price": 330,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk9",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Chicken Noodles",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk10",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Egg Noodles",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk11",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Veg Noodles",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk7",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Schezwan Noodles Chicken",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk12",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Schezwan Noodles Egg",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk13",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Schezwan Noodles Veg",
    "price": 220,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk14",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Mixed Noodles",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk15",
    "branch_id": "b1",
    "category_id": "c12",
    "category": "Noodles",
    "name": "Schezwan Noodles Mixed",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk33",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Cream Of Tomato Soup",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk34",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Cream Of Mushroom Soup",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk16",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Hot & Sour Chicken Soup",
    "price": 180,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk17",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Hot & Sour Veg Soup",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk38",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Chicken Clear Soup",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk39",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Sweet Corn Chicken Soup",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk40",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Sweet Corn Veg Soup",
    "price": 140,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk41",
    "branch_id": "b1",
    "category_id": "c14",
    "category": "Soup",
    "name": "Mushroom Soup",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk18",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chilly Chicken",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk19",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chilly Gobi",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk20",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Ginger Chicken",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk21",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Ginger Gobi",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk22",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Garlic Gobi",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk23",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chicken Manchurian",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk24",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Gobi Manchurian",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk25",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chilly Mushroom",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk26",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Mushroom Manchurian",
    "price": 230,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk27",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Lemon Chicken",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk28",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chilly Paneer",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk29",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Paneer Manchurian",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk30",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Paneer Butter Masala",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk31",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Butter Chicken",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk32",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Mushroom Masala",
    "price": 240,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk35",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Veg Kurma",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk36",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Kadai Chicken",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk37",
    "branch_id": "b1",
    "category_id": "c13",
    "category": "Gravy Items",
    "name": "Chicken Tikka Masala",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk42",
    "branch_id": "b1",
    "category_id": "c15",
    "category": "Special Items",
    "name": "Dragon Chicken",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk43",
    "branch_id": "b1",
    "category_id": "c15",
    "category": "Special Items",
    "name": "Chilly Beef",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk44",
    "branch_id": "b1",
    "category_id": "c15",
    "category": "Special Items",
    "name": "BDF",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk46",
    "branch_id": "b1",
    "category_id": "c15",
    "category": "Special Items",
    "name": "Beef Roast",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk45",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Holy Cheese Burger",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk50",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Cheezy Samurai",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk47",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Cheezy Lucy",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk48",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Galaxy Burger",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk49",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Mega Zinger Burger",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk51",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Beef Patty Burger",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk52",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Chicken Patty Burger",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk57",
    "branch_id": "b1",
    "category_id": "c16",
    "category": "Burgers",
    "name": "Zinger Burger",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk59",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Veg Burger",
    "price": 170,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk60",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Vegan Burger",
    "price": 270,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk58",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Hole Burger",
    "price": 230,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk61",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Veg Wrap",
    "price": 170,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk53",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Vegetable Club Sandwich",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk72",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Chicken Club Sandwich",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk71",
    "branch_id": "b1",
    "category_id": "c17",
    "category": "Veg Burgers & Wraps",
    "name": "Zinger Club Sandwich",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk63",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "French Fries",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk64",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Peri Peri Fries",
    "price": 159,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk65",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Chicken Loaded Fries",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk66",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Chicken Strips",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk67",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Twister Wrap",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk68",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Tikka Wrap",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk69",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Chicken Crispy Wrap",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk70",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Beef Wrap",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk74",
    "branch_id": "b1",
    "category_id": "c18",
    "category": "Starters",
    "name": "Chilly Samoon",
    "price": 170,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk120",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Tikka",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk54",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Tikka (Half)",
    "price": 170,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk121",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Wings",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk55",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Wings (Half)",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk56",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Kabab",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk62",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Chicken Kabab (Half)",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk73",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Beef Kabab",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk75",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Beef Kabab (Half)",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk76",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Peri Peri Al Faham (Full)",
    "price": 650,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk77",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Peri Peri Al Faham (Half)",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk78",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Peri Peri Al Faham (Qtr Leg)",
    "price": 160,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk79",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Peri Peri Al Faham (Qtr Chest)",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk80",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Arabic Al Faham (Full)",
    "price": 650,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk81",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Arabic Al Faham (Half)",
    "price": 325,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk82",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Arabic Al Faham (Qtr Chest)",
    "price": 160,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk83",
    "branch_id": "b1",
    "category_id": "c114",
    "category": "Barbeque",
    "name": "Arabic Al Faham (Qtr Leg)",
    "price": 160,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk125",
    "branch_id": "b1",
    "category_id": "c115",
    "category": "Breads",
    "name": "Butter Naan",
    "price": 35,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk126",
    "branch_id": "b1",
    "category_id": "c115",
    "category": "Breads",
    "name": "Plain Naan",
    "price": 30,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk84",
    "branch_id": "b1",
    "category_id": "c115",
    "category": "Breads",
    "name": "Kuboos",
    "price": 15,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk85",
    "branch_id": "b1",
    "category_id": "c115",
    "category": "Breads",
    "name": "Romali Rotti",
    "price": 15,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk86",
    "branch_id": "b1",
    "category_id": "c116",
    "category": "Asado Special Platters",
    "name": "Mixed Grill (Full)",
    "price": 2800,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk87",
    "branch_id": "b1",
    "category_id": "c116",
    "category": "Asado Special Platters",
    "name": "Mixed Grill (Half)",
    "price": 1800,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk88",
    "branch_id": "b1",
    "category_id": "c116",
    "category": "Asado Special Platters",
    "name": "Mixed Platter (Quarter)",
    "price": 1200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk89",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Asado Beef Rib",
    "price": 400,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk90",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Maqlooba (Full)",
    "price": 800,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk91",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Maqlooba (Half)",
    "price": 400,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk92",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Maqlooba (Quarter)",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk93",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Maqlooba Rice",
    "price": 120,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk94",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Zurbiyan Beef",
    "price": 290,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk95",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Zurbiyan Chicken",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk96",
    "branch_id": "b1",
    "category_id": "c120",
    "category": "Asado Special Rice Items",
    "name": "Zurbiyan Rice Extra",
    "price": 120,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk97",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Dry Fruit Smoothie",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk98",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Red Chill",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk99",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Blue Lime",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk100",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Mango Mojito",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk101",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Guava Mojito",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk102",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Black Currant Mojito",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk103",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Blue Ocean",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk104",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Litchi Mojito",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk105",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Peach Ice Tea",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk106",
    "branch_id": "b1",
    "category_id": "c111",
    "category": "Mocktails",
    "name": "Virgin Mojito",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk107",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Avocado Shake",
    "price": 160,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk108",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Papaya Shake",
    "price": 140,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk109",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Chikku Shake",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk110",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Muskmelon Shake",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk111",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Rose Vanilla",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk112",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Vanilla Shake",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk113",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Chocolate Shake",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk114",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Oreo Shake",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk115",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Blueberry Shake",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk116",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Banana Shake",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk117",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Badam Milk Shake",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk118",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Apple Shake",
    "price": 140,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk119",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Strawberry Shake",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk122",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Cold Coffee",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk123",
    "branch_id": "b1",
    "category_id": "c112",
    "category": "Shakes",
    "name": "Mohabath Ka Sharbat",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk124",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Cocktail Fresh Juice",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk127",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Papaya Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk128",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Orange Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk129",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Watermelon Fresh Juice",
    "price": 80,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk130",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Pineapple Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk131",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Grape Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk132",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Mango Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk133",
    "branch_id": "b1",
    "category_id": "c113",
    "category": "Fresh Juice",
    "name": "Muskmelon Fresh Juice",
    "price": 110,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk134",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Brownie Batter",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk135",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Popcorn Shake",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk136",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Mud Coffee",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk137",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Live On Chocolate",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk138",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Chocolate Crunchy",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk139",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Oreo Nut Blaster",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk140",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Bubblegum Shake",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk141",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Mango Splash",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk142",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Watermelon Family Sundae",
    "price": 410,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk143",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Choco Nut Sundae",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk144",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Dry Fruit Mix",
    "price": 220,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk145",
    "branch_id": "b1",
    "category_id": "c19",
    "category": "Asado Desserts & Specials",
    "name": "Apple Sundae",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  }
];

export const alappuzhaCategories: Category[] = [
  {
    "id": "c5",
    "branch_id": "b2",
    "name": "Backwater Specials"
  },
  {
    "id": "c6",
    "branch_id": "b2",
    "name": "Family Combos"
  },
  {
    "id": "c7",
    "branch_id": "b2",
    "name": "Appetizers"
  },
  {
    "id": "c8",
    "branch_id": "b2",
    "name": "Beverages"
  }
];

export const alappuzhaMenu: FoodItem[] = [
  {
    "id": "f5",
    "branch_id": "b2",
    "category_id": "c5",
    "name": "Karimeen Pollichathu",
    "price": 750,
    "description": "Pearl spot fish marinated in rich Kerala spices and baked in banana leaf.",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&q=75&auto=format&fit=crop",
    "isVeg": false,
    "isChefRecommendation": true
  },
  {
    "id": "f6",
    "branch_id": "b2",
    "category_id": "c5",
    "name": "Kuttanadan Duck Roast",
    "price": 680,
    "description": "Traditional slow-roasted duck with aromatic spices.",
    "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&q=75&auto=format&fit=crop",
    "isVeg": false,
    "isChefRecommendation": true
  },
  {
    "id": "f7",
    "branch_id": "b2",
    "category_id": "c7",
    "name": "Tapioca Cutlet",
    "price": 280,
    "description": "Crispy cutlets made with seasoned tapioca.",
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&q=75&auto=format&fit=crop",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "f8",
    "branch_id": "b2",
    "category_id": "c8",
    "name": "Coconut Paradise",
    "price": 220,
    "description": "Tender coconut water blended with mint and honey.",
    "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&q=75&auto=format&fit=crop",
    "isVeg": true,
    "isChefRecommendation": false
  }
];

export const kollamGallery: Array<{id: string, type: string, url: string}> = [];

export const alappuzhaGallery: Array<{id: string, type: string, url: string}> = [];
