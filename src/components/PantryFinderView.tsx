import React, { useState, useMemo } from 'react';
import { 
  Refrigerator, 
  Plus, 
  X, 
  Sparkles, 
  Check, 
  Search, 
  RotateCcw
} from 'lucide-react';
import { Recipe } from '../types.ts';
import { RecipeCard } from './RecipeCard.tsx';

interface PantryFinderViewProps {
  recipes: Recipe[];
  favorites: Record<number, boolean>;
  onToggleFavorite: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const PantryFinderView: React.FC<PantryFinderViewProps> = ({
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
}) => {
  const commonIngredients = [
    'لحم',
    'دجاج',
    'لبن زبادي',
    'أرز',
    'برغل',
    'بطاطا',
    'بصل',
    'ثوم',
    'طماطم',
    'باذنجان',
    'كوسا',
    'عدس',
    'حمص',
    'ملوخية',
    'سبانخ',
    'بيض',
    'طحينة',
    'زيت زيتون',
    'سمنة',
    'كزبرة',
    'دبس رمان',
    'معكرونة',
    'سمك'
  ];

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['لحم', 'لبن زبادي']);
  const [customInput, setCustomInput] = useState<string>('');

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const addCustomIngredient = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients((prev) => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  // Find recipes matching ingredients and sort by number of matched ingredients
  const matchedRecipes = useMemo(() => {
    if (selectedIngredients.length === 0) return [];

    const scored = recipes.map((recipe) => {
      let matchCount = 0;
      selectedIngredients.forEach((sel) => {
        const hasMatch = recipe.ingredients.some((i) => 
          i.item?.toLowerCase().includes(sel?.toLowerCase())
        );
        if (hasMatch) matchCount++;
      });
      return {
        recipe,
        matchCount,
        matchPercent: Math.round((matchCount / Math.max(1, selectedIngredients.length)) * 100),
      };
    });

    return scored
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || a.recipe.total_time - b.recipe.total_time)
      .slice(0, 36)
      .map((s) => s.recipe);
  }, [recipes, selectedIngredients]);

  return (
    <div className="space-y-6">
      
      {/* Header Box */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Refrigerator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              ماذا يوجد في ثلاجتك أو مؤونة منزلك اليوم؟ 🧊
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              اختر المكونات المتوفرة لديك حالياً، وسنستخرج لك أشهى الطبخات التي يمكنك إعدادها فوراً
            </p>
          </div>
        </div>

        {/* Selected Ingredients Tag Bar */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              المكونات المحددة حالياً ({selectedIngredients.length}):
            </span>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                مسح الكل
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs"
              >
                <span>{ing}</span>
                <button
                  type="button"
                  onClick={() => toggleIngredient(ing)}
                  className="hover:text-amber-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedIngredients.length === 0 && (
              <span className="text-xs text-stone-400 font-medium">
                اضغط على المكونات الشائعة بالأسفل أو أضف مكونك الخاص...
              </span>
            )}
          </div>
        </div>

        {/* Common Ingredients Chips */}
        <div>
          <label className="text-xs font-bold text-stone-700 block mb-2">
            مكونات أساسية شائعة (اضغط للإضافة أو الحذف):
          </label>
          <div className="flex flex-wrap gap-2">
            {commonIngredients.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  onClick={() => toggleIngredient(ing)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {ing}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomIngredient()}
            placeholder="مكون آخر في ثلاجتك (مثلاً: فطر، جوز، سلق)..."
            className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={addCustomIngredient}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>
      </div>

      {/* Matched Recipes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>وصفات يمكنك طبخها بمكوناتك ({matchedRecipes.length} وصفة مقترحة)</span>
          </h3>
        </div>

        {matchedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {matchedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={!!favorites[recipe.id]}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-500 font-medium">
            اختر مكوناً أو أكثر أعلاه لعرض الوصفات التي تستخدمها.
          </div>
        )}
      </div>

    </div>
  );
};
