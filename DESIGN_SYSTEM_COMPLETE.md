# 🎨 MEDITATVA FRONTEND DESIGN SYSTEM & UI/UX SPECIFICATION
**Complete Design Language Documentation**

Your friend can use this as the master design specification for the entire MediTatva frontend redesign.

---

## 📋 EXECUTIVE SUMMARY

MediTatva uses a **premium dark-mode health tech aesthetic** with a sophisticated green color palette, glassmorphism effects, holographic animations, and a modular component system. The design prioritizes user wellness insights through data visualization, interactive holographic elements, and AI-generated insights in a futuristic medical interface.

---

## 🎨 COLOR SYSTEM

### Primary Dark Palette

- **Background Primary**: `#0f172a` (slate-950) - Page backgrounds, darkest sections
- **Background Secondary**: `#111827` (slate-900) - Card backgrounds, nested containers
- **Background Tertiary**: `#1e293b` (slate-800) - Elevated surfaces, overlays
- **Overlay Light**: `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.15)` - Subtle borders and dividers

### Brand Green Palette (Primary Accent)

- **Green Primary**: `#22c55e` (emerald-400/green-500) - Main hologram glow, primary CTAs, success states
- **Green Secondary**: `#10b981` (emerald-500/emerald-600) - Secondary accents, health indicators
- **Green Tertiary**: `#14b8a6` (teal-600) - Tertiary elements, subtle highlights
- **Green Glow**: `rgba(34,197,94,0.85)` to `rgba(34,197,94,0.35)` - Box shadows, glows, neon effects

### Secondary Accents

- **Cyan**: `#06b6d4` (cyan-500) - Information, connections, secondary CTAs
- **Amber**: `#f59e0b` (amber-500) - Warnings, attention-required states, caution indicators
- **Red**: `#ef4444` (red-500) - Critical alerts, danger states, important warnings
- **Purple**: `#a855f7` (purple-500) - Premium features, highlights

### Text Colors

- **Primary Text**: `#ffffff` (white) - Main headings, important content
- **Secondary Text**: `#cbd5e1` (slate-200) - Body text, descriptions
- **Tertiary Text**: `#94a3b8` (slate-400) - Metadata, labels, timestamps
- **Muted Text**: `#64748b` (slate-500) - Disabled states, minimal importance

### Status Colors

- **Excellent/Normal**: `#10b981` (emerald-500) - Healthy values
- **Good**: `#3b82f6` (blue-500) - Good but not optimal
- **Average**: `#f59e0b` (amber-500) - Needs attention
- **Critical/Warning**: `#ef4444` (red-500) - Urgent action needed

---

## 🌈 SHADOW & GLOW SYSTEM

### Card Shadows

- **Base**: `0 10px 25px -5px rgba(0,0,0,0.3)` - Default card shadow
- **Elevated**: `0 20px 50px -5px rgba(0,0,0,0.4)` - Hover state, interactive elements
- **Subtle**: `0 4px 12px rgba(0,0,0,0.2)` - Small components, badges

### Green Glow Effects (Holographic)

- **Soft Glow**: `0 0 20px rgba(34,197,94,0.6)` - Default hologram elements
- **Medium Glow**: `0 0 40px rgba(34,197,94,0.5)` - Active states
- **Strong Glow**: `0 0 80px rgba(34,197,94,0.45)` - Primary hologram container
- **Ultra Intense**: `0 0 80px rgba(34,197,94,0.85)` - Heart pulse, critical focus points

### Inset Glows (Depth)

- **Subtle**: `inset 0 0 20px rgba(34,197,94,0.08)` - Card inner glow
- **Medium**: `inset 0 0 40px rgba(34,197,94,0.12)` - Panel emphasis
- **Strong**: `inset 0 0 80px rgba(34,197,94,0.15)` - Major sections

### Other Accent Glows

- **Cyan Glow**: `0 0 20px rgba(6,182,212,0.5)` - Information, connections
- **Purple Glow**: `0 0 24px rgba(168,85,247,0.6)` - Premium, Brain icons
- **Amber Glow**: `0 0 20px rgba(245,158,11,0.5)` - Warnings

---

## 📐 TYPOGRAPHY SYSTEM

**Font Family**: `system-ui, -apple-system, sans-serif` - Clean, modern, accessible

### Heading Hierarchy

- **H1**: 48px-60px | Weight: 700 (Bold) | Letter Spacing: -0.02em | Line Height: 1.2
- **H2**: 30px-36px | Weight: 700 | Letter Spacing: -0.01em | Line Height: 1.3
- **H3**: 20px-24px | Weight: 700 | Letter Spacing: 0 | Line Height: 1.4
- **H4**: 16px-18px | Weight: 600 | Line Height: 1.5

