import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Clock, 
  Users, 
  Flame, 
  Heart, 
  ShoppingCart, 
  CalendarPlus, 
  RotateCcw, 
  Dices, 
  ChefHat,
  Tag,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, Ingredient } from '../types.ts';

interface CoreIngredientSearchViewProps {
  recipes: Recipe[];
  pantryItems: string[];
  favorites: Record<number, boolean>;
  onToggleFavorite: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onAddMissingToShopping: (missingItems: string[], recipeTitle: string) => void;
  onAddToMealPlan: (recipe: Recipe, day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

// Tokenize text for Arabic matching
function tokenize(text: string): string[] {
  return text
    ?.toLowerCase()
    .replace(/[ً-ْ]/g, '') // remove tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function matchIngredient(userTokenWords: string[], recipeItemName: string): boolean {
  const recipeTokens = tokenize(recipeItemName);
  // Match if any user token is contained in recipe token or vice versa
  return userTokenWords.some((u) => 
    recipeTokens.some((r) => r.includes(u) || u.includes(r))
  );
}

export const CoreIngredientSearchView: React.FC<CoreIngredientSearchViewProps> = ({
  recipes,
  pantryItems,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onAddMissingToShopping,
  onAddToMealPlan,
}) => {
  // Input for adding ingredient
  const [ingredientInput, setIngredientInput] = useState<string>('');
  
  // User's available ingredients list (starts with a friendly Syrian starter pack)
  const [userIngredients, setUserIngredients] = useState<string[]>([
    'لحم',
    'لبن زبادي',
    'أرز',
    'بصل',
    'ثوم'
  ]);

  // Option to include permanent pantry staples
  const [includePantry, setIncludePantry] = useState<boolean>(true);

  // Preferred Cuisine filter (Syrian first!)
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

  // Meal Category filter (Main meal, breakfast, sweets, etc.)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Multi-Diet Tags filter
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);

  // Max Cooking Time
  const [maxTime, setMaxTime] = useState<string>('all'); // 'all' | '30' | '45' | '60'

  // Has run search state (true by default so users see instant matches with initial ingredients)
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTriggered, setSearchTriggered] = useState<boolean>(true);

  // Common Arabic/Syrian ingredients quick chips
  const quickPicks = [
    'دجاج',
    'لحم',
    'لبن زبادي',
    'أرز',
    'برغل',
    'بطاطا',
    'بصل',
    'ثوم',
    'طماطم',
    'باذنجان',
    'كوسا',
    'بيض',
    'عدس',
    'حمص',
    'ملوخية',
    'سبانخ',
    'فاصولياء',
    'طحينة',
    'دبس رمان',
    'معكرونة',
    'سمك'
  ];

