import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Check, 
  ArrowUpDown, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Recipe } from '../types.ts';
import { RecipeCard } from './RecipeCard.tsx';

interface AllRecipesViewProps {
  recipes: Recipe[];
  favorites: Record<number, boolean>;
  onToggleFavorite: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const AllRecipesView: React.FC<AllRecipesViewProps> = ({
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cuisine filter
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  
  // Meal Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Multi-select Diet Tags filter
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);
  
  // Max Cooking Time filter
  const [timeFilter, setTimeFilter] = useState<string>('all'); // 'all' | 'under30' | '30to60' | 'over60'
  
  // Difficulty filter
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all'); // 'all' | 'سهل' | 'متوسط' | 'متقدم'
  
  // Sorting
  const [sortBy, setSortBy] = useState<string>('default'); // 'default' | 'fastest' | 'calories' | 'alphabetical'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 24;

  // Available Cuisines (Syrian options first!)
  const cuisineOptions = [
    { id: 'all', label: 'جميع المطابخ (1053 وصفة)' },
    { id: 'syrian_all', label: '🇸🇾 المطبخ السوري (الكل - 268 وصفة)' },
    { id: 'سوري (شامي دمشقي)', label: '🇸🇾 دمشقي شامي' },
    { id: 'سوري (حلبي)', label: '🇸🇾 حلبي' },
    { id: 'سوري (حمصي)', label: '🇸🇾 حمصي' },
    { id: 'سوري (حموي)', label: '🇸🇾 حموي' },
    { id: 'سوري (حوراني)', label: '🇸🇾 حوراني' },
    { id: 'سوري (ساحلي)', label: '🇸🇾 ساحلي لاذقاني' },
    { id: 'سوري (جزراوي وديري)', label: '🇸🇾 ديري وجزراوي' },
    { id: 'لبناني', label: '🇱🇧 لبناني' },
    { id: 'فلسطيني', label: '🇵🇸 فلسطيني' },
    { id: 'أردني', label: '🇯🇴 أردني' },
    { id: 'مصري', label: '🇪🇬 مصري' },
    { id: 'خليجي', label: '🇸🇦 خليجي' },
    { id: 'عراقي', label: '🇮🇶 عراقي' },
    { id: 'مغاربي', label: '🇲🇦 مغاربي' },
    { id: 'يمني', label: '🇾🇪 يمني' },
    { id: 'تركي', label: '🇹🇷 تركي' },
    { id: 'فارسي', label: '🇮🇷 فارسي' },
    { id: 'إيطالي', label: '🇮🇹 إيطالي' },
    { id: 'فرنسي', label: '🇫🇷 فرنسي' },
    { id: 'إسباني', label: '🇪🇸 إسباني' },
    { id: 'يوناني', label: '🇬🇷 يوناني' },
    { id: 'هندي', label: '🇮🇳 هندي' },
    { id: 'صيني', label: '🇨🇳 صيني' },
    { id: 'ياباني', label: '🇯🇵 ياباني' },
    { id: 'تايلندي', label: '🇹🇭 تايلندي' },
    { id: 'كوري', label: '🇰🇷 كوري' },
    { id: 'مكسيكي', label: '🇲🇽 مكسيكي' },
    { id: 'برازيلي', label: '🇧🇷 برازيلي' },
    { id: 'إثيوبي', label: '🇪🇹 إثيوبي' },
    { id: 'آسيوي وعالمي', label: '🌏 آسيوي وعالمي' },
  ];

  // Meal Categories
  const categoryOptions = [
    { id: 'all', label: 'كل الوجبات' },
    { id: 'وجبة رئيسية', label: 'وجبة رئيسية' },
    { id: 'فطور وعشاء', label: 'فطور وعشاء' },
    { id: 'مقبلات وسلطات', label: 'مقبلات وسلطات' },
    { id: 'شوربات', label: 'شوربات' },
    { id: 'معجنات ومخبوزات', label: 'معجنات' },
    { id: 'حلويات ومشروبات', label: 'حلويات ومشروبات' },
  ];

  // Diet Tags available in database
  const dietTagOptions = [
    'نباتي',
    'صحي خفيف',
    'كيتو',
    'غني بالبروتين',
    'خالٍ من الغلوتين',
    'اقتصادي وسريع',
    'نظام الطيبات'
  ];

  // Quick toggle diet tag
  const toggleDietTag = (tag: string) => {
    setSelectedDietTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('all');
    setSelectedCategory('all');
    setSelectedDietTags([]);
    setTimeFilter('all');
    setDifficultyFilter('all');
    setSortBy('default');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedCuisine !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDietTags.length > 0 ||
    timeFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    sortBy !== 'default';

  // Filtered & Sorted recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // 1. Search Query filter (searches title, ingredients, instructions, tips)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const titleMatch = r.title.toLowerCase().includes(q);
        const cuisineMatch = r.cuisine.toLowerCase().includes(q);
        const ingredientMatch = r.ingredients.some((ing) => ing.item.toLowerCase().includes(q));
        const chefTipMatch = r.chef_tip.toLowerCase().includes(q);
        return titleMatch || cuisineMatch || ingredientMatch || chefTipMatch;
      });
    }

    // 2. Cuisine filter
    if (selectedCuisine !== 'all') {
      if (selectedCuisine === 'syrian_all') {
        result = result.filter((r) => r.cuisine.includes('سوري'));
      } else {
        result = result.filter((r) => r.cuisine === selectedCuisine);
      }
    }

    // 3. Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // 4. Multi-Diet Tags filter (recipe must include ALL or ANY selected tag - here matching all selected)
    if (selectedDietTags.length > 0) {
      result = result.filter((r) => 
        selectedDietTags.every((t) => r.diet_tags && r.diet_tags.includes(t))
      );
    }

    // 5. Cooking Time filter
    if (timeFilter === 'under30') {
      result = result.filter((r) => r.total_time <= 30);
    } else if (timeFilter === '30to60') {
      result = result.filter((r) => r.total_time > 30 && r.total_time <= 60);
    } else if (timeFilter === 'over60') {
      result = result.filter((r) => r.total_time > 60);
    }

    // 6. Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter((r) => r.difficulty === difficultyFilter);
    }

    // 7. Sorting
    if (sortBy === 'fastest') {
      result.sort((a, b) => a.total_time - b.total_time);
    } else if (sortBy === 'calories') {
      result.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    }

    return result;
  }, [
    recipes, 
    searchQuery, 
    selectedCuisine, 
    selectedCategory, 
    selectedDietTags, 
    timeFilter, 
    difficultyFilter, 
    sortBy
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage) || 1;
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecipes.slice(start, start + itemsPerPage);
  }, [filteredRecipes, currentPage]);

  return (
    <div className="space-y-6">
      
      {/* Hero Search & Header Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-orange-600/10">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>موسوعة المطبخ السوري والعربي الشاملة</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            ابحث في أكثر من {recipes.length > 0 ? recipes.length.toLocaleString('ar-EG') : '2,000'} وصفة حقيقية
          </h2>

          <p className="text-sm sm:text-base text-amber-100 font-medium max-w-2xl mx-auto">
            مقادير دقيقة بالجرامات، خطوات مفصلة، نصائح الشيف السورية، وفلاتر متعددة للأنظمة الغذائية والمكونات.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mt-2">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث باسم الوصفة، مثل: شاكرية، يبرق، كبة، كشري، أو بمكون مثل: لحم، لبن، برغل..."
              className="w-full pr-12 pl-10 py-4 bg-white text-stone-900 rounded-2xl shadow-xl border-2 border-white focus:outline-none focus:ring-4 focus:ring-amber-300/40 text-sm sm:text-base font-semibold placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Syrian Regional Quick Filters Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            تصفح سريع لمطابخ المحافظات السورية:
          </span>
          {selectedCuisine !== 'all' && (
            <button
              onClick={() => {
                setSelectedCuisine('all');
                setCurrentPage(1);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 font-bold"
            >
              عرض جميع المطابخ
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'syrian_all', label: 'كل المطبخ السوري (268)' },
            { id: 'سوري (شامي دمشقي)', label: 'دمشقي شامي' },
            { id: 'سوري (حلبي)', label: 'حلبي' },
            { id: 'سوري (حمصي)', label: 'حمصي' },
            { id: 'سوري (حموي)', label: 'حموي' },
            { id: 'سوري (حوراني)', label: 'حوراني' },
            { id: 'سوري (ساحلي)', label: 'ساحلي لاذقاني' },
            { id: 'سوري (جزراوي وديري)', label: 'ديري وجزراوي' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCuisine(selectedCuisine === item.id ? 'all' : item.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCuisine === item.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Filter Controls Grid */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        
        {/* Row 1: Cuisines, Meal Category, Time, Difficulty, Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Cuisine Filter */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">المطبخ والبلد:</label>
            <select
              value={selectedCuisine}
              onChange={(e) => {
                setSelectedCuisine(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              {cuisineOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">نوع الوجبة:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">وقت التحضير والطهي:</label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              <option value="all">أي وقت طهي</option>
              <option value="under30">سريع (أقل من 30 دقيقة)</option>
              <option value="30to60">متوسط (30 إلى 60 دقيقة)</option>
              <option value="over60">أطول من ساعة (طبخات ثقيلة)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">مستوى الصعوبة:</label>
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              <option value="all">كل المستويات</option>
              <option value="سهل">سهل وبسيط</option>
              <option value="متوسط">متوسط المهارة</option>
              <option value="متقدم">متقدم (عزائم وولائم)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              الترتيب حسب:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:border-amber-500"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="fastest">الأسرع تحضيراً</option>
              <option value="calories">الأقل سعرات حرارية</option>
              <option value="alphabetical">أبجدياً (أ - ي)</option>
            </select>
          </div>

        </div>

        {/* Row 2: Multi-Select Diet Tags Filter (Supports multiple simultaneously!) */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              وسوم النظام الغذائي (يمكن اختيار أكثر من وسم معاً):
            </span>
            {selectedDietTags.length > 0 && (
              <span className="text-xs text-amber-800 font-semibold">
                تم تفعيل {selectedDietTags.length} وسوم
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {dietTagOptions.map((tag) => {
              const isSelected = selectedDietTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleDietTag(tag)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Bar & Active Filter Chips */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="text-stone-600 font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>
              عرض {paginatedRecipes.length} من أصل {filteredRecipes.length.toLocaleString('ar-EG')} وصفة
            </span>
            {filteredRecipes.length !== recipes.length && (
              <span className="text-stone-400 font-normal">
                (من إجمالي {recipes.length.toLocaleString('ar-EG')} وصفة بالموسوعة)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط جميع الفلاتر</span>
            </button>
          )}
        </div>

      </div>

      {/* Recipes Cards Grid */}
      {paginatedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedRecipes.map((recipe) => (
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
        /* Empty State */
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-900">
            لم نجد وصفات تطابق خيارات البحث الحالية!
          </h3>
          <p className="text-sm text-stone-500 font-medium">
            جرب تخفيف الفلاتر المحددة أو ابحث باسم مكون أو طبق آخر، أو أعد ضبط الفلاتر لتصفح جميع الوصفات.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md transition-all"
          >
            إعادة ضبط الفلاتر وعرض الكل
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-black">
            <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white shadow-xs">
              {currentPage}
            </span>
            <span className="text-stone-400 px-1">من</span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700">
              {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
