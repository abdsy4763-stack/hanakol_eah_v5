import React, { useState } from 'react';
import { Heart, Search, BookOpen } from 'lucide-react';
import { Recipe } from '../types.ts';
import { RecipeCard } from './RecipeCard.tsx';

interface FavoritesViewProps {
  favorites: Record<number, boolean>;
  recipes: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onBrowseAll: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  recipes,
  onToggleFavorite,
  onSelectRecipe,
  onBrowseAll,
}) => {
  const [query, setQuery] = useState<string>('');

  const favoriteRecipes = recipes.filter((r) => favorites[r.id]);

  const filteredFavorites = favoriteRecipes.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      r.title.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.item.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              الوصفات المفضلة ❤️
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              لديك {favoriteRecipes.length} وصفة محفوظة للرجوع إليها في أي وقت
            </p>
          </div>
        </div>

        {favoriteRecipes.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في مفضلتك..."
              className="w-full text-xs font-semibold pr-9 pl-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Grid or Empty */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFavorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-stone-800">
            {favoriteRecipes.length === 0 ? 'لم تحفظ أي وصفة في المفضلة بعد' : 'لم نجد أي وصفة تطابق بحثك في المفضلة'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            تصفح مكتبة الوصفات الشاملة، واضغط على رمز القلب بجوار أي وصفة لإضافتها هنا لتصل إليها بسرعة دائماً.
          </p>
          <button
            onClick={onBrowseAll}
            className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>تصفح مكتبة الوصفات الآن</span>
          </button>
        </div>
      )}

    </div>
  );
};
