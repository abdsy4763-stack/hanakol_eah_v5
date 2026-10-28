import React from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  BookOpen, 
  Package, 
  CalendarDays, 
  Heart, 
  ShoppingCart,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  shoppingCount: number;
  totalRecipesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  shoppingCount,
  totalRecipesCount,
}) => {
  const navItems = [
    {
      id: 'search',
      label: 'البحث بالمكونات',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'all',
      label: 'جميع الوصفات',
      icon: BookOpen,
      badge: totalRecipesCount > 0 ? `${totalRecipesCount}+` : undefined,
    },
    {
      id: 'pantry',
      label: 'مخزن المنزل',
      icon: Package,
    },
    {
      id: 'planner',
      label: 'خطة الوجبات',
      icon: CalendarDays,
    },
    {
      id: 'favorites',
      label: 'المفضلة',
      icon: Heart,
      count: favoritesCount,
    },
    {
      id: 'shopping',
      label: 'قائمة الناقص',
      icon: ShoppingCart,
      count: shoppingCount,
      countColor: 'bg-amber-600',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                  هناكل إيه؟
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  المطبخ السوري والعربي
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                موسوعة الطبخ الأصيل ومساعدك الذكي لاقتراح الوجبات حسب مكوناتك
              </p>
            </div>
          </div>

          {/* Navigation Tabs Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className={`text-[11px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold text-white ${
                      item.countColor || 'bg-rose-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 gap-2 border-t border-stone-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
