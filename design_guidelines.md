# FlashBack Design Guidelines

## Design Approach: Cypherpunk Aesthetic

**Selected Approach:** Reference-based with cypherpunk/cyberpunk visual language
**Key References:** Terminal interfaces, encrypted messaging apps (Signal), hacker aesthetics, The Matrix visual language
**Design Principles:**
- Privacy-first visual language with encryption metaphors
- Terminal-inspired minimalism meets emotional storytelling
- Speed through purposeful animations and instant feedback
- "Hacker-monk" fusion: technical precision with meditative calm

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Default):**
- Background Base: `0 0% 8%` (near-black)
- Background Elevated: `0 0% 12%` (subtle lift)
- Primary Brand: `145 85% 45%` (matrix green)
- Primary Muted: `145 40% 35%` (subdued green)
- Accent Cipher: `180 85% 55%` (cyan for encryption states)
- Text Primary: `145 20% 92%` (off-white with green tint)
- Text Secondary: `145 15% 65%` (muted green-gray)
- Text Tertiary: `145 10% 45%` (dark green-gray)
- Border: `145 25% 20%` (subtle green borders)
- Danger: `0 75% 55%` (red for delete actions)

**Light Mode (Optional Toggle):**
- Background: `145 30% 98%`
- Text: `145 80% 15%`
- Inverted primary color scheme

### B. Typography

**Font Families:**
- Primary/UI: `'JetBrains Mono', 'Roboto Mono', monospace` (Google Fonts)
- Display/Headers: `'Space Mono', monospace` (Google Fonts)
- Body fallback: System monospace stack

**Type Scale:**
- Display: `text-5xl md:text-6xl` (capsule titles, hero)
- H1: `text-3xl md:text-4xl font-semibold`
- H2: `text-2xl md:text-3xl font-medium`
- H3: `text-xl md:text-2xl font-medium`
- Body: `text-base leading-relaxed`
- Small/Meta: `text-sm tracking-wide uppercase`
- Code/Timestamps: `text-xs font-mono tracking-wider`

### C. Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16, 24** for consistent rhythm
- Component padding: `p-4 md:p-6 lg:p-8`
- Section spacing: `py-12 md:py-16 lg:py-24`
- Card gaps: `gap-4 md:gap-6`
- Icon margins: `mr-2` or `ml-2`

**Container Structure:**
- Max width: `max-w-6xl mx-auto`
- Dashboard: `max-w-5xl` (focused reading)
- Forms: `max-w-xl` (optimal input width)
- Full-width terminal sections: `w-full` with inner constraints

---

## D. Component Library

### Navigation
- **Header:** Sticky top bar with logo (monogram "FB" in terminal bracket style), nav links, user avatar
- Terminal-style breadcrumbs with `>` separators
- Glowing active states with `shadow-[0_0_10px_rgba(16,185,129,0.5)]`

### Cards & Containers
- **Capsule Cards:** Bordered cards with `border border-[145 25% 20%]`, subtle `bg-[0 0% 10%]`, rounded-lg
- **Encryption Visual:** Animated scanning line overlay on capsule previews (CSS keyframe)
- **Timeline Items:** Left-aligned with vertical connecting line, timestamp badges

### Forms & Inputs
- **Text Areas:** Dark `bg-[0 0% 10%]` with green border on focus, monospace font
- **Date Picker:** Custom terminal-style with ASCII calendar visual
- **Voice Recorder:** Waveform visualization in matrix green with recording timer
- **Photo Upload:** Drag-drop zone with encryption progress bar animation

### Buttons & CTAs
- **Primary:** `bg-[145 85% 45%] text-black font-semibold` with subtle glow hover
- **Secondary:** Outline style `border border-[145 85% 45%] text-[145 85% 45%]` with backdrop blur on images
- **Danger:** `bg-[0 75% 55%]` for destructive actions
- **Icon Buttons:** 40px × 40px with centered icons, ghost hover states

### Data Display
- **Timeline:** Vertical timeline with past (dimmed) and future (bright) capsules
- **Dashboard Stats:** Minimal counter cards with terminal-style number displays
- **Status Indicators:** Pulsing dot for "scheduled", checkmark for "delivered", lock icon for "encrypted"

### Modals & Overlays
- **Capsule Creation Modal:** Full-screen overlay with step-by-step terminal prompts
- **Payment Modal:** Stripe-integrated, minimalist pricing cards with encryption badge
- **AI Prompt Seeds:** Floating tooltip-style suggestions with typewriter animation

---

## E. Micro-Interactions (Minimal)

- **Encryption Animation:** Brief matrix rain effect when capsule is saved (2 seconds max)
- **Countdown Timers:** Real-time countdown to delivery with terminal-style digits
- **Typing Indicator:** Blinking cursor in text areas
- **Loading States:** Terminal-style progress bar with ASCII art
- **Page Transitions:** Subtle fade (150ms) only

---

## Images

### Hero Section
- **Large Hero Image:** Abstract visualization of encrypted data streams / digital particles flowing through time tunnels
- Style: Dark with matrix green light trails, bokeh effects, futuristic and mysterious
- Placement: Full-width hero with 60% opacity overlay, text overlaid on left third

### Dashboard Background
- **Subtle Pattern:** Repeating circuit board texture at 5% opacity as fixed background
- Encryption symbols (locks, keys, binary) as decorative elements in timeline margins

### Empty States
- Illustration of locked vault with beam of light for "No capsules yet"
- Abstract clock/calendar hybrid visual for scheduling interface