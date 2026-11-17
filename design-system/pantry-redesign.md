# Pantry category and icon update

Implemented in live Figma and Expo. Pantry: 299:18979. Visual reference: backed-up Ingredients screen 316:27481 on 97 · Backup · Before design system · 2026-10-19. Backups remain unchanged.

The pantry rows are unboxed, with 4px vertical padding, no horizontal padding, 16px column gaps, and no white background or border. Three columns contain 48px food artwork, flexible name/storage, and one right-aligned 24px chevron centered in a transparent 40px square with 8px padding. Quantities are omitted from these rows and remain editable in food details. The whole row is tappable.

Category heading-to-row gap is 8px and sections are 24px apart. The use-soon card, headings, navigation, scan action, Add food action and existing food-edit prototype actions remain. Category labels and image treatment follow the original ingredient page.

Reusable component: CRUMBS/Pantry/Food Row (361:19640), in 13 · Pantry on the Components page. Full content preview: 361:19727. Exposed properties: Label, Storage, Image. The master has no Quantity or Show quantity properties.

The Expo PantryFoodRow and DOM handoff use the same three-column layout. Figma screenshot and 280/320/362px width checks passed. All row edit destinations exist. Lint, typecheck, and design-system checks passed; device interactions were not re-tested.

Expo draws the chevron with native borders, avoiding SVG image decoding for the navigation cue. Device rendering has not been verified in this update.
