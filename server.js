// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// src/data.ts
var kollamCategories = [
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
    "id": "c13",
    "branch_id": "b1",
    "name": "Gravy Items"
  },
  {
    "id": "c14",
    "branch_id": "b1",
    "name": "Soup"
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
    "id": "c19",
    "branch_id": "b1",
    "name": "Asado Desserts & Specials"
  },
  {
    "id": "c110",
    "branch_id": "b1",
    "name": "Soft Drinks"
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
    "id": "c117",
    "branch_id": "b1",
    "name": "Sundae"
  },
  {
    "id": "c118",
    "branch_id": "b1",
    "name": "Pizza"
  },
  {
    "id": "c119",
    "branch_id": "b1",
    "name": "Pasta"
  }
];
var kollamMenu = [
  {
    "id": "fk1",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Chicken Fried Rice",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk2",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Egg Fried Rice",
    "price": 170,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk3",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Veg Fried Rice",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk4",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Schezwan Fried Rice Chicken",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk5",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Egg Schezwan Fried Rice",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk6",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Veg Schezwan Fried Rice",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk7",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Boxer Chicken Fried Rice",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk8",
    "branch_id": "b1",
    "category_id": "c11",
    "name": "Triple Chicken Fried Rice",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk89",
    "branch_id": "b1",
    "category_id": "c110",
    "name": "Red Chill",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk90",
    "branch_id": "b1",
    "category_id": "c110",
    "name": "Blue Lime",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk91",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Mango Mojito",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk92",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Guava Mojito",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk93",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Black Current",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk94",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Kala Katta",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk95",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Blue Ocean",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk96",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Lichi",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk97",
    "branch_id": "b1",
    "category_id": "c111",
    "name": "Peach Mojito",
    "price": 140,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk98",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Avocado Shake",
    "price": 140,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk99",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Pomegranate",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk100",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Papaya",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk101",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Chikku",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk102",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Muskmelon",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk103",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Rose Milk",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk104",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Vanilla",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk105",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Chocolate",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk106",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Oreo",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk107",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Blueberry",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk108",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Banana Shake",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk109",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Badam Milk",
    "price": 80,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk110",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Apple Shake",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk111",
    "branch_id": "b1",
    "category_id": "c112",
    "name": "Strawberry",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk112",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Cocktail",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk113",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Papaya",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk114",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Orange",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk115",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Watermelon",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk116",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Pineapple",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk117",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Grape",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk118",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Mango",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk119",
    "branch_id": "b1",
    "category_id": "c113",
    "name": "Shamam",
    "price": 90,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk120",
    "branch_id": "b1",
    "category_id": "c114",
    "name": "Chicken Tikka",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk121",
    "branch_id": "b1",
    "category_id": "c114",
    "name": "Chicken Wings",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk122",
    "branch_id": "b1",
    "category_id": "c114",
    "name": "Chicken Kebab",
    "price": 260,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk123",
    "branch_id": "b1",
    "category_id": "c114",
    "name": "Beef Kebab",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk124",
    "branch_id": "b1",
    "category_id": "c114",
    "name": "Mutton Kebab",
    "price": 400,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk125",
    "branch_id": "b1",
    "category_id": "c115",
    "name": "Butter Naan",
    "price": 20,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk126",
    "branch_id": "b1",
    "category_id": "c115",
    "name": "Plain Naan",
    "price": 20,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk127",
    "branch_id": "b1",
    "category_id": "c115",
    "name": "Arabic Naan",
    "price": 20,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk128",
    "branch_id": "b1",
    "category_id": "c116",
    "name": "Beef Ribs",
    "price": 400,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk131",
    "branch_id": "b1",
    "category_id": "c116",
    "name": "Maqlooba Quarter/Half/Full",
    "price": "200/400/800",
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk132",
    "branch_id": "b1",
    "category_id": "c117",
    "name": "Water Family Sundae",
    "price": 400,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk133",
    "branch_id": "b1",
    "category_id": "c117",
    "name": "Choco Nut Sundae",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk134",
    "branch_id": "b1",
    "category_id": "c117",
    "name": "Dry Fruit Mix",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk135",
    "branch_id": "b1",
    "category_id": "c117",
    "name": "Apple Sundae",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk136",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Veg Ridiculous Pizza Small/Large",
    "price": "170/640",
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk138",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Green Garden Pizza Small/Large",
    "price": "200/760",
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk140",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Truffle Mushroom Pizza Small/Large",
    "price": "220/840",
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk142",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Paneer Tikka Pizza Small/Large",
    "price": "190/720",
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk144",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Chicken Tikka Pizza Small/Large",
    "price": "200/760",
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk146",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Hotdog Pizza Small/Large",
    "price": "180/680",
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk148",
    "branch_id": "b1",
    "category_id": "c118",
    "name": "Fully Overloaded Pizza Small/Large",
    "price": "270/1040",
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk150",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "White Sauce Pasta (Alfredo) - Small",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk151",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "White Sauce Pasta (Alfredo) - Large",
    "price": 680,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk152",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Pesto Pasta - Small",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk153",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Pesto Pasta - Large",
    "price": 680,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk154",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Pink Sauce Pasta - Small",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk155",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Pink Sauce Pasta - Large",
    "price": 680,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk156",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Red Sauce Pasta (Arrabbiata) - Small",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk157",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Red Sauce Pasta (Arrabbiata) - Large",
    "price": 680,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk158",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Classic Margherita - Small",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk159",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Classic Margherita - Large",
    "price": 680,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk160",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Add on: Chicken",
    "price": 40,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk161",
    "branch_id": "b1",
    "category_id": "c119",
    "name": "Add on: Prawns",
    "price": 60,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk9",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Chicken Noodles",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk10",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Egg Noodles",
    "price": 180,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk11",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Veg Noodles",
    "price": 170,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk12",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Chicken Schezwan Noodles",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk13",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Egg Schezwan Noodles",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk14",
    "branch_id": "b1",
    "category_id": "c12",
    "name": "Veg Schezwan Noodles",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk15",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chilli Chicken",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk16",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Ginger Chicken",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk17",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chilli Gobi",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk18",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Ginger Gobi",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk19",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Garlic Gobi",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk20",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chicken Manchurian",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk21",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Gobi Manchurian",
    "price": 190,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk22",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chilli Mushroom",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk23",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Mushroom Manchurian",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk24",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Lemon Chicken",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk25",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chilli Paneer",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk26",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Paneer Manchurian",
    "price": 200,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk27",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Butter Chicken",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk28",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Paneer Butter Masala",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk29",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Mushroom Masala",
    "price": 210,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk30",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Kadai Chicken",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk31",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Vegetable Kurma",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk32",
    "branch_id": "b1",
    "category_id": "c13",
    "name": "Chicken Tikka Masala",
    "price": 250,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk33",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Cream of Tomato Soup",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk34",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Cream of Mushroom Soup",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk35",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Chicken Soup",
    "price": 140,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk36",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Hot and Sour Chicken Soup",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk37",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Hot and Sour Veg Soup",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk38",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Chicken Clear Soup",
    "price": 130,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk39",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Sweet Corn Chicken Soup",
    "price": 140,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk40",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Sweet Corn Veg Soup",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk41",
    "branch_id": "b1",
    "category_id": "c14",
    "name": "Mushroom Soup",
    "price": 120,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk42",
    "branch_id": "b1",
    "category_id": "c15",
    "name": "Dragon Chicken",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk43",
    "branch_id": "b1",
    "category_id": "c15",
    "name": "Chilli Beef Dry",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk44",
    "branch_id": "b1",
    "category_id": "c15",
    "name": "BDF",
    "price": 230,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk45",
    "branch_id": "b1",
    "category_id": "c15",
    "name": "Chilli Chicken Special",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk46",
    "branch_id": "b1",
    "category_id": "c15",
    "name": "Beef Roast",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk47",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Fat Boy",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk48",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Holy Chees",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk49",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Hawaiian Burger",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk50",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Cheezy Samurai",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk51",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Cheesy Loosy",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk52",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Galary Burger",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk53",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Mega Zinger",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk54",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Mac and Cheese",
    "price": 280,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk55",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Beef Patty",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk56",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Chicken Patty",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk57",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Zinger Burger",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk58",
    "branch_id": "b1",
    "category_id": "c16",
    "name": "Hole Burger",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk59",
    "branch_id": "b1",
    "category_id": "c17",
    "name": "Veg Burger",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk60",
    "branch_id": "b1",
    "category_id": "c17",
    "name": "Vegan Burger",
    "price": 250,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk61",
    "branch_id": "b1",
    "category_id": "c17",
    "name": "Veg Wrap",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk62",
    "branch_id": "b1",
    "category_id": "c17",
    "name": "Veg Club Sandwich",
    "price": 170,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk63",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "French Fries",
    "price": 100,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk64",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Peri Peri Fries",
    "price": 130,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk65",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Chicken Loaded Fries",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk66",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Chicken Strips",
    "price": 220,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk67",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Twister Wrap",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk68",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Tikka Wrap",
    "price": 210,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk69",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Chicken Crispy Wrap",
    "price": 190,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk70",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Beef Wrap",
    "price": 200,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk71",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Zinger Club Sandwich",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk72",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Chicken Club Sandwich",
    "price": 240,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk73",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Beef Subway",
    "price": 300,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk74",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Chilly Samoon",
    "price": 150,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk75",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Crispy Chicken Slider",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk76",
    "branch_id": "b1",
    "category_id": "c18",
    "name": "Beef Slider",
    "price": 350,
    "description": "",
    "isVeg": false,
    "isChefRecommendation": false
  },
  {
    "id": "fk77",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Brownie Batter",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk78",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Popcorn Shake",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk79",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Mud Coffee",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk80",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Live on Chocolate",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk81",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Hot Chocolate Sizzler",
    "price": 350,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk82",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Chocolate Crunchy",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk83",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Oreo Nut Blaster",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk84",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Bubblegum Shake",
    "price": 150,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk85",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Mango Splash",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk86",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Gud Bed",
    "price": 180,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk87",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Caramel Gold",
    "price": 160,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  },
  {
    "id": "fk88",
    "branch_id": "b1",
    "category_id": "c19",
    "name": "Dry Fruit",
    "price": 160,
    "description": "",
    "isVeg": true,
    "isChefRecommendation": false
  }
];
var alappuzhaCategories = [
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
var alappuzhaMenu = [
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

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.resolve(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
var memoryStore = {};
function getBranchFilePath(slug) {
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return path.join(DATA_DIR, `branch_${safeSlug}.json`);
}
function loadBranchData(slug) {
  const normSlug = slug.toLowerCase();
  if (memoryStore[normSlug]) {
    return memoryStore[normSlug];
  }
  const filePath = getBranchFilePath(normSlug);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.categories)) {
        memoryStore[normSlug] = parsed;
        return parsed;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err);
    }
  }
  let defaultItems = [];
  let defaultCategories = [];
  if (normSlug === "kollam") {
    defaultItems = kollamMenu.map((item) => ({
      ...item,
      branchSlug: "kollam",
      isAvailable: item.isAvailable !== false,
      isDeleted: false,
      isPurged: false
    }));
    defaultCategories = kollamCategories.map((cat) => ({
      ...cat,
      branchSlug: "kollam",
      image: void 0,
      imageUrl: void 0
    }));
  } else if (normSlug === "alappuzha") {
    defaultItems = alappuzhaMenu.map((item) => ({
      ...item,
      branchSlug: "alappuzha",
      isAvailable: item.isAvailable !== false,
      isDeleted: false,
      isPurged: false
    }));
    defaultCategories = alappuzhaCategories.map((cat) => ({
      ...cat,
      branchSlug: "alappuzha",
      image: void 0,
      imageUrl: void 0
    }));
  }
  const initialData = {
    branchSlug: normSlug,
    version: 1,
    lastUpdated: Date.now(),
    items: defaultItems,
    categories: defaultCategories
  };
  saveBranchData(initialData);
  return initialData;
}
function saveBranchData(data) {
  data.version = (data.version || 0) + 1;
  data.lastUpdated = Date.now();
  memoryStore[data.branchSlug] = data;
  const filePath = getBranchFilePath(data.branchSlug);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Failed to write file ${filePath}:`, err);
  }
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.get("/api/menu/:branchSlug", (req, res) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    res.json({
      success: true,
      branchSlug: data.branchSlug,
      version: data.version,
      lastUpdated: data.lastUpdated,
      items: data.items,
      categories: data.categories
    });
  });
  app.get("/api/menu/:branchSlug/version", (req, res) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    res.json({
      branchSlug: data.branchSlug,
      version: data.version,
      lastUpdated: data.lastUpdated
    });
  });
  app.post("/api/menu/:branchSlug/item", (req, res) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const incomingItem = req.body.item;
    if (!incomingItem || !incomingItem.id) {
      res.status(400).json({ error: "Item with ID is required" });
      return;
    }
    const idx = data.items.findIndex((i) => i.id === incomingItem.id);
    if (idx >= 0) {
      data.items[idx] = {
        ...data.items[idx],
        ...incomingItem,
        branchSlug: slug,
        updatedAt: Date.now()
      };
    } else {
      data.items.push({
        ...incomingItem,
        branchSlug: slug,
        isAvailable: incomingItem.isAvailable !== false,
        isDeleted: false,
        isPurged: false,
        createdAt: incomingItem.createdAt || Date.now(),
        updatedAt: Date.now()
      });
    }
    saveBranchData(data);
    res.json({ success: true, version: data.version, item: idx >= 0 ? data.items[idx] : incomingItem });
  });
  app.post("/api/menu/:branchSlug/reorder", (req, res) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const { reorderedItems } = req.body;
    if (Array.isArray(reorderedItems)) {
      const orderMap = /* @__PURE__ */ new Map();
      reorderedItems.forEach((r) => {
        if (r && r.id !== void 0 && r.order !== void 0) {
          orderMap.set(r.id, r.order);
        }
      });
      data.items = data.items.map((item) => {
        if (orderMap.has(item.id)) {
          return { ...item, order: orderMap.get(item.id) };
        }
        return item;
      });
      saveBranchData(data);
    }
    res.json({ success: true, version: data.version });
  });
  app.delete("/api/menu/:branchSlug/item/:itemId", (req, res) => {
    const slug = req.params.branchSlug;
    const itemId = req.params.itemId;
    const purge = req.query.purge === "true" || req.body?.purge === true;
    const data = loadBranchData(slug);
    if (purge) {
      data.items = data.items.filter((i) => i.id !== itemId);
    } else {
      data.items = data.items.map((i) => {
        if (i.id === itemId) {
          return { ...i, isDeleted: true, deletedAt: Date.now() };
        }
        return i;
      });
    }
    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });
  app.post("/api/menu/:branchSlug/item/:itemId/restore", (req, res) => {
    const slug = req.params.branchSlug;
    const itemId = req.params.itemId;
    const data = loadBranchData(slug);
    data.items = data.items.map((i) => {
      if (i.id === itemId) {
        return { ...i, isDeleted: false, isPurged: false, status: "active", deletedAt: null };
      }
      return i;
    });
    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });
  app.post("/api/menu/:branchSlug/category", (req, res) => {
    const slug = req.params.branchSlug;
    const data = loadBranchData(slug);
    const incomingCat = req.body.category;
    if (!incomingCat || !incomingCat.id) {
      res.status(400).json({ error: "Category with ID is required" });
      return;
    }
    const idx = data.categories.findIndex((c) => c.id === incomingCat.id);
    if (idx >= 0) {
      data.categories[idx] = {
        ...data.categories[idx],
        ...incomingCat,
        branchSlug: slug
      };
    } else {
      data.categories.push({
        ...incomingCat,
        branchSlug: slug
      });
    }
    saveBranchData(data);
    res.json({ success: true, version: data.version, category: incomingCat });
  });
  app.delete("/api/menu/:branchSlug/category/:categoryId", (req, res) => {
    const slug = req.params.branchSlug;
    const catId = req.params.categoryId;
    const data = loadBranchData(slug);
    data.categories = data.categories.filter((c) => c.id !== catId);
    saveBranchData(data);
    res.json({ success: true, version: data.version });
  });
  if (process.env.NODE_ENV === "production" && fs.existsSync(path.resolve(__dirname, "dist"))) {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ASADO Server active on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
