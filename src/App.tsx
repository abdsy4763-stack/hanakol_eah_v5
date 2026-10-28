/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CoreIngredientSearchView } from './components/CoreIngredientSearchView.tsx';
import { AllRecipesView } from './components/AllRecipesView.tsx';
import { PermanentPantryView } from './components/PermanentPantryView.tsx';
import { MealPlannerView } from './components/MealPlannerView.tsx';
import { ShoppingListView } from './components/ShoppingListView.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { RecipeDetailModal } from './components/RecipeDetailModal.tsx';
import { RecipePickerModal } from './components/RecipePickerModal.tsx';
import { Recipe, ShoppingItem, MealPlanDay, Ingredient } from './types.ts';
import { UtensilsCrossed, Check } from 'lucide-react';

const INITIAL_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const DEFAULT_PANTRY_ITEMS = [
  'ملح',
  'فلفل أسود',
  'زيت زيتون',
  'سمنة',
  'بهارات مشكلة',
  'سكر',
  'طحين',
  'خل',
  'ماء',
  'بصل',
  'ثوم',
  'كمون',
  'كزبرة يابسة',
  'قرفة'
];

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // PRIMARY CORE VIEW IS DEFAULT: 'search'
  const [activeTab, setActiveTab] = useState<string>('search');
  
  // Selected recipe for detail modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pantry staples state (persisted)
  const [pantryItems, setPantryItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hanakel_pantry');
      return saved ? JSON.parse(saved) : DEFAULT_PANTRY_ITEMS;
    } catch {
      return DEFAULT_PANTRY_ITEMS;
    }
  });

  // Favorites state (persisted)
  const [favorites, setFavorites] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hanakel_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Shopping list state (persisted)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('hanakel_shopping');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Weekly Meal Plan state (persisted)
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => {
    try {
      const saved = localStorage.getItem('hanakel_mealplan');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DAYS.map((d) => ({
      dayName: d,
      breakfast: null,
      lunch: null,
      dinner: null,
    }));
  });

  // Recipe picker modal for meal planning
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    dayIndex: number;
    mealType: 'breakfast' | 'lunch' | 'dinner';
  }>({
    isOpen: false,
    dayIndex: 0,
    mealType: 'lunch',
  });

  // Fetch 2150+ recipes from public/recipes.json
  useEffect(() => {
    fetch('/recipes.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data: Recipe[]) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching recipes.json', err);
        setLoading(false);
      });
  }, []);

  // Save pantry items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hanakel_pantry', JSON.stringify(pantryItems));
    } catch (e) {
      console.error(e);
    }
  }, [pantryItems]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hanakel_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Save shopping list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hanakel_shopping', JSON.stringify(shoppingList));
    } catch (e) {
      console.error(e);
    }
  }, [shoppingList]);

  // Save meal plan to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hanakel_mealplan', JSON.stringify(mealPlan));
    } catch (e) {
      console.error(e);
    }
  }, [mealPlan]);

  // Favorite toggle handler
  const handleToggleFavorite = (recipe: Recipe) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[recipe.id]) {
        delete updated[recipe.id];
        showToast(`تمت إزالة "${recipe.title}" من المفضلة`);
      } else {
        updated[recipe.id] = true;
        showToast(`تم حفظ "${recipe.title}" في المفضلة`);
      }
      return updated;
    });
  };

  // Add missing ingredients directly from recipe card to shopping list
  const handleAddMissingToShopping = (missingItems: string[], recipeTitle: string) => {
    setShoppingList((prev) => {
      const newItems: ShoppingItem[] = missingItems.map((item) => ({
        id: Math.random().toString(36).substring(2, 9),
        item: item,
        amount: 'حسب الوصفة',
        checked: false,
        recipeTitle: recipeTitle,
      }));
      return [...prev, ...newItems];
    });
    showToast(`تمت إضافة ${missingItems.length} نواقص لقائمة التسوق بنجاح!`);
  };

  // Add all ingredients from detailed modal to shopping list
  const handleAddIngredientsToShopping = (ingredients: Ingredient[], recipeTitle: string) => {
    setShoppingList((prev) => {
      const newItems: ShoppingItem[] = ingredients.map((ing) => ({
        id: Math.random().toString(36).substring(2, 9),
        item: ing.item,
        amount: `${ing.amount} ${ing.unit}`,
        checked: false,
        recipeTitle: recipeTitle,
      }));
      return [...prev, ...newItems];
    });
    showToast(`تمت إضافة مقادير "${recipeTitle}" لقائمة التسوق`);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddCustomShoppingItem = (name: string, amount: string) => {
    setShoppingList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        item: name,
        amount: amount || 'حسب الرغبة',
        checked: false,
      },
    ]);
  };

  const handleClearCompletedShopping = () => {
    setShoppingList((prev) => prev.filter((i) => !i.checked));
  };

  const handleClearAllShopping = () => {
    setShoppingList([]);
  };

  // Pantry handlers
  const handleAddPantryItem = (item: string) => {
    if (!pantryItems.includes(item)) {
      setPantryItems([...pantryItems, item]);
      showToast(`تمت إضافة "${item}" لمخزن المنزل`);
    }
  };

  const handleRemovePantryItem = (item: string) => {
    setPantryItems(pantryItems.filter((i) => i !== item));
  };

  const handleResetPantryDefaults = () => {
    setPantryItems(DEFAULT_PANTRY_ITEMS);
    showToast('تمت استعادة مواد المخزن الأساسية');
  };

  // Meal Planner handlers
  const handleRemoveMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setMealPlan((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [mealType]: null,
      };
      return updated;
    });
  };

  const handleAddToMealPlan = (recipe: Recipe, day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setMealPlan((prev) =>
      prev.map((d) => (d.dayName === day ? { ...d, [mealType]: recipe } : d))
    );
    showToast(`تمت إضافة "${recipe.title}" لجدول ${day} (${mealType === 'breakfast' ? 'فطور' : mealType === 'lunch' ? 'غداء' : 'عشاء'})`);
  };

  const handleAutoGeneratePlan = () => {
    if (recipes.length === 0) return;
    
    // Strict culinary categorization:
    // Lunch MUST ALWAYS be a main savory dish ("وجبة رئيسية")
    const mainLunchDishes = recipes.filter((r) => r.category === 'وجبة رئيسية');
    const syrianLunch = mainLunchDishes.filter((r) => r.cuisine.includes('سوري'));
    const lunchPool = syrianLunch.length > 0 ? syrianLunch : mainLunchDishes;

    // Breakfast: breakfast and light pastries ("فطور وعشاء" أو "معجنات ومخبوزات")
    const breakfastPool = recipes.filter(
      (r) => r.category === 'فطور وعشاء' || r.category === 'معجنات ومخبوزات'
    );

    // Dinner: light savory dinner, soups, or quick main dishes (NEVER desserts!)
    const dinnerPool = recipes.filter(
      (r) => r.category !== 'حلويات ومشروبات' && (
        r.category === 'فطور وعشاء' || 
        r.category === 'شوربات' || 
        (r.category === 'وجبة رئيسية' && r.total_time <= 40)
      )
    );

    const randomPick = (arr: Recipe[]) => arr[Math.floor(Math.random() * arr.length)];

    setMealPlan(
      INITIAL_DAYS.map((d) => ({
        dayName: d,
        breakfast: randomPick(breakfastPool.length > 0 ? breakfastPool : recipes),
        lunch: randomPick(lunchPool.length > 0 ? lunchPool : recipes),
        dinner: randomPick(dinnerPool.length > 0 ? dinnerPool : recipes),
      }))
    );
    showToast('تم توليد خطة وجبات أسبوعية مقترحة متوازنة (الغداء طبخات رئيسية)!');
  };

  const handleClearPlan = () => {
    setMealPlan(
      INITIAL_DAYS.map((d) => ({
        dayName: d,
        breakfast: null,
        lunch: null,
        dinner: null,
      }))
    );
  };

  const handleGenerateShoppingListFromPlan = () => {
    const plannedRecipes: Recipe[] = [];
    mealPlan.forEach((d) => {
      if (d.breakfast) plannedRecipes.push(d.breakfast);
      if (d.lunch) plannedRecipes.push(d.lunch);
      if (d.dinner) plannedRecipes.push(d.dinner);
    });

    if (plannedRecipes.length === 0) {
      showToast('لا توجد وجبات مجدولة في الخطة بعد!');
      return;
    }

    setShoppingList((prev) => {
      const newItems: ShoppingItem[] = [];
      plannedRecipes.forEach((recipe) => {
        recipe.ingredients.forEach((ing) => {
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            item: ing.item,
            amount: `${ing.amount} ${ing.unit}`,
            checked: false,
            recipeTitle: recipe.title,
          });
        });
      });
      return [...prev, ...newItems];
    });
    showToast('تم نقل مقادير وجبات الأسبوع إلى قائمة التسوق!');
  };

  const favoritesCount = Object.keys(favorites).length;
  const shoppingCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/20 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoritesCount}
        shoppingCount={shoppingCount}
        totalRecipesCount={recipes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-base font-bold text-stone-700">
              جاري تجهيز موسوعة الطبخ السوري والعربي (2,150+ وصفة)...
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: THE CORE APP EXPERIENCE: Ingredient Search & Matching */}
            {activeTab === 'search' && (
              <CoreIngredientSearchView
                recipes={recipes}
                pantryItems={pantryItems}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={setSelectedRecipe}
                onAddMissingToShopping={handleAddMissingToShopping}
                onAddToMealPlan={handleAddToMealPlan}
              />
            )}

            {/* TAB 2: All Recipes Explorer (2,150+ with comprehensive filters) */}
            {activeTab === 'all' && (
              <AllRecipesView
                recipes={recipes}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={setSelectedRecipe}
              />
            )}

            {/* TAB 3: Permanent Pantry Staples */}
            {activeTab === 'pantry' && (
              <PermanentPantryView
                pantryItems={pantryItems}
                onAddPantryItem={handleAddPantryItem}
                onRemovePantryItem={handleRemovePantryItem}
                onResetPantryDefaults={handleResetPantryDefaults}
              />
            )}

            {/* TAB 4: Weekly Meal Planner */}
            {activeTab === 'planner' && (
              <MealPlannerView
                mealPlan={mealPlan}
                onRemoveMeal={handleRemoveMeal}
                onAutoGeneratePlan={handleAutoGeneratePlan}
                onClearPlan={handleClearPlan}
                onGenerateShoppingListFromPlan={handleGenerateShoppingListFromPlan}
                onSelectRecipe={setSelectedRecipe}
                onOpenRecipePicker={(dayIndex, mealType) =>
                  setPickerState({ isOpen: true, dayIndex, mealType })
                }
              />
            )}

            {/* TAB 5: Favorites */}
            {activeTab === 'favorites' && (
              <FavoritesView
                favorites={favorites}
                recipes={recipes}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={setSelectedRecipe}
                onBrowseAll={() => setActiveTab('all')}
              />
            )}

            {/* TAB 6: Shopping List */}
            {activeTab === 'shopping' && (
              <ShoppingListView
                items={shoppingList}
                onToggleItem={handleToggleShoppingItem}
                onDeleteItem={handleDeleteShoppingItem}
                onAddItem={handleAddCustomShoppingItem}
                onClearCompleted={handleClearCompletedShopping}
                onClearAll={handleClearAllShopping}
              />
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorite={!!favorites[selectedRecipe.id]}
          onToggleFavorite={handleToggleFavorite}
          onAddToShoppingList={handleAddIngredientsToShopping}
          onAddToMealPlan={handleAddToMealPlan}
        />
      )}

      {/* Recipe Picker Modal for Meal Plan */}
      {pickerState.isOpen && (
        <RecipePickerModal
          isOpen={pickerState.isOpen}
          onClose={() => setPickerState((prev) => ({ ...prev, isOpen: false }))}
          recipes={recipes}
          mealType={pickerState.mealType}
          title={`اختيار وجبة ليوم ${INITIAL_DAYS[pickerState.dayIndex]} (${pickerState.mealType === 'breakfast' ? 'فطور' : pickerState.mealType === 'lunch' ? 'غداء' : 'عشاء'})`}
          onSelect={(recipe) => {
            handleAddToMealPlan(recipe, INITIAL_DAYS[pickerState.dayIndex], pickerState.mealType);
          }}
        />
      )}

      {/* Clean Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-500 space-y-2 no-print">
        <div className="flex items-center justify-center gap-2 font-bold text-stone-700">
          <UtensilsCrossed className="w-4 h-4 text-amber-600" />
          <span>هناكل إيه؟ - المساعد الذكي لاقتراح الوجبات والمكتبة الشاملة للطبخ السوري والعربي</span>
        </div>
        <p>
          أكثر من 2,150 وصفة حقيقية بمقادير دقيقة، وخطوات مفصلة، ومطابقة ذكية للمكونات المتوفرة لديك في المطبخ.
        </p>
      </footer>

    </div>
  );
}
