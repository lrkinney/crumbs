# Home rebuild · 2026-11-17

Live Figma: **Home · homeActive** (`299:17217`, section 09) and **Home** (`5:4`, section 03). Previous versions are kept in **90 · Archive → 01 · Previous screen versions** (`392:43686`, `392:43699`).

## Order (both states)

1. **Calendar week list** — `CRUMBS/Plan/Week Selector` (`Day Tab` Default/Selected), Sun–Sat, today selected (Tue 17). Tapping another day in Expo shows that day's meals.
2. **Today** heading and the recipes planned for the selected day (`CRUMBS/Plan/Recipe Row`). With nothing planned: "Nothing is planned for today yet." and a ButtonBeige **Browse recipes**.
3. **Weekly budget** — heading, "$37.00 left of $75.00 this week", `CRUMBS/Home/Budget Meter`, and a short note. Tapping it opens the budget editor in Expo.
4. Everything else, moved underneath: *Your week is ready*, *Use it while it's fresh*, and the **See your week** action (active state); *Getting started* band and *Your kitchen setup* (empty state).

Removed as repetitive: the hero recipe photo and the "Tonight, already decided" card (replaced by the Today list), and the *Budget* row in *Your kitchen setup* (replaced by the budget section). The empty-state title now reads **Home** (it said "Current Plan").

## Budget Meter

`CRUMBS/Home/Budget Meter` (`392:43710`) is the Time Slider ruler without interaction: twelve variants `Stop=1…12` move the dark focus tick; override the value text (spent amount) and the endpoint labels ($0.00 and the budget). Spacing and sizes come from the existing `component.slider.*` tokens. Expo: `BudgetMeter` (`src/components/ui/budget-meter.tsx`) draws the same ruler through the shared `SliderRuler`, which `TimeSliderRuler` now also uses. The value turns the error colour when spending passes the budget.

Spacing uses existing variables (`space/16`, `space/24`, `space/32`, gutter).

## What "spent" means

The app records no purchase prices, so spent is the **estimated cost of the meals planned (or cooked) Sunday–Saturday in the current week** (`weekSpendMinor`, recipe estimates × servings). It is labelled as an estimate on the screen.

## Verification

Figma frames inspected visually. Expo lint, typecheck and 52 tests pass (new week-spend test); web export compiles. The Expo screen has not been run visually.

## Prototype wiring and calendar colour (follow-up)

- **Selected day is green.** `CRUMBS/Plan/Day Tab` → `State=Selected` now fills with `color/action/primary` and uses `color/text/on-action` for the day and date, matching the Expo calendar. This is the shared component, so the Plan screen and its overlays use the same selection colour.
- **Home calendar has its own variables** (`CRUMBS · Home`: `Home/Day/<Sun…Sat>/State`, `Home/Heading`, `Home/Show Tuesday meals`, `Home/Show Wednesday meals`, `Home/Show empty day`). Before, the cloned Week Selector shared the Plan screen's variables, so Present mode showed Plan's selected day. Each tab's `State` is bound to its Home variable; clicking a tab updates the selection, the heading ("Today" or the date) and which meals show (Tuesday: Honey Sriracha, Wednesday: Sheet-Pan Chicken Souvlaki, other days: nothing planned).
- **Buttons:** Browse recipes → Browse Recipes (`15:1203`); the recipe rows open their recipe screens; Weekly budget → the budget editor (`121:2383`); Your week is ready / See your week → Plan review; Use it while it's fresh → Pantry; Create a Plan and Portions keep their original links.

## Weekly budget (2026-11-17)

Figma section `15 · Weekly budget` (page 02) holds the system. Components:

- `CRUMBS/Home/Weekly Budget (chart)` (`410:27117`): heading, summary line, week chart and legend. States: Over a day, Planned, Not started.
- `CRUMBS/Home/Week Chart` (`410:26859`): seven equal-width columns of day bars with the weekday and date under each, so a day always sits under its bar. States: Over a day, Planned, Empty.
- `CRUMBS/Home/Day Bar` (`410:26589`): a day's bar. Variants `Bar=Sun … Sat` are the sample week, `Empty` and `Planned` are generic. Layers: tan Track (that day's allowance), Spent (dark, bottom), Planned (light, above), Over budget cap (orange).
- `CRUMBS/Home/Budget Legend Item` (`407:45461`): swatch, label and value pill. Kind = Spent, Planned, Remaining, Over budget.
- `CRUMBS/Home/Budget Value Pill` (`407:45435`).

Colours are tokens: Spent `action.primary`, Planned `action.primary-hover`, Remaining (the track) `surface.subtle`, Over budget `status.warning`. The old horizontal-bar Budget Bar and Weekly Budget components are removed; Home screens use the chart versions. The Budget Meter ruler (`392:43710`) is no longer used on Home.

### How the days share the budget

Each day starts with an even share of what is left after the days before it: `allowance(day) = floor((budget - charged so far) / days left)`. A day is charged the larger of its cost and its allowance, so:

- Spending less than a day's allowance does not raise later days (the unused part shows as tan track).
- Going over shrinks every remaining day to cover the overspend. A $75 week starts at $10.71 a day. If Tuesday costs $16.00, Wed to Sat share ($75.00 - 10.71 - 10.71 - 16.00) / 4 and their tracks get shorter.
- Once the budget is gone, later days have a track of zero and anything planned on them is over.
- The orange cap marks a day that went over its own allowance. The summary line still compares the whole week's cost with the budget.

Track height is proportional to the allowance; the tallest allowance fills the chart. Spent sits at the bottom and planned above it, both clipped to the track.

Expo: `WeeklyBudget` (`src/features/home/weekly-budget.tsx`) uses `WeekChart` and `DayBar` (`src/components/ui/week-chart.tsx`) and `BudgetLegendItem`, `ValuePill` (`src/components/ui/budget-breakdown.tsx`). Logic lives in `src/services/planning.ts`: `distributeDailyBudget`, `weekBudgetDays`, `weekChartBars`, with tests in `tests/planning.test.mjs`.
