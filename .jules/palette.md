## 2025-05-01 - [Drum Pad Empty States]
**Learning:** Found a grid of drum pads where many pads were not mapped to any note, but still looked and acted like interactive buttons. Adding a `disabled` state with reduced opacity and a `not-allowed` cursor clearly communicates their unmapped status to the user.
**Action:** Always visually differentiate functional interactive elements from empty/unmapped placeholders in grid layouts.

## 2025-05-02 - [Icon Button Tooltips]
**Learning:** Icon-only buttons in the TopBar (Settings, Panic) had `aria-label`s for screen readers but lacked native tooltips (`title` attributes). Sighted users need tooltips to understand abstract icons, such as the power icon which specifically acts as "All Notes Off (Panic)".
**Action:** Always add `title` attributes to icon-only buttons so sighted users receive contextual help on hover.
