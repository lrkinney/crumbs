import ingredients from '../../data/ingredients.json' with { type: 'json' };
/**
 * Offline grocery autocomplete names curated from generic foods represented in
 * USDA FoodData Central's public domain SR Legacy/Foundation food data.
 * These are generic foods, not branded products; the USDA dataset itself is
 * available at https://fdc.nal.usda.gov/download-datasets/.
 */
const groups: Record<string, string> = {
  Produce: `Apples|Applesauce|Apricots|Artichoke|Arugula|Asparagus|Avocado|Bananas|Beets|Bell pepper|Blackberries|Blueberries|Bok choy|Broccoli|Brussels sprouts|Cabbage|Cantaloupe|Carrots|Cauliflower|Celery|Cherries|Collard greens|Corn|Cranberries|Cucumber|Dates|Edamame|Eggplant|Fennel|Garlic|Ginger|Grapefruit|Grapes|Green beans|Green onions|Jalapeño|Kale|Kiwi|Leeks|Lemons|Lettuce|Limes|Mango|Mushrooms|Nectarines|Okra|Olives|Onions|Oranges|Parsley|Parsnips|Peaches|Pears|Peas|Pineapple|Plums|Potatoes|Pumpkin|Radishes|Raspberries|Romaine lettuce|Scallions|Spinach|Squash|Strawberries|Sweet potatoes|Swiss chard|Tomatillos|Tomatoes|Turnips|Watermelon|Yams|Yellow squash|Zucchini`,
  Protein: `Bacon|Beef chuck|Beef stew meat|Beef strips|Beef tenderloin|Beef top sirloin|Beef brisket|Chicken breast|Chicken drumsticks|Chicken thighs|Chicken wings|Chicken whole|Ground beef|Ground chicken|Ground turkey|Ham|Italian sausage|Lamb chops|Pork chops|Pork loin|Pork shoulder|Pork tenderloin|Sausage|Turkey breast|Turkey ground|Cod|Halibut|Salmon|Sardines|Scallops|Shrimp|Tilapia|Trout|Tuna|Tofu|Tempeh|Seitan`,
  Dairy: `American cheese|Butter|Buttermilk|Cheddar cheese|Cottage cheese|Cream cheese|Eggs|Feta cheese|Goat cheese|Heavy cream|Half and half|Monterey Jack cheese|Mozzarella cheese|Parmesan cheese|Pepper jack cheese|Provolone cheese|Ricotta cheese|Sour cream|Whipped cream|Whole milk|2% milk|Skim milk|Oat milk|Almond milk|Soy milk|Plain yogurt|Greek yogurt|Vanilla yogurt`,
  Bakery: `Bagels|Baguette|Bread|Burger buns|Corn tortillas|Flour tortillas|Hot dog buns|Naan|Pita bread|Sandwich rolls|Sourdough bread|Tortillas|Whole wheat bread|English muffins|Panko breadcrumbs|Breadcrumbs|Pizza dough|Pie crust|Puff pastry`,
  Cupboard: `All-purpose flour|Almond flour|Baking powder|Baking soda|Barley|Black beans|Black-eyed peas|Bread flour|Brown rice|Brown sugar|Canned black beans|Canned chickpeas|Canned corn|Canned kidney beans|Canned mushrooms|Canned salmon|Canned tuna|Canned white beans|Chia seeds|Chickpeas|Chicken broth|Chicken stock|Coconut milk|Coconut oil|Cornmeal|Couscous|Crushed tomatoes|Diced tomatoes|Dry lentils|Farro|Flaxseed|Granulated sugar|Kidney beans|Maple syrup|Mayonnaise|Old-fashioned oats|Pasta|Peanut butter|Pinto beans|Quinoa|Red lentils|Rolled oats|Steel-cut oats|Tomato paste|Tomato sauce|Vegetable broth|Vegetable oil|White beans|White rice|Whole wheat flour|Yeast|Applesauce|Canned pumpkin|Capers|Cereal|Cocoa powder|Coconut flakes|Cornstarch|Crackers|Dried cranberries|Dried apricots|Dried black beans|Dried chickpeas|Dried kidney beans|Dried navy beans|Dried pasta|Dried split peas|Granola|Jam|Jelly|Marinara sauce|Olive oil|Pasta sauce|Raisins|Red wine vinegar|Rice vinegar|Rolled oats|Sesame oil|Soy sauce|Sunflower oil|Tahini|White vinegar|Worcestershire sauce`,
  Spices: `Basil|Bay leaves|Black pepper|Cayenne pepper|Chili powder|Cinnamon|Cumin|Curry powder|Dill|Garlic powder|Italian seasoning|Nutmeg|Oregano|Paprika|Red pepper flakes|Rosemary|Salt|Smoked paprika|Thyme|Turmeric|Vanilla extract`,
  Frozen: `Frozen broccoli|Frozen berries|Frozen corn|Frozen green beans|Frozen mixed vegetables|Frozen peas|Frozen spinach|Frozen strawberries|Frozen blueberries|Frozen edamame|Frozen mango|Frozen pizza`,
  Snacks: `Almonds|Cashews|Peanuts|Pecans|Pistachios|Walnuts|Pumpkin seeds|Sunflower seeds|Popcorn|Pretzels|Tortilla chips`,
};

const catalog = Object.entries(groups).flatMap(([aisle, values]) => values.split('|').map(label => ({
  foodId: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  label,
  aisle,
  storage: (['Produce', 'Protein', 'Dairy'].includes(aisle) ? 'fridge' : aisle === 'Frozen' ? 'freezer' : 'cupboard') as 'fridge' | 'freezer' | 'cupboard',
})));
const recipeIds = new Set(ingredients.map(food => food.foodId));
const recipeLabels = new Set(ingredients.map(food => food.label.toLowerCase()));
export const commonFoods = [...ingredients, ...new Map(catalog.filter(food => !recipeIds.has(food.foodId) && !recipeLabels.has(food.label.toLowerCase())).map(food => [food.foodId, food] as const)).values()];
