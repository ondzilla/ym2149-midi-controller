## 2024-04-30 - Accessible Custom Form Controls
**Learning:** Using `opacity-0` on native interactive elements (like inputs or selects) layered over custom UI removes native keyboard focus indicators, causing severe accessibility issues for keyboard users.
**Action:** Use Tailwind's `has-[:focus-visible]` utility classes on the parent wrapper element to apply standardized, visible focus indicators (e.g., `has-[:focus-visible]:ring-2`) when the hidden native element receives focus.