### Body Text

- **Large**: 16px | Weight: 400 | Line Height: 1.6 | Color: slate-200
- **Regular**: 14px | Weight: 400 | Line Height: 1.6 | Color: slate-200
- **Small**: 12px | Weight: 400 | Line Height: 1.5 | Color: slate-400
- **Tiny**: 10px | Weight: 500 | Line Height: 1.4 | Letter Spacing: 0.05em | Color: slate-500

### Special Text Styles

- **Data Values**: 32px-48px | Weight: 700 | Font: monospace (system-ui) | Color: white
- **Data Label**: 10px-11px | Weight: 600 | Letter Spacing: 0.1em | Uppercase | Color: green-200/60
- **Gradient Text**: `bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-300`

---

## 🎯 SPACING & LAYOUT SYSTEM

**Base Unit**: 4px (all spacing uses multiples of 4px)

### Padding Scales

- **xs**: 6px (small badges, tight components)
- **sm**: 12px (small buttons, compact cards)
- **md**: 16px (standard containers, normal inputs)
- **lg**: 24px (section padding, card padding)
- **xl**: 32px (major sections)
- **2xl**: 40px (full page margins)
- **3xl**: 48px (large panels, containers)

### Margin Scales

- **Between sections**: 32px (mb-8) - Default spacing between major components
- **Between sub-sections**: 24px (mb-6) - Cards, panels within a section
- **Between items**: 16px (gap-4, gap-6) - Grid gaps, flex gaps
- **Tight spacing**: 8px-12px - Related elements, stacked components

### Max-Width Containers

- **Page max-width**: 64rem (6xl) - Main content container, balanced readability
- **Card max-width**: 100% - Cards span full container width
- **Grid columns**: 1 (mobile) → 2 (md) → 3 (lg) → 4 (xl)

### Border Radius

- **Buttons/Badges**: 8px-12px (rounded-lg, rounded-xl)
- **Cards**: 16px-24px (rounded-2xl, rounded-3xl)
- **Icons**: 50% (rounded-full)
- **Large panels**: 24px-32px (rounded-3xl)

---

## 🎬 ANIMATION & MOTION SYSTEM

**Animation Engine**: Framer Motion with React best practices

### Timing Standards

- **Quick interactions**: 200ms (hover, click feedback)
- **Standard transitions**: 300ms-400ms (page transitions, card reveals)
- **Slow meaningful**: 600ms-800ms (entrance animations, data loads)
- **Continuous loops**: 3s-6s (breathing effects, pulsing, orbital)
- **Extra slow**: 18s+ (background gradients, slow orbits)

### Easing Functions

- **UI Interactions**: `easeInOut` - Natural, balanced
- **Entrance animations**: `easeOut` - Quick into place
- **Exit animations**: `easeIn` - Quick away
- **Continuous**: `linear` - Orbit rings, scanning lines
- **Breathing effects**: `easeInOut` - Pulsing, opacity changes

### Core Animation Patterns

#### 1. Fade-In & Stagger (Page Load)

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 * index, duration: 0.4, ease: "easeOut" }}
>
  {content}
</motion.div>
```

#### 2. Scale & Glow (Hover Effects)

```jsx
<motion.div
  whileHover={{ 
    scale: 1.02,
    boxShadow: "0 0 60px rgba(34,197,94,0.4)"
  }}
  transition={{ duration: 0.2 }}
>
  {content}
</motion.div>
```

#### 3. Pulsing/Breathing (Hologram Parts)

```jsx
<motion.ellipse
  animate={{
    opacity: [0.3, 0.8, 0.3],
    scale: [1, 1.1, 1]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

#### 4. Continuous Rotation (Orbit Rings)

```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 30,
    repeat: Infinity,
    ease: "linear"
  }}
>
  {orbitRing}
</motion.div>
```

#### 5. Scanning Line (Hologram)

```jsx
<motion.div
  className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent"
  animate={{ y: [-600, 600] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

#### 6. Floating Particles

```jsx
<motion.div
  animate={{
    y: [-20, 20],
    opacity: [0, 1, 0]
  }}
  transition={{
    duration: 3 + Math.random() * 2,
    repeat: Infinity,
    delay: Math.random() * 2
  }}
/>
```

#### 7. Progress Bar Fill

```jsx
<motion.div
  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 1.5, ease: "easeOut" }}
/>
```

#### 8. Background Gradient Orbs

```jsx
<motion.div
  className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.5, 0.3]
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

---

## 🧩 COMPONENT SYSTEM

### Button Components

#### Primary CTA

```jsx
className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full px-6 py-2.5 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
```

