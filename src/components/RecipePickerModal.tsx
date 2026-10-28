import React, { useState, useMemo } from 'react';
import { X, Search, Clock, ChefHat } from 'lucide-react';
import { Recipe } from '../types.ts';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  title: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
}

export const RecipePickerModal: React.FC<RecipePickerModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onSelect,
  title,
  mealType,
}) => {
  const [search, setSearch] = useState<string>('');
  
  // Default category depends on mealType
  const initialCategory = mealType === 'lunch' 
    ? 'وجبة رئيسية' 
    : (mealType === 'breakfast' ? 'فطور وعشاء' : 'all');
    
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'فطور وعشاء') {
          if (r.category !== 'فطور وعشاء' && r.category !== 'معجنات ومخبوزات') return false;
        } else if (r.category !== selectedCategory) {
          return false;
        }
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.toLowerCase().includes(q);
        const matchesCat = r.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCuisine && !matchesCat) return false;
      }

      return true;
    }).slice(0, 50);
  }, [recipes, search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-stone-900">{title}</h3>
            <p className="text-xs text-stone-500 font-medium">اختر وجبة مناسبة لإضافتها لجدولك</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-3 bg-stone-100 border-b border-stone-200 text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'وجبة رئيسية', label: 'طبخات غداء رئيسية' },
            { id: 'فطور وعشاء', label: 'فطور وعشاء' },
            { id: 'شوربات', label: 'شوربات' },
            { id: 'مقبلات وسلطات', label: 'مقبلات وسلطات' },
            { id: 'حلويات ومشروبات', label: 'حلويات ومشروبات' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-stone-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن وصفة بالاسم أو المطبخ..."
              className="w-full text-xs font-semibold pr-9 pl-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {filtered.length > 0 ? (
            filtered.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => {
                  onSelect(recipe);
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-bold text-sm text-stone-900 block">{recipe.title}</span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                    <span className="px-2 py-0.5 rounded bg-stone-100 font-bold text-stone-700">{recipe.cuisine}</span>
                    <span className="px-2 py-0.5 rounded bg-orange-100 font-bold text-orange-800">{recipe.category}</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {recipe.total_time} دقيقة
                    </span>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs">
                  اختيار
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-stone-500">
              لا توجد وصفات تطابق هذا التصنيف أو البحث.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
