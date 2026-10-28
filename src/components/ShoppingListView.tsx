import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Share2, 
  Printer, 
  RotateCcw,
  Check
} from 'lucide-react';
import { ShoppingItem } from '../types.ts';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (name: string, amount: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onClearAll,
}) => {
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemAmount, setNewItemAmount] = useState<string>('');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemAmount.trim() || 'حسب الرغبة');
    setNewItemName('');
    setNewItemAmount('');
  };

  const completedCount = items.filter((i) => i.checked).length;
  const pendingCount = items.length - completedCount;

  const filteredItems = items.filter((i) => {
    if (activeFilter === 'pending') return !i.checked;
    if (activeFilter === 'completed') return i.checked;
    return true;
  });

  const handleShare = () => {
    const pending = items.filter((i) => !i.checked);
    const text = `قائمة مقاضي التسوق (هناكل إيه):\n${pending.map((i) => `• ${i.item} (${i.amount})${i.recipeTitle ? ` [${i.recipeTitle}]` : ''}`).join('\n')}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              قائمة النواقص ومقاضي التسوق 🛒
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              مجموع المقادير ({items.length}) • المتبقي ({pendingCount}) • تم شراؤه ({completedCount})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="نسخ ومشاركة عبر الواتساب"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedShare ? 'تم النسخ!' : 'مشاركة'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="طباعة القائمة"
              >
                <Printer className="w-4 h-4" />
              </button>

              {completedCount > 0 && (
                <button
                  onClick={onClearCompleted}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                >
                  حذف المشترى
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add New Item Input Form */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-2 no-print">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="أضف غرضاً للشراء (مثلاً: لبن زبادي، بقدونس، سمنة)..."
          className="flex-1 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          placeholder="الكمية (مثلاً: 1 كغ، باقة واحدة)..."
          className="w-full sm:w-44 text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة للقائمة</span>
        </button>
      </form>

      {/* Filter Tabs */}
      {items.length > 0 && (
        <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1 no-print">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              الكل ({items.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              المتبقي للطلب ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'completed'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              تم شراؤه ({completedCount})
            </button>
          </div>

          <button
            onClick={onClearAll}
            className="text-stone-400 hover:text-rose-600 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        </div>
      )}

      {/* Shopping Items List */}
      <div className="space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                item.checked
                  ? 'bg-stone-100/70 border-stone-200 text-stone-400 line-through'
                  : 'bg-white border-stone-200 hover:border-amber-400 text-stone-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
                )}
                <div>
                  <span className="font-bold text-sm block">{item.item}</span>
                  {item.recipeTitle && (
                    <span className="text-[11px] text-stone-400 font-medium">
                      من وصفة: {item.recipeTitle}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                  item.checked ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-900'
                }`}>
                  {item.amount}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="text-stone-300 hover:text-rose-500 p-1 no-print"
                  title="حذف من القائمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-stone-800">قائمة التسوق فارغة حالياً</h3>
            <p className="text-xs sm:text-sm max-w-sm mx-auto">
              تصفح أي وصفة واضغط على «أضف جميع المقادير لقائمة التسوق»، أو اكتب النواقص يدوياً أعلاه!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