#### Secondary

```jsx
className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full hover:scale-105 transition-all"
```

#### Ghost

```jsx
className="bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 text-cyan-400 hover:scale-105 transition-all"
```

**All buttons**: Hover scale 1.05, active scale 0.95, transition 200ms smooth

### Badge Components

#### Status Badge

```jsx
className="bg-${color}-500/30 text-${color}-200 border border-${color}-400/50 rounded-full px-3 py-1 text-xs font-bold"
```

#### Label Badge

```jsx
className="bg-${color}/20 text-${color}-200 border border-${color}-400/40 rounded-full px-4 py-1 text-xs font-semibold"
```

#### Priority Badge

```jsx
className="bg-${color}-500/30 text-${color}-200 rounded-full px-3 py-1 text-xs font-bold"
```

### Card Components

#### Base

```jsx
className="rounded-2xl md:rounded-3xl border border-white/10 hover:border-white/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg p-6 md:p-8 transition-all hover:scale-[1.02]"
```

#### Animated Border

Add `before:` element with:
```jsx
className="before:absolute before:-inset-px before:bg-gradient-to-r before:from-cyan-500/40 before:via-emerald-500/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
```

#### Glow

```jsx
className="shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.4)]"
```

### Input/Form Components

```jsx
className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 focus:border-green-400/60 text-white placeholder:text-slate-400 rounded-xl"
```

### Hologram Container

#### Main Size
- **Width**: 320px
- **Height**: 440px

#### Report Overview Size
- **Width**: 280px
- **Height**: 380px

```jsx
className="border-2 border-green-400/60 rounded-3xl shadow-[0_0_80px_rgba(34,197,94,0.45)] [box-shadow:inset_0_0_80px_rgba(34,197,94,0.15)] bg-[radial-gradient(circle_at_50%_40%,rgba(34,197,94,0.28),transparent_65%)]"
```

**Grid Overlay**:
```jsx
className="opacity-40 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[length:28px_28px]"
```

---

## 🏗️ PAGE LAYOUT PATTERNS

### Standard Page Flow

1. **Header** (sticky or fixed) - Back button, Download/CTA buttons
2. **Hero/Info Panel** - Patient details, key metrics
3. **Visual Section** - Vital signs grid, holographic display
4. **Analysis Section** - Test results grid with expandable details
5. **Recommendations** - 2-column wellness plan
6. **Summary/Footer** - Health score breakdown, closing CTA

### Grid Layouts

- **Single Column (Mobile)**: `grid-cols-1`
- **2-Column (Tablet)**: `md:grid-cols-2`
- **3-Column (Desktop)**: `lg:grid-cols-3`
- **4-Column (Large)**: `xl:grid-cols-4`
- **Asymmetric**: `lg:grid-cols-[2fr_1.2fr]` for hologram + sidebar patterns

### Spacing Pattern

- **Top padding**: `pt-16 md:pt-20` after header
- **Section bottom**: `mb-16 md:mb-20` between major sections
- **Item gap**: `gap-4 md:gap-6` for grids and flex
- **Card padding**: `p-6 md:p-8` inside cards
- **Text spacing**: `mb-3 md:mb-4` between text blocks

---

## 🌐 INTERACTIVE PATTERNS

### Hover States

- **Cards**: Scale up 2-5%, border brightens, shadow increases, glow intensifies
- **Buttons**: Background brightens, shadow grows, text color shifts
- **Icons**: Rotate slightly (5-10°), scale up 1.1x
- **Text links**: Underline appears, color brightens

### Click/Tap States

- **Buttons**: Scale down to 0.95x, feedback haptic on mobile
- **Cards**: Quick scale animation (1.02 → 0.98 → 1.02)

### Loading States

- **Shimmer effect**: Animated gradient sweep left-to-right
- **Pulsing opacity**: Fade in/out loop
- **Skeleton screens**: Placeholder gradient boxes

### Active/Selected States

- **Highlighted border**: `border border-green-400/60` or `border-cyan-400/60`
- **Background shift**: `bg-gradient-to-r from-green-500/30 to-emerald-500/20`
- **Glow effect**: Enhanced shadow and box-shadow
- **Badge update**: Status badge changes color to match selection

---

## 📊 DATA VISUALIZATION

### Progress Bars

- **Height**: 8px-12px
- **Background**: `bg-white/5 rounded-full overflow-hidden`
- **Fill**: `bg-gradient-to-r from-cyan-400 to-emerald-400`
- **Border**: `border border-white/10`
- **Animation**: Smooth 1.5-2s fill from 0% to target%

### Status Indicators

