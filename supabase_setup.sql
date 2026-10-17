-- ==============================================================
-- ASADO RESTAURANT: SUPABASE DATABASE INITIALIZATION & SCHEMA
-- Run this complete script in Supabase Dashboard -> SQL Editor
-- ==============================================================

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    hero_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    branch_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    branch_slug TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT,
    is_veg BOOLEAN DEFAULT FALSE,
    is_chef_recommendation BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Promotional Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    branch_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    tag_text TEXT DEFAULT 'Special',
    tag_bg TEXT DEFAULT 'bg-amber-200',
    tag_color TEXT DEFAULT 'text-amber-900',
    bg_color TEXT DEFAULT 'bg-amber-50',
    text_color TEXT DEFAULT 'text-amber-950',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. Create Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id TEXT PRIMARY KEY,
    branch_slug TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 6. Create Open Public Access Policies (Allow read/write for site & admin panel)
DROP POLICY IF EXISTS "Public access branches" ON public.branches;
CREATE POLICY "Public access branches" ON public.branches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access categories" ON public.categories;
CREATE POLICY "Public access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access menu_items" ON public.menu_items;
CREATE POLICY "Public access menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access banners" ON public.banners;
CREATE POLICY "Public access banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access gallery_images" ON public.gallery_images;
CREATE POLICY "Public access gallery_images" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

-- 7. Create Storage Bucket for Menu & Category Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Public storage upload" ON storage.objects;
CREATE POLICY "Public storage upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
CREATE POLICY "Public storage update" ON storage.objects FOR UPDATE USING (bucket_id = 'restaurant-assets');

DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;
CREATE POLICY "Public storage delete" ON storage.objects FOR DELETE USING (bucket_id = 'restaurant-assets');

