# Current Plan action spacing · 2026-10-20

Current Plan (`52:2570`) now uses one shared Plan actions group (`342:21630`) for Browse recipes and Review week & groceries. The gap and top spacing use the existing foundation.space.16 variable. The group hugs its contents and both buttons fill the 362-point content width.

The original empty-state instance hides its nested Browse button locally; the shared master is unchanged. Its action is preserved in the shared group, which remains available for both empty and populated days. Both navigation reactions are preserved. Empty and populated states were inspected in live Figma screenshots; the gap measures 16 points in both. Temporary preview state changes were restored.

Expo uses one Stack with space.md between these same two actions, outside the conditional day content, keeping the gap consistent for both states. Repository lint and typecheck passed. Device interactions were not re-tested for this spacing change.

The adjacent JSON is a targeted export of the action group, merged into both handoff screen snapshots.
