import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Users, 
  Flame, 
  Heart, 
  Printer, 
  ShoppingCart, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  CalendarPlus, 
  Tag, 
  Check, 
  Share2
} from 'lucide-react';
import { Recipe, Ingredient } from '../types.ts';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (ingredients: Ingredient[], recipeTitle: string) => void;
  onAddToMealPlan?: (recipe: Recipe, day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onAddToMealPlan,
}) => {
  // Servings Scaler state
  const [servings, setServings] = useState<number>(recipe?.servings || 4);
  
  // Ingredients checklist state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  
  // Cooking Timer state
  const initialSeconds = (recipe?.cook_time || 30) * 60;
  const [timerSeconds, setTimerSeconds] = useState<number>(initialSeconds);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  // Added to shopping feedback
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Selected meal plan target
  const [selectedDay, setSelectedDay] = useState<string>('السبت');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [showMealPlanPicker, setShowMealPlanPicker] = useState<boolean>(false);
  const [mealPlanAdded, setMealPlanAdded] = useState<boolean>(false);

  // Reset states when recipe changes
  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings || 4);
      setCheckedIngredients({});
      setTimerSeconds((recipe.cook_time || 30) * 60);
      setTimerRunning(false);
      setTimerFinished(false);
      setAddedToCart(false);
      setCopiedShare(false);
    }
  }, [recipe]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerFinished(true);
            // Play web audio alert beep
            try {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 587.33; // D5 note
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch (e) {
              console.log('Audio not supported or permitted', e);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  // Return null AFTER all hooks are called
  if (!recipe) return null;

  // Helper to scale ingredient amounts
  const scaleAmount = (baseAmount: number) => {
    const scaleFactor = servings / (recipe.servings || 4);
    const scaled = baseAmount * scaleFactor;
    // Format to 1 decimal if fraction, or integer
    return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(1));
  };

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAddAllToCart = () => {
    const scaledList: Ingredient[] = recipe.ingredients.map((ing) => ({
      ...ing,
      amount: scaleAmount(ing.amount),
    }));
    onAddToShoppingList(scaledList, recipe.title);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleShare = () => {
    const shareText = `وصفة "${recipe.title}" من موسوعة هناكل إيه:\nوقت الطهي: ${recipe.cook_time} دقيقة | الحصص: ${recipe.servings}\nالمقادير:\n${recipe.ingredients.map((i) => `• ${i.amount} ${i.unit} ${i.item}`).join('\n')}\nطريقة التحضير:\n${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTimerTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const isSyrian = recipe.cuisine.includes('سوري');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col my-auto recipe-print-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Actions */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50/90 backdrop-blur-md flex items-start justify-between gap-4 no-print">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                isSyrian 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-stone-200 text-stone-800 border-stone-300'
              }`}>
                {recipe.cuisine}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800 border border-orange-200">
                {recipe.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
                درجة الصعوبة: {recipe.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
              {recipe.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onToggleFavorite(recipe)}
              className={`p-2.5 rounded-2xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-stone-200 text-stone-500 hover:text-rose-500 hover:bg-stone-50'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all"
              title="نسخ ومشاركة الوصفة"
            >
              {copiedShare ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all"
              title="طباعة بطاقة الوصفة"
            >
              <Printer className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition-all ml-1"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          
          {/* Multi-Diet Tags & Quick Stats */}
          <div className="space-y-4">
            {recipe.diet_tags && recipe.diet_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-500">الأنظمة والوسوم:</span>
                {recipe.diet_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    <Tag className="w-3 h-3 text-amber-700" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-xs text-stone-500 font-medium block mb-1">وقت التحضير</span>
                <span className="text-lg font-black text-stone-900 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {recipe.prep_time} دقيقة
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-xs text-stone-500 font-medium block mb-1">وقت الطهي</span>
                <span className="text-lg font-black text-stone-900 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  {recipe.cook_time} دقيقة
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-xs text-stone-500 font-medium block mb-1">الوقت الإجمالي</span>
                <span className="text-lg font-black text-amber-700 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {recipe.total_time} دقيقة
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-xs text-stone-500 font-medium block mb-1">السعرات التقريبية</span>
                <span className="text-lg font-black text-stone-900 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {recipe.calories} سعرة
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cooking Timer Widget */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-lg shadow-orange-600/15 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-black text-base">مؤقت الطهي المباشر</h4>
                <p className="text-xs text-amber-100 font-medium">
                  اضبط وقت طهي الوصفة ({recipe.cook_time} دقيقة) وسينبهك عند الانتهاء
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-3xl font-black px-4 py-2 bg-black/25 rounded-2xl tracking-widest text-center min-w-32 border border-white/10">
                {formatTimerTime(timerSeconds)}
              </div>

              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`p-3 rounded-2xl font-bold flex items-center gap-1 shadow-md transition-all ${
                  timerRunning
                    ? 'bg-amber-100 text-amber-900 hover:bg-white'
                    : 'bg-white text-stone-900 hover:bg-amber-50'
                }`}
              >
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds((recipe.cook_time || 30) * 60);
                  setTimerFinished(false);
                }}
                className="p-3 rounded-2xl bg-black/20 hover:bg-black/30 text-white transition-all"
                title="إعادة ضبط المؤقت"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            {timerFinished && (
              <div className="w-full text-center py-1.5 px-3 bg-white text-orange-700 font-black rounded-xl text-sm animate-pulse">
                🔔 انتهى وقت الطهي! حان وقت فحص الطبخة وتقديمها.
              </div>
            )}
          </div>

          {/* Servings Scaler & Ingredients Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-amber-600 inline-block"></span>
                  المقادير والمكونات الدقيقة
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تعديل عدد الحصص يعيد احتساب مقادير المكونات تلقائياً
                </p>
              </div>

              {/* Servings Scaler Buttons */}
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-auto">
                <span className="text-xs font-bold text-stone-600 px-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  الحصص:
                </span>
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-stone-800 font-bold hover:bg-amber-50 shadow-xs flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-black w-6 text-center text-stone-900">{servings}</span>
                <button
                  type="button"
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-stone-800 font-bold hover:bg-amber-50 shadow-xs flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Checklist of Ingredients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                const displayAmt = scaleAmount(ing.amount);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredientCheck(idx)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-stone-100/70 border-stone-300 text-stone-400 line-through'
                        : 'bg-stone-50 hover:bg-amber-50/50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-sm">{ing.item}</span>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      isChecked ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {displayAmt} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Add to shopping list action */}
            <div className="pt-2 flex justify-end no-print">
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-102"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>تمت الإضافة لقائمة التسوق بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>أضف جميع المقادير لقائمة التسوق</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Detailed Preparation Instructions Section */}
          <div className="space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-orange-600 inline-block"></span>
                طريقة التحضير والطهي خطوة بخطوة
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تعليمات دقيقة ومفصلة لضمان الحصول على النتيجة الأصلية الممتازة
              </p>
            </div>

            <div className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/90 hover:border-amber-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                    {idx + 1}
                  </div>
                  <p className="text-stone-800 leading-relaxed text-sm sm:text-base font-medium pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef Tip / Syrian Secret Box */}
          {recipe.chef_tip && (
            <div className="relative p-6 rounded-3xl bg-amber-50/80 border-2 border-amber-300/80 text-amber-950 overflow-hidden shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-900 mb-1.5 flex items-center gap-2">
                    سر الطبخة الشامية ونصيحة الشيف
                  </h4>
                  <p className="text-sm text-amber-900/90 leading-relaxed font-semibold">
                    {recipe.chef_tip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add to Meal Planner Drawer / Dropdown */}
          {onAddToMealPlan && (
            <div className="pt-2 border-t border-stone-200 no-print">
              {!showMealPlanPicker ? (
                <button
                  onClick={() => setShowMealPlanPicker(true)}
                  className="flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-amber-700 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4 text-amber-600" />
                  <span>جدولة هذه الوصفة في خطة الوجبات الأسبوعية...</span>
                </button>
              ) : (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-stone-900">
                      إضافة إلى جدول الوجبات:
                    </span>
                    <button
                      onClick={() => setShowMealPlanPicker(false)}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-600 block mb-1">اليوم:</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-white"
                      >
                        {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-600 block mb-1">نوع الوجبة:</label>
                      <select
                        value={selectedMealType}
                        onChange={(e) => setSelectedMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="breakfast">فطور</option>
                        <option value="lunch">غداء</option>
                        <option value="dinner">عشاء</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToMealPlan(recipe, selectedDay, selectedMealType);
                      setMealPlanAdded(true);
                      setTimeout(() => {
                        setMealPlanAdded(false);
                        setShowMealPlanPicker(false);
                      }, 1500);
                    }}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {mealPlanAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>تمت الإضافة إلى جدول {selectedDay}!</span>
                      </>
                    ) : (
                      <span>تأكيد الإضافة إلى جدول {selectedDay}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between no-print">
          <div className="text-xs text-stone-500 font-medium">
            رقم الوصفة: #{recipe.id}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
