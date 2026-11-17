# Onboarding · 2026-11-03

The live Figma screens and Expo app use this order:

Welcome → Name → Ingredients to avoid → Eating preference → Nutrition goals → Pantry → Budget → Portions → Household → Review.

Ingredients to avoid is now immediately before “How do you like to eat?” in both the canvas order and prototype actions, including Skip. The eight setup questions have eight progress segments. Review lists ingredient exclusions before diet and includes all restored choices and optional targets.

The optional branches are:

- Nutrition goals → Optional nutrition targets → Return to the originating screen.
- Household → Account preview → Invitation draft → Draft confirmation → Review.
- Each review row opens its editor; saving returns to review. Back preserves unsaved choices. Finish setup is the completion action.
- Your kitchen → Review onboarding reopens every screen with saved choices. It does not reset existing pantry, meals, or shopping data.

The Expo app now includes all 14 onboarding screens from the live design: welcome, profile, ingredient exclusions, eating preference, goals, targets, pantry, budget, portions, household, review, account, invite, and draft confirmation. Figma’s fifteenth text-entry frame remains a prototype keyboard adapter; Expo uses native text inputs and the platform keyboard.

Ingredient exclusions and nutrition choices persist as optional household fields, so older saved kitchens remain readable. Pantry setup saves actual quantities and compatible units. New custom foods default to cupboard storage, which can be edited in Pantry. Nutrition choices are saved preferences, not a claim that recipe nutrition has been calculated. Ingredient exclusions are recorded here; this change does not add verified allergen metadata to the fixture recipes.

Account sign-in, cloud sharing, and invitation delivery are not connected in this local prototype. The account and invitation screens state that limitation; email addresses are local drafts and passwords are never persisted. No invitation is sent.

Long Figma choice lists, pantry setup, and review use vertical scrolling above a fixed footer. Expo screens scroll above a safe-area-aware footer. Multi-select rows expose checkbox semantics; single-select rows use radio semantics. Inputs validate the current step; optional screens can be skipped. Storage failures remain visible without completing setup.

`onboarding-export.json` is a targeted live export of the onboarding screens, the profile replay entry, header variants, canvas positions, and validation metadata. It is merged into both `figma-export.json` copies and the generated component contracts. Existing screen IDs, backups, research, and archive boards are preserved.

Validation: live Figma screenshots reviewed; no invalid onboarding prototype destinations; Expo lint/typecheck and all 34 tests pass; iOS, Android, and web bundle exports pass. Browser and device interaction remain unverified: localhost returns EPERM and local Chrome exits SIGABRT in this managed environment. No signed native app was installed or published.