-- ==============================================================
-- SEED DATA: Branches
-- ==============================================================
INSERT INTO public.branches (id, name, slug, city, status, description, hero_image)
VALUES 
  ('b1', 'Kollam', 'kollam', 'Kollam', 'active', 'Lake View • Boating • Events • Signature BBQ', 'https://images.unsplash.com/photo-1543418215-685d0d8dc821?q=80&w=2938&auto=format&fit=crop'),
  ('b2', 'Alappuzha', 'alappuzha', 'Alappuzha', 'active', 'Backwater Experience • Family Dining • Premium Ambience', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2864&auto=format&fit=crop'),
  ('b3', 'Varkala', 'varkala', 'Varkala', 'coming_soon', 'Experience Asado Above the Cliffs • Opening 2026', 'https://images.unsplash.com/photo-1592657279768-3dce46b1f062?q=80&w=2940&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  city = EXCLUDED.city,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image;

-- ==============================================================
-- SEED DATA: Kollam Categories
-- ==============================================================
INSERT INTO public.categories (id, branch_slug, name, order_num)
VALUES
  ('c11', 'kollam', 'Fried Rice', 0),
  ('c12', 'kollam', 'Noodles', 1),
  ('c14', 'kollam', 'Soup', 2),
  ('c13', 'kollam', 'Gravy Items', 3),
  ('c15', 'kollam', 'Special Items', 4),
  ('c16', 'kollam', 'Burgers', 5),
  ('c17', 'kollam', 'Veg Burgers & Wraps', 6),
  ('c18', 'kollam', 'Starters', 7),
  ('c114', 'kollam', 'Barbeque', 8),
  ('c115', 'kollam', 'Breads', 9),
  ('c116', 'kollam', 'Asado Special Platters', 10),
  ('c120', 'kollam', 'Asado Special Rice Items', 11),
  ('c111', 'kollam', 'Mocktails', 12),
  ('c112', 'kollam', 'Shakes', 13),
  ('c113', 'kollam', 'Fresh Juice', 14),
  ('c19', 'kollam', 'Asado Desserts & Specials', 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  branch_slug = EXCLUDED.branch_slug,
  order_num = EXCLUDED.order_num;

-- ==============================================================
-- SEED DATA: Kollam Menu Items (145 dishes)
-- ==============================================================
INSERT INTO public.menu_items (id, branch_slug, category_id, category, name, price, description, is_veg, is_chef_recommendation, is_available, order_num)
VALUES
  ('fk1', 'kollam', 'c11', 'Fried Rice', 'Chicken Fried Rice', '250', '', false, false, true, 0),
  ('fk2', 'kollam', 'c11', 'Fried Rice', 'Egg Fried Rice', '210', '', false, false, true, 1),
  ('fk3', 'kollam', 'c11', 'Fried Rice', 'Veg Fried Rice', '200', '', true, false, true, 2),
  ('fk4', 'kollam', 'c11', 'Fried Rice', 'Schezwan Fried Rice Chicken', '260', '', false, false, true, 3),
  ('fk5', 'kollam', 'c11', 'Fried Rice', 'Schezwan Fried Rice Veg', '220', '', true, false, true, 4),
  ('fk6', 'kollam', 'c11', 'Fried Rice', 'Schezwan Egg Fried Rice', '210', '', false, false, true, 5),
  ('fk8', 'kollam', 'c11', 'Fried Rice', 'Triple Chicken Fried Rice', '330', '', false, false, true, 6),
  ('fk9', 'kollam', 'c12', 'Noodles', 'Chicken Noodles', '250', '', false, false, true, 7),
  ('fk10', 'kollam', 'c12', 'Noodles', 'Egg Noodles', '210', '', false, false, true, 8),
  ('fk11', 'kollam', 'c12', 'Noodles', 'Veg Noodles', '200', '', true, false, true, 9),
  ('fk7', 'kollam', 'c12', 'Noodles', 'Schezwan Noodles Chicken', '280', '', false, false, true, 10),
  ('fk12', 'kollam', 'c12', 'Noodles', 'Schezwan Noodles Egg', '210', '', false, false, true, 11),
  ('fk13', 'kollam', 'c12', 'Noodles', 'Schezwan Noodles Veg', '220', '', true, false, true, 12),
  ('fk14', 'kollam', 'c12', 'Noodles', 'Mixed Noodles', '280', '', false, false, true, 13),
  ('fk15', 'kollam', 'c12', 'Noodles', 'Schezwan Noodles Mixed', '300', '', false, false, true, 14),
  ('fk33', 'kollam', 'c14', 'Soup', 'Cream Of Tomato Soup', '180', '', true, false, true, 15),
  ('fk34', 'kollam', 'c14', 'Soup', 'Cream Of Mushroom Soup', '180', '', true, false, true, 16),
  ('fk16', 'kollam', 'c14', 'Soup', 'Hot & Sour Chicken Soup', '180', '', false, false, true, 17),
  ('fk17', 'kollam', 'c14', 'Soup', 'Hot & Sour Veg Soup', '150', '', true, false, true, 18),
  ('fk38', 'kollam', 'c14', 'Soup', 'Chicken Clear Soup', '150', '', false, false, true, 19),
  ('fk39', 'kollam', 'c14', 'Soup', 'Sweet Corn Chicken Soup', '150', '', false, false, true, 20),
  ('fk40', 'kollam', 'c14', 'Soup', 'Sweet Corn Veg Soup', '140', '', true, false, true, 21),
  ('fk41', 'kollam', 'c14', 'Soup', 'Mushroom Soup', '120', '', true, false, true, 22),
  ('fk18', 'kollam', 'c13', 'Gravy Items', 'Chilly Chicken', '250', '', false, false, true, 23),
  ('fk19', 'kollam', 'c13', 'Gravy Items', 'Chilly Gobi', '200', '', true, false, true, 24),
  ('fk20', 'kollam', 'c13', 'Gravy Items', 'Ginger Chicken', '260', '', false, false, true, 25),
  ('fk21', 'kollam', 'c13', 'Gravy Items', 'Ginger Gobi', '180', '', true, false, true, 26),
  ('fk22', 'kollam', 'c13', 'Gravy Items', 'Garlic Gobi', '180', '', true, false, true, 27),
  ('fk23', 'kollam', 'c13', 'Gravy Items', 'Chicken Manchurian', '250', '', false, false, true, 28),
  ('fk24', 'kollam', 'c13', 'Gravy Items', 'Gobi Manchurian', '180', '', true, false, true, 29),
  ('fk25', 'kollam', 'c13', 'Gravy Items', 'Chilly Mushroom', '190', '', true, false, true, 30),
  ('fk26', 'kollam', 'c13', 'Gravy Items', 'Mushroom Manchurian', '230', '', true, false, true, 31),
  ('fk27', 'kollam', 'c13', 'Gravy Items', 'Lemon Chicken', '250', '', false, false, true, 32),
  ('fk28', 'kollam', 'c13', 'Gravy Items', 'Chilly Paneer', '190', '', true, false, true, 33),
  ('fk29', 'kollam', 'c13', 'Gravy Items', 'Paneer Manchurian', '190', '', true, false, true, 34),
  ('fk30', 'kollam', 'c13', 'Gravy Items', 'Paneer Butter Masala', '200', '', true, false, true, 35),
  ('fk31', 'kollam', 'c13', 'Gravy Items', 'Butter Chicken', '280', '', false, false, true, 36),
  ('fk32', 'kollam', 'c13', 'Gravy Items', 'Mushroom Masala', '240', '', true, false, true, 37),
  ('fk35', 'kollam', 'c13', 'Gravy Items', 'Veg Kurma', '180', '', true, false, true, 38),
  ('fk36', 'kollam', 'c13', 'Gravy Items', 'Kadai Chicken', '280', '', false, false, true, 39),
  ('fk37', 'kollam', 'c13', 'Gravy Items', 'Chicken Tikka Masala', '300', '', false, false, true, 40),
  ('fk42', 'kollam', 'c15', 'Special Items', 'Dragon Chicken', '260', '', false, false, true, 41),
  ('fk43', 'kollam', 'c15', 'Special Items', 'Chilly Beef', '280', '', false, false, true, 42),
  ('fk44', 'kollam', 'c15', 'Special Items', 'BDF', '280', '', false, false, true, 43),
  ('fk46', 'kollam', 'c15', 'Special Items', 'Beef Roast', '260', '', false, false, true, 44),
  ('fk45', 'kollam', 'c16', 'Burgers', 'Holy Cheese Burger', '300', '', false, false, true, 45),
  ('fk50', 'kollam', 'c16', 'Burgers', 'Cheezy Samurai', '300', '', false, false, true, 46),
  ('fk47', 'kollam', 'c16', 'Burgers', 'Cheezy Lucy', '300', '', false, false, true, 47),
  ('fk48', 'kollam', 'c16', 'Burgers', 'Galaxy Burger', '300', '', false, false, true, 48),
  ('fk49', 'kollam', 'c16', 'Burgers', 'Mega Zinger Burger', '300', '', false, false, true, 49),
  ('fk51', 'kollam', 'c16', 'Burgers', 'Beef Patty Burger', '230', '', false, false, true, 50),
  ('fk52', 'kollam', 'c16', 'Burgers', 'Chicken Patty Burger', '220', '', false, false, true, 51),
  ('fk57', 'kollam', 'c16', 'Burgers', 'Zinger Burger', '220', '', false, false, true, 52),
  ('fk59', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Veg Burger', '170', '', true, false, true, 53),
  ('fk60', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Vegan Burger', '270', '', true, false, true, 54),
  ('fk58', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Hole Burger', '230', '', true, false, true, 55),
  ('fk61', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Veg Wrap', '170', '', true, false, true, 56),
  ('fk53', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Vegetable Club Sandwich', '200', '', true, false, true, 57),
  ('fk72', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Chicken Club Sandwich', '250', '', false, false, true, 58),
  ('fk71', 'kollam', 'c17', 'Veg Burgers & Wraps', 'Zinger Club Sandwich', '300', '', false, false, true, 59),
  ('fk63', 'kollam', 'c18', 'Starters', 'French Fries', '130', '', true, false, true, 60),
  ('fk64', 'kollam', 'c18', 'Starters', 'Peri Peri Fries', '159', '', true, false, true, 61),
  ('fk65', 'kollam', 'c18', 'Starters', 'Chicken Loaded Fries', '250', '', false, false, true, 62),
  ('fk66', 'kollam', 'c18', 'Starters', 'Chicken Strips', '250', '', false, false, true, 63),
  ('fk67', 'kollam', 'c18', 'Starters', 'Twister Wrap', '220', '', false, false, true, 64),
  ('fk68', 'kollam', 'c18', 'Starters', 'Tikka Wrap', '240', '', false, false, true, 65),
  ('fk69', 'kollam', 'c18', 'Starters', 'Chicken Crispy Wrap', '240', '', false, false, true, 66),
  ('fk70', 'kollam', 'c18', 'Starters', 'Beef Wrap', '230', '', false, false, true, 67),
  ('fk74', 'kollam', 'c18', 'Starters', 'Chilly Samoon', '170', '', false, false, true, 68),
  ('fk120', 'kollam', 'c114', 'Barbeque', 'Chicken Tikka', '350', '', false, false, true, 69),
  ('fk54', 'kollam', 'c114', 'Barbeque', 'Chicken Tikka (Half)', '170', '', false, false, true, 70),
  ('fk121', 'kollam', 'c114', 'Barbeque', 'Chicken Wings', '350', '', false, false, true, 71),
  ('fk55', 'kollam', 'c114', 'Barbeque', 'Chicken Wings (Half)', '190', '', false, false, true, 72),
  ('fk56', 'kollam', 'c114', 'Barbeque', 'Chicken Kabab', '260', '', false, false, true, 73),
  ('fk62', 'kollam', 'c114', 'Barbeque', 'Chicken Kabab (Half)', '150', '', false, false, true, 74),
  ('fk73', 'kollam', 'c114', 'Barbeque', 'Beef Kabab', '280', '', false, false, true, 75),
  ('fk75', 'kollam', 'c114', 'Barbeque', 'Beef Kabab (Half)', '150', '', false, false, true, 76),
  ('fk76', 'kollam', 'c114', 'Barbeque', 'Peri Peri Al Faham (Full)', '650', '', false, false, true, 77),
  ('fk77', 'kollam', 'c114', 'Barbeque', 'Peri Peri Al Faham (Half)', '350', '', false, false, true, 78),
  ('fk78', 'kollam', 'c114', 'Barbeque', 'Peri Peri Al Faham (Qtr Leg)', '160', '', false, false, true, 79),
  ('fk79', 'kollam', 'c114', 'Barbeque', 'Peri Peri Al Faham (Qtr Chest)', '190', '', false, false, true, 80),
  ('fk80', 'kollam', 'c114', 'Barbeque', 'Arabic Al Faham (Full)', '650', '', false, false, true, 81),
  ('fk81', 'kollam', 'c114', 'Barbeque', 'Arabic Al Faham (Half)', '325', '', false, false, true, 82),
  ('fk82', 'kollam', 'c114', 'Barbeque', 'Arabic Al Faham (Qtr Chest)', '160', '', false, false, true, 83),
  ('fk83', 'kollam', 'c114', 'Barbeque', 'Arabic Al Faham (Qtr Leg)', '160', '', false, false, true, 84),
  ('fk125', 'kollam', 'c115', 'Breads', 'Butter Naan', '35', '', true, false, true, 85),
  ('fk126', 'kollam', 'c115', 'Breads', 'Plain Naan', '30', '', true, false, true, 86),
  ('fk84', 'kollam', 'c115', 'Breads', 'Kuboos', '15', '', true, false, true, 87),
  ('fk85', 'kollam', 'c115', 'Breads', 'Romali Rotti', '15', '', true, false, true, 88),
  ('fk86', 'kollam', 'c116', 'Asado Special Platters', 'Mixed Grill (Full)', '2800', '', false, false, true, 89),
  ('fk87', 'kollam', 'c116', 'Asado Special Platters', 'Mixed Grill (Half)', '1800', '', false, false, true, 90),
  ('fk88', 'kollam', 'c116', 'Asado Special Platters', 'Mixed Platter (Quarter)', '1200', '', false, false, true, 91),
  ('fk89', 'kollam', 'c120', 'Asado Special Rice Items', 'Asado Beef Rib', '400', '', false, false, true, 92),
  ('fk90', 'kollam', 'c120', 'Asado Special Rice Items', 'Maqlooba (Full)', '800', '', false, false, true, 93),
  ('fk91', 'kollam', 'c120', 'Asado Special Rice Items', 'Maqlooba (Half)', '400', '', false, false, true, 94),
  ('fk92', 'kollam', 'c120', 'Asado Special Rice Items', 'Maqlooba (Quarter)', '200', '', false, false, true, 95),
  ('fk93', 'kollam', 'c120', 'Asado Special Rice Items', 'Maqlooba Rice', '120', '', false, false, true, 96),
  ('fk94', 'kollam', 'c120', 'Asado Special Rice Items', 'Zurbiyan Beef', '290', '', false, false, true, 97),
  ('fk95', 'kollam', 'c120', 'Asado Special Rice Items', 'Zurbiyan Chicken', '250', '', false, false, true, 98),
  ('fk96', 'kollam', 'c120', 'Asado Special Rice Items', 'Zurbiyan Rice Extra', '120', '', false, false, true, 99),
  ('fk97', 'kollam', 'c111', 'Mocktails', 'Dry Fruit Smoothie', '200', '', true, false, true, 100),
  ('fk98', 'kollam', 'c111', 'Mocktails', 'Red Chill', '100', '', true, false, true, 101),
  ('fk99', 'kollam', 'c111', 'Mocktails', 'Blue Lime', '100', '', true, false, true, 102),
  ('fk100', 'kollam', 'c111', 'Mocktails', 'Mango Mojito', '130', '', true, false, true, 103),
  ('fk101', 'kollam', 'c111', 'Mocktails', 'Guava Mojito', '130', '', true, false, true, 104),
  ('fk102', 'kollam', 'c111', 'Mocktails', 'Black Currant Mojito', '130', '', true, false, true, 105),
  ('fk103', 'kollam', 'c111', 'Mocktails', 'Blue Ocean', '130', '', true, false, true, 106),
  ('fk104', 'kollam', 'c111', 'Mocktails', 'Litchi Mojito', '130', '', true, false, true, 107),
  ('fk105', 'kollam', 'c111', 'Mocktails', 'Peach Ice Tea', '150', '', true, false, true, 108),
  ('fk106', 'kollam', 'c111', 'Mocktails', 'Virgin Mojito', '130', '', true, false, true, 109),
  ('fk107', 'kollam', 'c112', 'Shakes', 'Avocado Shake', '160', '', true, false, true, 110),
  ('fk108', 'kollam', 'c112', 'Shakes', 'Papaya Shake', '140', '', true, false, true, 111),
  ('fk109', 'kollam', 'c112', 'Shakes', 'Chikku Shake', '130', '', true, false, true, 112),
  ('fk110', 'kollam', 'c112', 'Shakes', 'Muskmelon Shake', '130', '', true, false, true, 113),
  ('fk111', 'kollam', 'c112', 'Shakes', 'Rose Vanilla', '100', '', true, false, true, 114),
  ('fk112', 'kollam', 'c112', 'Shakes', 'Vanilla Shake', '130', '', true, false, true, 115),
  ('fk113', 'kollam', 'c112', 'Shakes', 'Chocolate Shake', '130', '', true, false, true, 116),
  ('fk114', 'kollam', 'c112', 'Shakes', 'Oreo Shake', '130', '', true, false, true, 117),
  ('fk115', 'kollam', 'c112', 'Shakes', 'Blueberry Shake', '120', '', true, false, true, 118),
  ('fk116', 'kollam', 'c112', 'Shakes', 'Banana Shake', '120', '', true, false, true, 119),
  ('fk117', 'kollam', 'c112', 'Shakes', 'Badam Milk Shake', '100', '', true, false, true, 120),
  ('fk118', 'kollam', 'c112', 'Shakes', 'Apple Shake', '140', '', true, false, true, 121),
  ('fk119', 'kollam', 'c112', 'Shakes', 'Strawberry Shake', '120', '', true, false, true, 122),
  ('fk122', 'kollam', 'c112', 'Shakes', 'Cold Coffee', '120', '', true, false, true, 123),
  ('fk123', 'kollam', 'c112', 'Shakes', 'Mohabath Ka Sharbat', '100', '', true, false, true, 124),
  ('fk124', 'kollam', 'c113', 'Fresh Juice', 'Cocktail Fresh Juice', '150', '', true, false, true, 125),
  ('fk127', 'kollam', 'c113', 'Fresh Juice', 'Papaya Fresh Juice', '110', '', true, false, true, 126),
  ('fk128', 'kollam', 'c113', 'Fresh Juice', 'Orange Fresh Juice', '110', '', true, false, true, 127),
  ('fk129', 'kollam', 'c113', 'Fresh Juice', 'Watermelon Fresh Juice', '80', '', true, false, true, 128),
  ('fk130', 'kollam', 'c113', 'Fresh Juice', 'Pineapple Fresh Juice', '110', '', true, false, true, 129),
  ('fk131', 'kollam', 'c113', 'Fresh Juice', 'Grape Fresh Juice', '110', '', true, false, true, 130),
  ('fk132', 'kollam', 'c113', 'Fresh Juice', 'Mango Fresh Juice', '110', '', true, false, true, 131),
  ('fk133', 'kollam', 'c113', 'Fresh Juice', 'Muskmelon Fresh Juice', '110', '', true, false, true, 132),
  ('fk134', 'kollam', 'c19', 'Asado Desserts & Specials', 'Brownie Batter', '180', '', true, false, true, 133),
  ('fk135', 'kollam', 'c19', 'Asado Desserts & Specials', 'Popcorn Shake', '150', '', true, false, true, 134),
  ('fk136', 'kollam', 'c19', 'Asado Desserts & Specials', 'Mud Coffee', '180', '', true, false, true, 135),
  ('fk137', 'kollam', 'c19', 'Asado Desserts & Specials', 'Live On Chocolate', '180', '', true, false, true, 136),
  ('fk138', 'kollam', 'c19', 'Asado Desserts & Specials', 'Chocolate Crunchy', '180', '', true, false, true, 137),
  ('fk139', 'kollam', 'c19', 'Asado Desserts & Specials', 'Oreo Nut Blaster', '180', '', true, false, true, 138),
  ('fk140', 'kollam', 'c19', 'Asado Desserts & Specials', 'Bubblegum Shake', '180', '', true, false, true, 139),
  ('fk141', 'kollam', 'c19', 'Asado Desserts & Specials', 'Mango Splash', '210', '', true, false, true, 140),
  ('fk142', 'kollam', 'c19', 'Asado Desserts & Specials', 'Watermelon Family Sundae', '410', '', true, false, true, 141),
  ('fk143', 'kollam', 'c19', 'Asado Desserts & Specials', 'Choco Nut Sundae', '210', '', true, false, true, 142),
  ('fk144', 'kollam', 'c19', 'Asado Desserts & Specials', 'Dry Fruit Mix', '220', '', true, false, true, 143),
  ('fk145', 'kollam', 'c19', 'Asado Desserts & Specials', 'Apple Sundae', '210', '', true, false, true, 144)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  is_veg = EXCLUDED.is_veg,
  is_chef_recommendation = EXCLUDED.is_chef_recommendation,
  is_available = EXCLUDED.is_available,
  order_num = EXCLUDED.order_num;
