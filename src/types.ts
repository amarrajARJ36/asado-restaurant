export interface Branch {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: 'active' | 'coming_soon';
  description?: string;
  heroImage?: string;
}

export interface Category {
  id: string;
  branch_id: string;
  name: string;
  image?: string;
}

export interface FoodItem {
  id: string;
  branch_id: string;
  category_id: string;
  name: string;
  price: number | string;
  description: string;
  image?: string;
  isVeg: boolean;
  isChefRecommendation: boolean;
}
