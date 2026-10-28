import React from 'react';
import { Clock, Users, Flame, Heart, ChefHat, Tag } from 'lucide-react';
import { Recipe } from '../types.ts';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const isSyrian = recipe.cuisine.includes('سوري');

  return (
    <div 
      onClick={() => onSelect(recipe)}
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
              isSyrian
                ? 'bg-amber-50 text-amber-900 border-amber-300/80'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {recipe.cuisine}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
              {recipe.category}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe);
            }}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 scale-110'
                : 'text-stone-400 hover:text-rose-500 hover:bg-stone-50'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            aria-label="حفظ في المفضلة"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>

        {/* Recipe Title */}
        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
          {recipe.title}
        </h3>

        {/* Multi-Diet Tags */}
        {recipe.diet_tags && recipe.diet_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.diet_tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60"
              >
                <Tag className="w-2.5 h-2.5 text-stone-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Info row: Time, Servings, Calories */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-600 text-xs mb-4">
          <div className="flex items-center gap-1.5" title="وقت الطهي والتحضير">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold">{recipe.total_time} د</span>
          </div>
          <div className="flex items-center gap-1.5" title="عدد الحصص">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold">{recipe.servings} حصص</span>
          </div>
          <div className="flex items-center gap-1.5" title="السعرات التقريبية">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold">{recipe.calories} سعرة</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
        <span className="flex items-center gap-1 font-medium">
          <ChefHat className="w-3.5 h-3.5 text-stone-400" />
          {recipe.ingredients.length} مكونات
        </span>
        <span className="text-amber-700 font-bold group-hover:underline flex items-center gap-0.5">
          عرض الطريقة والمقادير ←
        </span>
      </div>
    </div>
  );
};
