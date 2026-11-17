# Overlay dismissal · 2026-11-03

All Expo dialogs dismiss when their backdrop is clicked or tapped. The shared Dialog uses a full-screen Pressable behind the dialog panel. The panel is a sibling, so clicks, typing, and scrolling inside do not bubble into the dismissal target. Safe-area wrapper gaps pass through to the backdrop. Escape/Android back and explicit close buttons keep their existing dismissal callbacks.

Backdrop dismissal also works while an action is saving. Dismissing closes the UI; it does not cancel an already-requested save. No cancel or destructive action is triggered by an outside click.

This covers recipe filters, add/edit meal dialogs, ingredient information, sharing, shopping review, pantry editors, plan setup, and settings confirmations. The framework-independent HTML Dialog reference also closes on a backdrop click, with a bounds check to preserve clicks in dialog padding and a pointer-down check to avoid dismissing when a drag starts inside.

The live Figma audit found three overlay destinations. Add-to-plan (`52:2566`) already uses native CLOSE_ON_CLICK_OUTSIDE. The onboarding (`121:2989`) and journey (`299:22874`) text-entry overlays were full-screen with no outside-dismiss behavior. Both now have a shaded close target behind a bottom entry sheet. Inside panel whitespace has a no-op hit shield; original fields, keys, Save/Cancel controls, IDs, and incoming links are preserved. Outside clicks close without committing the draft.

Figma's native overlay interaction property is read-only in the plugin API. The two entry sheets therefore use an explicit CLOSE reaction on the backdrop. Their panel occupies y=238–874 in the 402×874 reference viewport. The shaded area above is dismissible. The prototype-only inside-tap variable is excluded from visual tokens. Backups and research were not edited.

`overlay-dismissal-export.json` records the current screen trees, dismissal audit, preserved IDs, inside/outside hit regions, and Expo implementation status. Both updated Figma sheets were screenshot-reviewed. All three destinations have a dismissal path. Expo lint/typecheck, all 42 app tests, six handoff tests, and iOS/Android/web bundle exports pass. Direct browser/device interaction remains unverified because this managed environment cannot run the browser/device preview.
