# Time Slider · 2026-10-20

Live Figma component: CRUMBS/Recipe/Time Slider (`334:20612`). The original ruler draft has been replaced by an instance in **Time Slider · Try in Present** (`337:21615`) on **02 · Components**. Select that demo frame and use Present, or choose its named prototype flow. The recipe filter screen also uses the component.

## Size and scale

- Reference instance: 362 × 92, fitting a 402-wide screen with 20-point gutters. Use **Fill container** for instances inside Auto Layout; the ruler stretches with its parent.
- Twelve selectable values: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60+. The last stop means no upper time limit.
- Linear stop position: `(minutes - 5) / 55`. Tick centers span from 24 to `width - 24`. There are exactly twelve ticks: one for each selectable five-minute value.
- Focus is a 24-high dark green tick. Other ticks are 16 high, 2 wide, with rounded ends. The selected number and Mins label follow the focus tick.
- Fourteen slider tokens cover sizing, edge inset, geometry, radius, and colors. Existing foundation, semantic color, and typography variables remain the source of shared values. Track edge padding is 23 = center inset 24 minus half the tick width.

## Interaction

Figma uses twelve Minutes variants. Click/tap a stop or hold and sweep across the ruler with a mouse to change values. The focused stop also has previous/next drag targets for stepped prototype swipes. Figma prototype events approximate dragging; they do not expose raw touch coordinates. Touch tracking and snapping in the Expo implementation follow the actual gesture. Present-mode interaction and device gestures still need manual testing.

The demo is an actual prototype flow. Component instances expose Minutes in the property panel. Journey Inputs slider/Minutes and slider/Dragging are prototype state, excluded from the visual token exports. Mouse up or leaving the control ends the sweep. State entry updates the minute variable.

Expo implements TimeSlider(value, onChange, disabled?) in the component library and recipe filter dialog. It supports touch/pointer dragging, tapping, web arrow keys/Home/End, screen-reader increment/decrement, and maximum-time filtering. Selecting 60+ clears the time limit. Web keeps vertical page scrolling available.

## Verification

- Inspected screenshots of the preview, all twelve variants, and the recipe filter screen.
- Live Figma geometry passed at widths 280, 362, and 600; maximum tick-center rounding error was below 0.001px. All inspected direct prototype transitions point to existing variants.
- Expo lint/typecheck, all 27 app tests, and both design-system test suites passed. Web, iOS, and Android bundle exports passed.
- Browser interaction tests could not run: local Chrome exited with SIGABRT. Device gestures and Figma Present-mode gestures are not claimed as tested.

`time-slider-export.json` is a targeted export and geometry/interaction audit, not a fresh export of the entire Figma file. The affected tokens, component definitions, and filter instance are merged into both handoff snapshots.

Typography correction: selected minutes use Matter SemiBold (600), while Mins and both endpoints use the lighter Matter Regular (400). Sizes match Figma at 14px for the selected value and 10px for supporting labels. Endpoint labels are centered under the first and last ticks. Removed intermediate decorative marks so every visible tick corresponds to an actual five-minute step. Verified live spacing at 280, 362, and 600px widths.