  // Diet Tag options
  const dietOptions = [
    'نباتي',
    'صحي خفيف',
    'كيتو',
    'غني بالبروتين',
    'خالٍ من الغلوتين',
    'اقتصادي وسريع',
    'نظام الطيبات'
  ];

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !userIngredients.some((i) => i?.toLowerCase() === trimmed?.toLowerCase())) {
      setUserIngredients([...userIngredients, trimmed]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setUserIngredients(userIngredients.filter((_, idx) => idx !== index));
  };

  const toggleQuickPick = (item: string) => {
    if (userIngredients.includes(item)) {
      setUserIngredients(userIngredients.filter((i) => i !== item));
    } else {
      setUserIngredients([...userIngredients, item]);
    }
  };

  const toggleDietTag = (tag: string) => {
    setSelectedDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Perform Intelligent Ingredient Matching
  const matchedResults = useMemo(() => {
    if (userIngredients.length === 0) return [];

    const userTokensList = userIngredients.map(tokenize);
    const pantryTokensList = includePantry ? pantryItems.map(tokenize) : [];

    // Filter recipes based on cuisine, category, diet tags, and max time first
    let candidates = recipes.filter((recipe) => {
      // Cuisine filter
      if (selectedCuisine !== 'all') {
        if (selectedCuisine === 'syrian_all') {
          if (!recipe.cuisine.includes('سوري')) return false;
        } else if (recipe.cuisine !== selectedCuisine) {
          return false;
        }
      }

      // Meal Category filter (strict category segregation)
      if (selectedCategory !== 'all') {
        if (recipe.category !== selectedCategory) return false;
      }

      // Multi-diet tags filter
      if (selectedDietTags.length > 0) {
        const matchesAllDiets = selectedDietTags.every(
          (d) => recipe.diet_tags && recipe.diet_tags.includes(d)
        );
        if (!matchesAllDiets) return false;
      }

      // Max time
      if (maxTime === '30' && recipe.total_time > 30) return false;
      if (maxTime === '45' && recipe.total_time > 45) return false;
      if (maxTime === '60' && recipe.total_time > 60) return false;

      return true;
    });

    // Score each candidate recipe
    const scored = candidates.map((recipe) => {
      const matchedIngredients: string[] = [];
      const missingIngredients: string[] = [];

      recipe.ingredients.forEach((ing) => {
        const ingName = ing.item;
        const isMatchedByUser = userTokensList.some((uTokens) =>
          matchIngredient(uTokens, ingName)
        );

        if (isMatchedByUser) {
          matchedIngredients.push(ingName);
        } else {
          // Check if it's in pantry
          const isPantry = pantryTokensList.some((pTokens) =>
            matchIngredient(pTokens, ingName)
          );
          if (!isPantry) {
            missingIngredients.push(ingName);
          }
        }
      });

      const totalIngredientsCount = recipe.ingredients.length;
      const userMatchCount = matchedIngredients.length;
      const missingCount = missingIngredients.length;
      const matchRate = totalIngredientsCount > 0 
        ? Math.round((userMatchCount / totalIngredientsCount) * 100) 
        : 0;

      return {
        recipe,
        userMatchCount,
        missingCount,
        matchRate,
        matchedIngredients,
        missingIngredients,
      };
    });

    // Keep recipes where at least 1 user ingredient matched, sorted by highest match rate & lowest missing count
    return scored
      .filter((s) => s.userMatchCount > 0)
      .sort((a, b) => {
        if (b.userMatchCount !== a.userMatchCount) return b.userMatchCount - a.userMatchCount;
        if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
        return a.recipe.total_time - b.recipe.total_time;
      });
  }, [
    recipes,
    userIngredients,
    pantryItems,
    includePantry,
    selectedCuisine,
    selectedCategory,
    selectedDietTags,
    maxTime,
  ]);

  // Quick Random Roulette from currently matched recipes
  const handleRandomSpin = () => {
    if (matchedResults.length === 0) return;
    // For random cooking idea, prioritize main savory dishes unless user specifically selected sweets
    let pool = matchedResults;
    if (selectedCategory === 'all') {
      const mains = matchedResults.filter((m) => m.recipe.category === 'وجبة رئيسية');
      if (mains.length > 0) pool = mains;
    }
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    onSelectRecipe(randomPick.recipe);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      console.log(e);
    }
  };

  const handleSearchClick = () => {
    setIsSearching(true);
    setSearchTriggered(true);
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <div className="space-y-6">
      
      {/* Core Hero Box: "إيه المتوفر عندك النهاردة؟" */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-orange-100 space-y-6">
        
        {/* Title & Clear */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                إيه المتوفر عندك في المطبخ النهاردة؟ 🍳
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                أدخل المكونات المتوفرة لديك، وسنقترح عليك أشهى الطبخات المناسبة مع تفصيل المتوفر والنواقص
              </p>
            </div>
          </div>

          {userIngredients.length > 0 && (
            <button
              onClick={() => setUserIngredients([])}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مسح المكونات</span>
            </button>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
            placeholder="اكتب مكوناً متوفراً لديك ثم اضغط إضافة (مثلاً: دجاج، لحم، لبن، بطاطا، برغل، كوسا)..."
            className="flex-1 text-xs sm:text-sm font-semibold px-4 py-3.5 rounded-2xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner placeholder:text-stone-400"
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all hover:scale-102 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {/* User Active Ingredients Tags Container */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 min-h-16 flex flex-wrap items-center gap-2">
          {userIngredients.length > 0 ? (
            userIngredients.map((item, index) => (
              <span
                key={index}
                className="bg-white border border-stone-300 px-3.5 py-1.5 rounded-full text-xs font-black text-stone-800 flex items-center gap-2 shadow-xs group hover:border-amber-400 transition-all"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                  aria-label={`حذف ${item}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-stone-400 font-medium">
              لم تُضف أي مكونات بعد. اكتب في الحقل أعلاه أو اضغط على أحد المكونات السريعة أدناه...
            </span>
          )}
        </div>

        {/* Quick Picks Chips */}
        <div>
          <span className="text-xs font-bold text-stone-600 block mb-2">
            مكونات سريعة وشائعة في المطبخ السوري والعربي (اضغط للإضافة أو الحذف):
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((item) => {
              const isSelected = userIngredients.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleQuickPick(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pantry Checkbox */}
        <div className="flex items-center gap-3 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
          <input
            type="checkbox"
            id="include-pantry"
            checked={includePantry}
            onChange={(e) => setIncludePantry(e.target.checked)}
            className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
          />
          <label htmlFor="include-pantry" className="text-xs sm:text-sm font-bold text-stone-800 cursor-pointer select-none">
            📦 تضمين مواد مخزن المنزل الدائمة تلقائياً (الملح، الزيت، السمنة، التوابل، السكر...) بحيث لا تُحسب كنواقص
          </label>
        </div>

        {/* Filters Grid: Cuisine & Category & Diet & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Cuisine Selector (Syrian First!) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              🌐 المطبخ / البلد المفضّل:
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع المطابخ (1053 وصفة)</option>
              <optgroup label="المطبخ السوري العريق ومناطقه">
                <option value="syrian_all">🇸🇾 المطبخ السوري (الكل - 268 وصفة)</option>
                <option value="سوري (شامي دمشقي)">🇸🇾 سوري شامي دمشقي</option>
                <option value="سوري (حلبي)">🇸🇾 سوري حلبي</option>
                <option value="سوري (حمصي)">🇸🇾 سوري حمصي</option>
                <option value="سوري (حموي)">🇸🇾 سوري حموي</option>
                <option value="سوري (حوراني)">🇸🇾 سوري حوراني</option>
                <option value="سوري (ساحلي)">🇸🇾 سوري ساحلي لاذقاني</option>
                <option value="سوري (جزراوي وديري)">🇸🇾 سوري ديري وجزراوي</option>
              </optgroup>
              <optgroup label="المطابخ العربية والإقليمية">
                <option value="لبناني">🇱🇧 لبناني</option>
                <option value="فلسطيني">🇵🇸 فلسطيني</option>
                <option value="أردني">🇯🇴 أردني</option>
                <option value="مصري">🇪🇬 مصري</option>
                <option value="خليجي">🇸🇦 خليجي</option>
                <option value="عراقي">🇮🇶 عراقي</option>
                <option value="مغاربي">🇲🇦 مغاربي</option>
                <option value="يمني">🇾🇪 يمني</option>
                <option value="تركي">🇹🇷 تركي</option>
                <option value="فارسي">🇮🇷 فارسي</option>
              </optgroup>
              <optgroup label="المطابخ العالمية">
                <option value="إيطالي">🇮🇹 إيطالي</option>
                <option value="فرنسي">🇫🇷 فرنسي</option>
                <option value="إسباني">🇪🇸 إسباني</option>
                <option value="يوناني">🇬🇷 يوناني</option>
                <option value="هندي">🇮🇳 هندي</option>
                <option value="صيني">🇨🇳 صيني</option>
                <option value="ياباني">🇯🇵 ياباني</option>
                <option value="تايلندي">🇹🇭 تايلندي</option>
                <option value="كوري">🇰🇷 كوري</option>
                <option value="مكسيكي">🇲🇽 مكسيكي</option>
                <option value="برازيلي">🇧🇷 برازيلي</option>
                <option value="إثيوبي">🇪🇹 إثيوبي</option>
                <option value="آسيوي وعالمي">🌏 آسيوي وعالمي</option>
              </optgroup>
            </select>
          </div>

          {/* Meal Category Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              🍽️ نوع الوجبة المطلوب اقتراحها:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">كل الوجبات (الافتراضي)</option>
              <option value="وجبة رئيسية">وجبة رئيسية (طبخات وغداء)</option>
              <option value="فطور وعشاء">فطور وعشاء</option>
              <option value="مقبلات وسلطات">مقبلات وسلطات</option>
              <option value="شوربات">شوربات</option>
              <option value="معجنات ومخبوزات">معجنات ومخبوزات</option>
              <option value="حلويات ومشروبات">حلويات ومشروبات</option>
            </select>
          </div>

          {/* Time Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              ⏱️ الوقت المتاح للطهي:
            </label>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">أي وقت طهي (مفتوح)</option>
              <option value="30">سريع جداً (أقل من 30 دقيقة)</option>
              <option value="45">متوسط (خلال 45 دقيقة)</option>
              <option value="60">طبخات تقليدية (خلال ساعة)</option>
            </select>
          </div>

          {/* Diet Tags Preview & Counter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              🥗 النظام الغذائي:
            </label>
            <div className="text-xs text-stone-500 p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium">
              {selectedDietTags.length > 0 ? (
                <span className="font-bold text-amber-800">
                  محدد: {selectedDietTags.join('، ')}
                </span>
              ) : (
                <span>عام (كل الأنظمة الغذائية)</span>
              )}
            </div>
          </div>

        </div>

        {/* Multi-Diet Tags Selection Pills */}
        <div className="pt-2">
          <label className="text-xs font-bold text-stone-700 block mb-2">
            وسوم النظام الغذائي (يمكنك اختيار أكثر من نظام معاً):
          </label>
          <div className="flex flex-wrap gap-2">
            {dietOptions.map((tag) => {
              const isSelected = selectedDietTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDietTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={userIngredients.length === 0 || isSearching}
            className="flex-1 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:opacity-95 text-white py-4 px-6 rounded-2xl font-black text-base shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>ابحث في كتاب الوصفات الآن! ({matchedResults.length} وصفة مطابقة)</span>
          </button>

          {matchedResults.length > 0 && (
            <button
              type="button"
              onClick={handleRandomSpin}
              className="px-6 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors flex-shrink-0"
              title="اختيار طبخة عشوائية من نتائج المكونات"
            >
              <Dices className="w-5 h-5 text-amber-600" />
              <span>اقترح لي طبخة عشوائية</span>
            </button>
          )}
        </div>

      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>
              أفضل الوصفات المتوافقة مع مكوناتك ({matchedResults.length} وصفة):
            </span>
          </h3>
          <span className="text-xs font-bold text-stone-500">
            مرتبة حسب أعلى نسبة تطابق مع مكوناتك
          </span>
        </div>

        {/* Results Cards List */}
        {matchedResults.length > 0 ? (
          <div className="space-y-4">
            {matchedResults.slice(0, 20).map(({ recipe, userMatchCount, missingIngredients, missingCount, matchRate, matchedIngredients }) => {
              const isFav = !!favorites[recipe.id];
              const isFullMatch = missingCount === 0;

              return (
                <div
                  key={recipe.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                          {recipe.cuisine}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800">
                          {recipe.category}
                        </span>
                        
                        {/* Match Status Badge */}
                        {isFullMatch ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            تطابق كامل! كل المكونات متوفرة لديك (100%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                            تطابق {matchRate}% (متوفر {userMatchCount} مكونات)
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => onSelectRecipe(recipe)}
                        className="text-lg sm:text-xl font-black text-stone-900 hover:text-amber-700 cursor-pointer transition-colors"
                      >
                        {recipe.title}
                      </h4>

                      {/* Multi-diet tags */}
                      {recipe.diet_tags && recipe.diet_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {recipe.diet_tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons on card header */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onToggleFavorite(recipe)}
                        className={`p-2 rounded-xl border transition-all ${
                          isFav
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-rose-600'
                        }`}
                        title={isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                      >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Ingredient Match Breakdown (Available vs Missing) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    
                    {/* Matched (Available) */}
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 text-xs space-y-1">
                      <span className="font-black text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        المكونات المتوفرة عندك ({matchedIngredients.length}):
                      </span>
                      <p className="text-emerald-800 font-semibold leading-relaxed">
                        {matchedIngredients.join('، ')}
                      </p>
                    </div>

                    {/* Missing */}
                    {missingIngredients.length > 0 ? (
                      <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-xs flex flex-col justify-between gap-2">
                        <div>
                          <span className="font-black text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                            النواقص ({missingIngredients.length}):
                          </span>
                          <p className="text-amber-800 font-semibold leading-relaxed">
                            {missingIngredients.join('، ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddMissingToShopping(missingIngredients, recipe.title)}
                          className="self-start text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>أضف النواقص لسلة التسوق</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 text-xs flex items-center justify-center font-black text-emerald-800">
                        ✨ لا ينقصك أي مكون، يمكنك الطهي فوراً!
                      </div>
                    )}

                  </div>

                  {/* Card Bottom: Metrics + Plan shortcuts + View Details CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-4 text-stone-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {recipe.total_time} دقيقة
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        {recipe.servings} حصص
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {recipe.calories} سعرة
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(recipe)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black transition-colors flex items-center gap-1"
                      >
                        <span>عرض الطريقة والمقادير بالتفصيل ←</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-stone-800">
              لم نجد وصفات تطابق هذه المكونات بالكامل
            </h4>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              جرب إضافة مكونات أخرى مثل: أرز، دجاج، لحم، لبن، بصل، أو اختر "جميع المطابخ" لتوسيع النتائج المقترحة.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
