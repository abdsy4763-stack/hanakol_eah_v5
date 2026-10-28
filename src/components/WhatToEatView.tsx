import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  ChefHat, 
  Clock, 
  Flame, 
  Users, 
  ArrowRight,
  Check,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types.ts';

interface WhatToEatViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: number) => boolean;
}

export const WhatToEatView: React.FC<WhatToEatViewProps> = ({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  isFavorite,
}) => {
  // Roulette settings
  const [rouletteFilter, setRouletteFilter] = useState<string>('syrian'); // 'all' | 'syrian' | 'quick' | 'healthy' | 'vegetarian'
  const [spinning, setSpinning] = useState<boolean>(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);

  const handleSpinRoulette = () => {
    if (recipes.length === 0) return;
    setSpinning(true);
    setSuggestedRecipe(null);

    // Filter candidate recipes based on filter
    let pool = [...recipes];
    if (rouletteFilter === 'syrian') {
      pool = pool.filter((r) => r.cuisine.includes('سوري'));
    } else if (rouletteFilter === 'quick') {
      pool = pool.filter((r) => r.total_time <= 30);
    } else if (rouletteFilter === 'healthy') {
      pool = pool.filter((r) => r.diet_tags && (r.diet_tags.includes('صحي خفيف') || r.diet_tags.includes('كيتو')));
    } else if (rouletteFilter === 'vegetarian') {
      pool = pool.filter((r) => r.diet_tags && r.diet_tags.includes('نباتي'));
    }

    if (pool.length === 0) pool = recipes;

    // Simulate roulette roll
    let counter = 0;
    const maxTicks = 14;
    const interval = setInterval(() => {
      counter++;
      const tempPick = pool[Math.floor(Math.random() * pool.length)];
      setSuggestedRecipe(tempPick);

      if (counter >= maxTicks) {
        clearInterval(interval);
        setSpinning(false);
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          console.log(e);
        }
      }
    }, 120);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>محتار شو تطبخ اليوم؟ دعنا نساعدك بالاختيار فوراً</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          عجلة الحظ لاقتراح طبخة اليوم 🍽️
        </h2>
        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
          اختر نوع رغبتك اليوم واضغط على الزر، وسنختار لك وصفة أصيلة ومضمونة من بين أكثر من 2,000 وصفة!
        </p>
      </div>

      {/* Roulette Preference Filters */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <label className="text-xs font-black text-stone-700 block text-center">
          حدد اتجاه رغبتك في طبخة اليوم:
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: 'syrian', label: '🇸🇾 طبخة سورية أصيلة' },
            { id: 'quick', label: '⚡ سريعة (أقل من 30 د)' },
            { id: 'healthy', label: '🥗 صحي أو كيتو' },
            { id: 'vegetarian', label: '🌱 أكل نباتي' },
            { id: 'all', label: '🎲 أي طبخة من الموسوعة' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRouletteFilter(opt.id)}
              className={`p-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                rouletteFilter === opt.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <div className="text-center pt-4">
          <button
            onClick={handleSpinRoulette}
            disabled={spinning}
            className={`px-10 py-5 rounded-3xl font-black text-lg sm:text-xl text-white shadow-xl transition-all inline-flex items-center gap-3 ${
              spinning
                ? 'bg-amber-400 cursor-not-allowed scale-95'
                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:scale-105 active:scale-95 shadow-orange-600/30'
            }`}
          >
            <Dices className={`w-7 h-7 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'جاري اختيار الطبخة...' : 'اقترح لي طبخة الآن! 🎲'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Recipe Card Display */}
      {suggestedRecipe && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                  {suggestedRecipe.cuisine}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-100 text-orange-800">
                  {suggestedRecipe.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700">
                  درجة الصعوبة: {suggestedRecipe.difficulty}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug">
                {suggestedRecipe.title}
              </h3>

              {/* Multi-Diet Tags */}
              {suggestedRecipe.diet_tags && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestedRecipe.diet_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 pt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  وقت التحضير والطهي: {suggestedRecipe.total_time} دقيقة
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-stone-500" />
                  تكفي: {suggestedRecipe.servings} أشخاص
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {suggestedRecipe.calories} سعرة
                </span>
              </div>
            </div>

            {/* View Recipe Button */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <button
                onClick={() => onSelectRecipe(suggestedRecipe)}
                className="px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <span>عرض الطريقة والمقادير بالتفصيل</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSpinRoulette}
                className="px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Dices className="w-4 h-4" />
                <span>اقترح طبخة أخرى</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
