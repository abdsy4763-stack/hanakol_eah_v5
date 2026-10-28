import fs from 'fs';

const recipes = JSON.parse(fs.readFileSync('public/recipes.json', 'utf8'));

// Test detection functions
function getDishProfile(r) {
  const t = r.title;
  const c = r.category;
  const cui = r.cuisine;

  // 1. Seafood / Fish
  const fishWords = ['سمك', 'سردين', 'روبيان', 'قريدس', 'جمبري', 'حبار', 'سلمون', 'صيادية', 'دنيس', 'زبيدي', 'هامور', 'كنعد', 'تونة', 'طون', 'أخطبوط', 'سي فود', 'سلطعون', 'كابوريا', 'محار', 'كلماري', 'كالاماري', 'فواكه البحر', 'سيبيا', 'بلطي', 'ماكريل', 'فروخ', 'سنغر', 'سلطان إبراهيم', 'لقز', 'بوري', 'فونغولي'];
  if (fishWords.some(w => t.includes(w))) return 'seafood';

  // 2. Sweets / Desserts
  if (c === 'حلويات ومشروبات' || ['كنافة', 'معمول', 'بقلاوة', 'كيك', 'بسبوسة', 'قطايف', 'برازق', 'غريبة', 'مهلبية', 'هريسة', 'رز بحليب', 'أم علي', 'بلح الشام', 'عوامة', 'لقيمات', 'مشبك', 'تارت', 'حلاوة الجبن', 'تمرية', 'بين نارين', 'مفروكة', 'كليجة', 'زنود الست', 'دانغو', 'دوراياكي', 'موتشي', 'براوني', 'تيراميسو', 'تشيز كيك', 'بانا كوتا', 'كريم كراميل', 'سفوف', 'عصيدة'].some(w => t.includes(w))) {
    // Check if drink
    if (['شاي', 'قهوة', 'سحلب', 'كركديه', 'تمر هندي', 'عصير', 'شراب', 'مشروب', 'ماتشا', 'سموذي', 'كوكتيل'].some(w => t.includes(w))) {
      return 'drink';
    }
    return 'dessert';
  }

  // 3. Salads / Cold appetizers
  if (c === 'مقبلات وسلطات') {
    if (['سلطة', 'فتوش', 'تبولة', 'متبل', 'بابا غنوج', 'سيزر', 'كولسلو', 'سلطه'].some(w => t.includes(w))) return 'salad';
    if (['حمص', 'لبنة', 'مسبحة', 'جبنة', 'زيتون'].some(w => t.includes(w))) return 'cold_appetizer';
    if (['كبة', 'سمبوسك', 'فطائر', 'برك', 'يالنجي', 'ورق عنب'].some(w => t.includes(w))) return 'hot_appetizer';
    return 'salad';
  }

  // 4. Soups
  if (c === 'شوربات' || t.includes('شوربة') || t.includes('حساء') || t.includes('حريرة') || t.includes('كشك')) {
    return 'soup';
  }

  // 5. Pastries / Breads
  if (c === 'معجنات ومخبوزات' || ['مناقيش', 'فطائر', 'بيتزا', 'صفيحة', 'بوراك', 'سمبوسك', 'كرواسون', 'خبز', 'فوكاشيا', 'فطيرة', 'منقوشة', 'لحم بعجين'].some(w => t.includes(w))) {
    return 'pastry';
  }

  // 6. Breakfast / Eggs
  if (c === 'فطور وعشاء') {
    if (['بيض', 'شكشوكة', 'عجة', 'أومليت', 'مفركة بيض'].some(w => t.includes(w))) return 'breakfast_egg';
    if (['فول', 'فلافل', 'فتة', 'حمص'].some(w => t.includes(w))) return 'breakfast_legume';
    return 'breakfast_general';
  }

  // 7. Stuffed / Vine Leaves / Mahshi
  if (['محشي', 'يبرق', 'ورق عنب', 'دولمة', 'ملفوف'].some(w => t.includes(w))) {
    return 'mahshi';
  }

  // 8. Yogurt dishes (لبن)
  if (['شاكرية', 'شيش برك', 'كبة لبنية', 'باشا وعساكره', 'لبنية', 'شيخ المحشي'].some(w => t.includes(w))) {
    return 'yogurt_dish';
  }

  // 9. Rice / Biryani / Mandi / Kabsa / Mansaf
  if (['كبسة', 'برياني', 'مندي', 'مجبوس', 'أوزي', 'منسف', 'بخاري', 'مقلوبة', 'مدفون', 'بايلا', 'ريزوتو', 'أرز', 'رز'].some(w => t.includes(w))) {
    return 'rice_dish';
  }

  // 10. Pasta / Noodles
  if (['معكرونة', 'سباغيتي', 'باستا', 'لازانيا', 'نودلز', 'باد تاي', 'بيني', 'فيتوتشيني'].some(w => t.includes(w))) {
    return 'pasta';
  }

  // 11. Chicken
  if (['دجاج', 'فراخ', 'شيش طاووق', 'كوردون بلو', 'تندر', 'بروستد'].some(w => t.includes(w))) {
    return 'chicken';
  }

  // 12. Vegetarian stews / Veggies
  if (['خضار', 'سبانخ', 'ملوخية', 'بامية', 'فاصولياء', 'لوبياء', 'عدس', 'مجدرة', 'مسقعة', 'مفركة بطاطا', 'هندبة', 'كوسا'].some(w => t.includes(w)) && !t.includes('لحم') && !t.includes('دجاج') && !t.includes('موزات') && !t.includes('كفتة')) {
    return 'vegetarian_stew';
  }

  // 13. Meat dishes
  return 'meat_main';
}

const profileCounts = {};
recipes.forEach(r => {
  const p = getDishProfile(r);
  profileCounts[p] = (profileCounts[p] || 0) + 1;
});

console.log('Profile counts across 1053 recipes:');
console.log(profileCounts);
