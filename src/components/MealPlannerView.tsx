import React from 'react';
import { 
  CalendarDays, 
  Trash2, 
  Plus, 
  Sparkles, 
  ShoppingCart, 
  ChefHat, 
  RotateCcw,
  Check
} from 'lucide-react';
import { MealPlanDay, Recipe, Ingredient } from '../types.ts';

interface MealPlannerViewProps {
  mealPlan: MealPlanDay[];
  onRemoveMeal: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onAutoGeneratePlan: () => void;
  onClearPlan: () => void;
  onGenerateShoppingListFromPlan: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenRecipePicker: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  mealPlan,
  onRemoveMeal,
  onAutoGeneratePlan,
  onClearPlan,
  onGenerateShoppingListFromPlan,
  onSelectRecipe,
  onOpenRecipePicker,
}) => {
  const [copiedNotification, setCopiedNotification] = React.useState<boolean>(false);

  const handleGenerateShopping = () => {
    onGenerateShoppingListFromPlan();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              خطة الوجبات الأسبوعية 📅
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            خطط لوجبات الفطور والغداء والعشاء لجميع أيام الأسبوع، وحوّلها لقائمة مقاضي كاملة بنقرة واحدة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAutoGeneratePlan}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد جدول مقترح تلقائياً</span>
          </button>

          <button
            onClick={handleGenerateShopping}
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedNotification ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم النقل لقائمة التسوق!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>نقل كل مقادير الأسبوع للتسوق</span>
              </>
            )}
          </button>

          <button
            onClick={onClearPlan}
            className="p-2.5 rounded-2xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="مسح الجدول"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealPlan.map((day, dayIndex) => {
          return (
            <div
              key={day.dayName}
              className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="font-black text-base text-stone-900">
                  {day.dayName}
                </span>
                <span className="text-[11px] font-bold text-stone-400">
                  {['فطور', 'غداء', 'عشاء'].filter((_, i) => {
                    if (i === 0) return !!day.breakfast;
                    if (i === 1) return !!day.lunch;
                    return !!day.dinner;
                  }).length} من 3 وجبات
                </span>
              </div>

              {/* Breakfast Slot */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-800 block">فطور الصباح:</span>
                {day.breakfast ? (
                  <div 
                    onClick={() => onSelectRecipe(day.breakfast!)}
                    className="group relative p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 hover:bg-amber-100/60 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="text-xs font-black text-stone-800 line-clamp-1 group-hover:text-amber-800">
                      {day.breakfast.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMeal(dayIndex, 'breakfast');
                      }}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenRecipePicker(dayIndex, 'breakfast')}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:text-stone-700 hover:border-stone-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة فطور</span>
                  </button>
                )}
              </div>

              {/* Lunch Slot */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-orange-800 block">الغداء (الرئيسية):</span>
                {day.lunch ? (
                  <div 
                    onClick={() => onSelectRecipe(day.lunch!)}
                    className="group relative p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 hover:bg-orange-100/60 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="text-xs font-black text-stone-800 line-clamp-1 group-hover:text-orange-800">
                      {day.lunch.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMeal(dayIndex, 'lunch');
                      }}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenRecipePicker(dayIndex, 'lunch')}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:text-stone-700 hover:border-stone-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة غداء</span>
                  </button>
                )}
              </div>

              {/* Dinner Slot */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-600 block">العشاء:</span>
                {day.dinner ? (
                  <div 
                    onClick={() => onSelectRecipe(day.dinner!)}
                    className="group relative p-2.5 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200/70 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <span className="text-xs font-black text-stone-800 line-clamp-1 group-hover:text-stone-900">
                      {day.dinner.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMeal(dayIndex, 'dinner');
                      }}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenRecipePicker(dayIndex, 'dinner')}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-300 text-stone-400 hover:text-stone-700 hover:border-stone-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة عشاء</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