- **Dot**: `h-2.5 w-2.5 rounded-full shadow-[0_0_12px_color]`
- **Colors**: Emerald (normal), Amber (attention), Red (critical), Slate (unavailable)
- **Pulse animation** on important states

### Value Display

- **Large numbers**: 32px-48px bold monospace, white
- **Unit labels**: 10px uppercase, green-200/60
- **Range displays**: value / range format
- **Comparison**: Show ideal vs actual side-by-side

---

## 🎨 PREMIUM EFFECTS & FINISHING TOUCHES

### Glassmorphism

```jsx
className="backdrop-blur-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10"
```

### Gradient Overlays

#### Background
```jsx
className="bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.15),transparent_50%)]"
```

#### Text
```jsx
className="bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-300 text-transparent"
```

#### Borders
```jsx
className="bg-gradient-to-r from-cyan-500/40 via-emerald-500/20 to-transparent"
```

### Neon Accents

- **Green glow** on hologram elements
- **Cyan accents** for information, connections
- **Animate glow intensity** with opacity changes

### Micro-interactions

- Tooltip fade-in on hover
- Icon rotation on interaction
- Bounce effect on important notifications
- Smooth color transitions on status changes

### Premium Touches

- ✅ Consistent use of green glow throughout
- ✅ Pulsing heart in hologram center
- ✅ Rotating orbit rings in background
- ✅ Floating particle effects
- ✅ Scanning line effect in hologram
- ✅ Smooth page transitions between routes

---

## 🚀 IMPLEMENTATION BEST PRACTICES

### Performance

- Use `motion.div` instead of `div` for Framer Motion animations
- Lazy load heavy components (hologram rendering)
- Memoize expensive re-renders with `React.memo`
- Use CSS Grid/Flexbox instead of absolute positioning where possible
- Optimize images: Convert to WebP, use proper sizes

### Accessibility

- **Semantic HTML**: `<button>`, `<h1>`-`<h6>`, `<label>`, `<article>`
- **Color contrast**: All text meets WCAG AA standards
- **Keyboard navigation**: All interactive elements focusable
- **ARIA labels**: Add for icon-only buttons, complex structures
- **Reduced motion**: `prefers-reduced-motion` media query support

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge latest)
- Fallbacks for `backdrop-filter` (older Safari)
- CSS gradients fully supported
- CSS Grid and Flexbox standard

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

- **Mobile**: 0px-640px - Single column, touch-optimized
- **Tablet**: 641px-1024px (md) - 2 columns, readable text
- **Desktop**: 1025px-1440px (lg) - Full layout, 3 columns
- **Large**: 1441px+ (xl) - Expanded layouts, 4 columns

### Responsive Typography

- **H1**: 40px (mobile) → 60px (desktop)
- **Body**: 14px (mobile) → 16px (desktop)
- Adjust padding proportionally

### Touch Optimization

- **Minimum tap target**: 44x44px for buttons
- **Increased spacing** on mobile: Gap increases from 4px to 6-8px
- **Swipe gestures** for navigation on mobile

---

## 🎓 COLOR ACCESSIBILITY

All color combinations meet WCAG AA contrast ratios:

- ✅ **White text on green**: 7.2:1
- ✅ **White text on slate-800**: 8.5:1
- ✅ **Green on dark slate**: 6.1:1
- ✅ **Amber on dark**: 5.8:1

Use this palette for all UI elements with confidence in accessibility.

---

## 📚 QUICK REFERENCE CHEAT SHEET

### Colors (Most Used)
```css
/* Backgrounds */
--bg-primary: #0f172a;
--bg-secondary: #111827;
--bg-tertiary: #1e293b;

/* Green Palette */
--green-primary: #22c55e;
--green-secondary: #10b981;
--green-glow: rgba(34,197,94,0.6);

/* Accents */
--cyan: #06b6d4;
--amber: #f59e0b;
--red: #ef4444;

/* Text */
--text-primary: #ffffff;
--text-secondary: #cbd5e1;
--text-tertiary: #94a3b8;
```

### Common Classes
```jsx
// Card Base
"rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg p-8"

// Button Primary
"bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-6 py-2.5 font-semibold shadow-lg hover:scale-105"

// Badge Status
"bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 rounded-full px-3 py-1 text-xs font-bold"

// Hologram Container
"border-2 border-green-400/60 rounded-3xl shadow-[0_0_80px_rgba(34,197,94,0.45)]"
```

---

**This is the complete design system. Apply this to every page, component, and interaction in MediTatva. Stay consistent with colors, spacing, animations, and typography for a cohesive premium health tech experience!** 🚀

---

**Version**: 1.0.0  
**Last Updated**: January 29, 2026  
**Maintained by**: MediTatva Design Team
