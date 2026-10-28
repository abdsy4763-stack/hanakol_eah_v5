import React, { useState } from 'react';
import { Package, Plus, X, RotateCcw, Sparkles } from 'lucide-react';

interface PermanentPantryViewProps {
  pantryItems: string[];
  onAddPantryItem: (item: string) => void;
  onRemovePantryItem: (item: string) => void;
  onResetPantryDefaults: () => void;
}

export const PermanentPantryView: React.FC<PermanentPantryViewProps> = ({
  pantryItems,
  onAddPantryItem,
  onRemovePantryItem,
  onResetPantryDefaults,
}) => {
  const [inputVal, setInputVal] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddPantryItem(inputVal.trim());
    setInputVal('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              مخزن المنزل ومؤونة البيت الدائمة 📦
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              المواد المتوفرة دائماً عندك (ملح، زيت، سمن، بهارات...). تُعتبر متوفرة تلقائياً في البحث ولا تُحسب كنواقص.
            </p>
          </div>
        </div>

        <button
          onClick={onResetPantryDefaults}
          className="text-xs font-bold text-stone-500 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
          title="استعادة المواد الأساسية الافتراضية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الأساسيات</span>
        </button>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="أضف مادة دائمة في مخزنك (مثلاً: نشا، سكر، خل تفاح، هيل)..."
          className="flex-1 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة للمخزن</span>
        </button>
      </form>

      {/* Items List Chips */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600">
          <span>المواد المحفوظة في مخزنك ({pantryItems.length}):</span>
          <span className="text-amber-700">تُضاف آلياً في البحث الذكي</span>
        </div>

        <div className="flex flex-wrap gap-2 min-h-24 p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
          {pantryItems.map((item, idx) => (
            <span
              key={idx}
              className="bg-white border border-stone-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-2 shadow-xs group hover:border-rose-300 transition-all"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemovePantryItem(item)}
                className="text-stone-300 hover:text-rose-600 transition-colors"
                title={`حذف ${item}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
