## 2025-05-01 - [Drum Pad Empty States]
**Learning:** Found a grid of drum pads where many pads were not mapped to any note, but still looked and acted like interactive buttons. Adding a `disabled` state with reduced opacity and a `not-allowed` cursor clearly communicates their unmapped status to the user.
**Action:** Always visually differentiate functional interactive elements from empty/unmapped placeholders in grid layouts.

## 2025-05-02 - [Icon Button Tooltips]
**Learning:** Icon-only buttons in the TopBar (Settings, Panic) had `aria-label`s for screen readers but lacked native tooltips (`title` attributes). Sighted users need tooltips to understand abstract icons, such as the power icon which specifically acts as "All Notes Off (Panic)".
**Action:** Always add `title` attributes to icon-only buttons so sighted users receive contextual help on hover.

## 2025-05-03 - [Accessible Custom Toggles and Labels]
**Learning:** Found custom toggle buttons lacking state announcement (e.g., in `SettingToggle` and Arp Mode) and custom labels that weren't programmatically linked to their hidden inputs. Adding `aria-pressed={state}` makes custom toggle buttons accessible to screen readers, and explicitly linking custom `<label>`s to inputs using `htmlFor` and `id` ensures proper accessibility association even when native labels aren't used.
**Action:** Always use `aria-pressed` for custom toggle button states and ensure all `<label>` elements are programmatically linked to their corresponding form controls using `htmlFor` and `id`.
## 2024-05-04 - Semantic Linkage for Visually Hidden Inputs
**Learning:** When using modern CSS to visually hide native interactive inputs (`opacity-0`) while presenting custom UI alongside them, screen readers may lose the semantic connection between the custom visual label and the input if it relies solely on DOM order.
**Action:** Always wrap custom visual labels in a `<label>` element and programmatically link them to the hidden native `<input>` or `<select>` using matching `htmlFor` and `id` attributes to guarantee robust screen reader support and hit-area expansion.
## 2025-05-05 - Visual Envelope Focus Feedback
**Learning:** For custom UI components that rely on visually hidden inputs (like `opacity-0` or `sr-only` native `<input type="range">`) overlaid on top of a graphical representation (like an SVG), keyboard users lose track of focus. We mapped the `onFocus` and `onBlur` states of these hidden inputs to update a React state (`focusedNode`), which we then used to apply a visible outline (`stroke-white stroke-2`) to the corresponding SVG node representing the data point.
**Action:** Always ensure that when using visually hidden native inputs to capture interactions for custom graphics, their focus state is programmatically tied to a visible indicator on the graphic itself.
