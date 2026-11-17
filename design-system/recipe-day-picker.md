# Recipe day picker

Add to plan opens a single modal using the same Sunday–Saturday calendar layout as Plan. Selecting a date expands a brief overview beneath the calendar. Existing planned meals appear with a 48px recipe image and name; empty dates say No meals planned for this day yet. The overview heading toggles the dropdown, and choosing another date opens it again with that date’s meals.

Selecting a day does not save or move any meals. Users can adjust servings with icon-only plus/minus controls and explicitly confirm with Add to [date]. The confirmation replaces the picker contents inside the same open modal. Keep browsing dismisses it; Go to Plan opens the chosen day. Cancel/outside dismissal before confirmation makes no plan changes. Save failures keep the picker and selections available for retry.

Expo shares PlanCalendar with Plan and reads the overview from persisted planned meals. All six live Figma recipe pickers have draft selection variables, dynamic recipe/day previews, an empty state, explicit confirmation, and inline success. Preview and confirmation visibility are local runtime state, excluded from design tokens. No confirmation action navigates to another overlay. The older confirmation overlay remains preserved for unrelated references. Backups and research boards were untouched.

plan-day-overview-export.json contains current live node snapshots, runtime variables, and the six-picker reaction audit. The earlier export manifests point to this current artifact. Figma populated, empty, and inline success states were visually reviewed with temporary preview values restored afterward. Token generation, lint, typecheck, 45 tests, and iOS/Android/web exports passed. Device/browser playback remains unverified in the managed workspace.

Preview refinement: recipe names use 14px body text, with a 4px gap from the heading to the list. The heading and dropdown control appear only when meals exist. Empty dates show only the empty-day message; no hidden list space remains. Native header touch targets are preserved using hit slop rather than layout padding. See plan-preview-sizing-export.json for current snapshots.
