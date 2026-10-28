export interface Ingredient {
  amount: number;
  unit: string;
  item: string;
}

export interface Recipe {
  id: number;
  title: string;
  cuisine: string;
  category: string;
  diet_tags: string[];
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  difficulty: "سهل" | "متوسط" | "متقدم";
  calories: number;
  ingredients: Ingredient[];
  instructions: string[];
  chef_tip: string;
}

export interface ShoppingItem {
  id: string;
  item: string;
  amount: string;
  checked: boolean;
  recipeTitle?: string;
  category?: string;
}

export interface MealPlanDay {
  dayName: string;
  breakfast?: Recipe | null;
  lunch?: Recipe | null;
  dinner?: Recipe | null;
}
