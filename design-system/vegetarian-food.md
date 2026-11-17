# Vegetarian Food ingredient fallback

Live Figma component set: CRUMBS/Icon/Vegetarian Food (382:20825), in 02 · Components / 03 · Icons. Imported vector components preserved as Size=16, 24, 32, 48 variants. The existing Ingredient Image/Placeholder component (219:2488) now contains the 32px icon instance centered at (8, 8) in its 48px frame, propagating to ingredient galleries and lists. No ingredient photo is replaced.

SVG exports for all four sizes are in assets/vegetarian-food-{size}.svg and assets/index.json. vegetarian-food-export.json records the live exported vectors. Existing PNG placeholder exports are legacy snapshots; use the vector icon for new implementations.

Expo: Icon names vegetarianFood16/24/32/48 (vegetarianFood aliases 48); FoodImage uses the 32px icon centered in a 48px slot with the secondary text color when no photo exists. Recipe detail galleries, ingredient lists, pantry and shopping consumers share FoodImage. Decorative icons remain excluded from accessibility announcements; adjacent ingredient names provide labels.

Visually checked the variant set, ingredient gallery, and full Sheet-pan Chicken Souvlaki screen in live Figma. Research and backup boards were not directly edited.
