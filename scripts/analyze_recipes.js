const fs = require('fs');

const recipes = JSON.parse(fs.readFileSync('public/recipes.json', 'utf8'));
console.log('Total recipes in public/recipes.json:', recipes.length);

const fishKeywords = [
  'سمك', 'سردين', 'روبيان', 'قريدس', 'جمبري', 'حبار', 'سلمون', 'صيادية',
  'دنيس', 'زبيدي', 'هامور', 'كنعد', 'تونة', 'طون', 'أخطبوط', 'سي فود',
  'سلطعون', 'كابوريا', 'محار', 'فواكه البحر', 'كلماري', 'كالاماري', 'سيبيا'
];

let fishCount = 0;
let fishWithMeatSteps = 0;

recipes.forEach(r => {
  const isFish = fishKeywords.some(k => r.title.includes(k) || r.ingredients.some(i => i.item.includes(k)));
  if (isFish) {
    fishCount++;
    const text = (r.instructions || []).join(' ');
    if (text.includes('لحم') || text.includes('دجاج') || text.includes('شيش برك')) {
      fishWithMeatSteps++;
      console.log(`Fish dish #${r.id} (${r.cuisine}): "${r.title}" has meat steps!`);
    }
  }
});

console.log(`\nFish summary: ${fishWithMeatSteps} out of ${fishCount} fish recipes have meat steps!`);
