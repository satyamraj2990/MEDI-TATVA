#!/bin/bash

# MediTatva Professional HealthTech Design System - Quick Reference
# This document provides visual examples and implementation guides

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        🏥 MediTatva Professional HealthTech Design System            ║
║                                                                      ║
║        Production-Grade Landing Page & Dashboard                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📁 GENERATED FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Landing Page
   Location: meditatva-frontend/src/pages/LandingPage.tsx
   Features:
   • Full marketing landing page
   • Dark & light theme toggle
   • 5 main sections (Hero, Features, How It Works, Pharmacy, Trust)
   • Responsive mobile navigation
   • Accessible color contrast
   • Smooth animations with Framer Motion

✅ Professional Dashboard
   Location: meditatva-frontend/src/pages/ProDashboard.tsx
   Features:
   • Dual dashboards (Patient + Pharmacy views)
   • Mobile-responsive sidebar
   • Search bar + theme toggle
   • KPI cards with trends
   • Data tables with status badges
   • Real-time order tracking

✅ Design System Components
   Location: meditatva-frontend/src/components/DesignSystem.tsx
   Includes:
   • StatCard - KPI metrics
   • FeatureCard - Features showcase
   • Alert - Notifications
   • DataTable - Tabular data
   • Badge - Status indicators
   • Skeleton - Loading states
   • Modal - Dialog boxes
   • Design tokens + colors

✅ Design Documentation
   Location: /workspaces/MediTatva/DESIGN_SYSTEM.md
   Complete guide with:
   • Color system
   • Typography scale
   • Spacing system
   • Component specs
   • Accessibility guidelines
   • Animation patterns
   • Responsive breakpoints

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎨 COLOR SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIGHT THEME
├─ Background:      #FFFFFF (Pure white)
├─ Secondary BG:    #F8FAFC (Soft gray)
├─ Text:            #0F172A (Deep navy)
├─ Text Secondary:  #475569 (Slate gray)
└─ Accent:          Blue-600 → Purple-600 (gradient)

DARK THEME
├─ Background:      #0B1220 (Deep navy)
├─ Secondary BG:    #0F172A (Darker navy)
├─ Text:            #F8FAFC (Off-white)
├─ Text Secondary:  #CBD5E1 (Light gray)
└─ Accent:          Blue-500 → Purple-500 (gradient)

STATUS COLORS (Both themes)
├─ Success:         #10B981 (Emerald) - Delivered, Active
├─ Warning:         #F59E0B (Amber) - Pending, Low Stock
├─ Error:           #EF4444 (Red) - Failed, Out of Stock
└─ Info:            #3B82F6 (Blue) - Information, Progress

CONTRAST VERIFICATION ✅
├─ Light text on white:     18:1 (Excellent)
├─ Dark text on dark:       12:1 (Excellent)
├─ Blue-600 on white:       5.5:1 (Good)
└─ All meet WCAG AA standard (4.5:1 minimum)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏗️ COMPONENT SPECS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEADER
├─ Height:          80px (desktop), 64px (mobile)
├─ Padding:         16px (mobile) → 24px (desktop)
├─ Logo + Menu:     Left aligned
├─ Theme Toggle:    Top right
├─ Position:        Sticky with backdrop blur
└─ Z-index:         50

SIDEBAR
├─ Width:           256px (w-64)
├─ Position:        Fixed (mobile toggle), Static (desktop)
├─ Menu Items:      Rounded corners, 12px radius
├─ Active State:    Blue background (#3B82F6)
├─ Hover:           80% opacity
└─ Padding:         16px

CARDS
├─ Border Radius:   12px or 16px
├─ Padding:         24px or 32px
├─ Border:          1px solid, subtle color
├─ Hover Effect:    Lift (y: -4px), border color change
├─ Shadow:          Soft on hover
└─ Transition:      300ms ease-in-out

BUTTONS
├─ Primary:         Blue→Purple gradient, white text
├─ Secondary:       Outlined, colored border
├─ Hover:           90% opacity
├─ Focus:           Ring-2 outline
├─ Padding:         10px 24px
├─ Border Radius:   8px
└─ Font:            14px, semibold

FORMS
├─ Input Height:    40px
├─ Border:          1px solid, subtle gray
├─ Focus:           Ring-2 blue outline
├─ Label:           12px, semibold, above field
├─ Gap (label):     4px
└─ Spacing:         12px between fields

TABLES
├─ Row Height:      56px
├─ Header Bold:     14px, lighter color
├─ Borders:         Subtle, bottom only
├─ Hover State:     Light background change
├─ Status Badge:    Colored bg + text, rounded
└─ Density:         Generous (not compact)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✨ ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGE ENTRANCE
└─ initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.6 }}

CARD HOVER
└─ whileHover={{ y: -4 }}

MODAL
└─ initial={{ opacity: 0, scale: 0.95 }}
   animate={{ opacity: 1, scale: 1 }}

LOADING
└─ animate={{ opacity: [0.5, 0.8, 0.5] }}
   transition={{ duration: 1.5, repeat: Infinity }}

STAGGER (Multiple items)
└─ variants with delay: index * 0.1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📱 RESPONSIVE BREAKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mobile (xs)  | < 640px
├─ Sidebar:     Slide-out (toggle button)
├─ Grid:        1 column
├─ Padding:     16px
├─ Font:        14px
└─ Stack:       Full width

Tablet (md)  | 640px - 1024px
├─ Sidebar:     Visible or toggleable
├─ Grid:        2 columns
├─ Padding:     20px
├─ Font:        15px
└─ Navigation:  Horizontal

Desktop (lg) | 1024px+
├─ Sidebar:     Always visible
├─ Grid:        3+ columns
├─ Padding:     24-32px
├─ Font:        16px
└─ Full Layout: Optimized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VIEW LANDING PAGE
   Import in App.tsx:
   import { LandingPage } from '@/pages/LandingPage';
   
   Then:
   return <LandingPage />;

2. USE PATIENT DASHBOARD
   import { Dashboard } from '@/pages/ProDashboard';
   return <Dashboard userType="patient" />;

3. USE PHARMACY DASHBOARD
   import { Dashboard } from '@/pages/ProDashboard';
   return <Dashboard userType="pharmacy" />;

4. USE DESIGN COMPONENTS
   import { StatCard, DESIGN_TOKENS } from '@/components/DesignSystem';
   
   <StatCard
     label="Orders Today"
     value="24"
     icon={<ShoppingCart className="w-5 h-5 text-white" />}
     color="from-blue-600 to-blue-400"
     trend="+12%"
   />

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Dark & Light Themes
  • System preference detection
  • User toggle button
  • Persistent localStorage
  • Smooth transitions

✓ Accessibility (WCAG AA)
  • 4.5:1 contrast minimum
  • Semantic HTML
  • Focus states visible
  • Form labels present

✓ Responsive Design
  • Mobile-first approach
  • Tablet-optimized
  • Desktop-enhanced
  • Touch-friendly

✓ Professional UI/UX
  • Medical-grade aesthetics
  • Apple-inspired design
  • Enterprise SaaS feel
  • No playful elements

✓ Performance
  • Framer Motion animations
  • Lazy loading ready
  • Optimized components
  • Small bundle size

✓ Production Ready
  • Type-safe (TypeScript)
  • Fully responsive
  • Theme system included
  • Reusable components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 DESIGN PHILOSOPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This design system balances:

TRUSTWORTHINESS          MODERN AESTHETICS
├─ Medical-grade design  ├─ Gradient accents
├─ Security focus        ├─ Smooth animations
├─ Clear hierarchies     ├─ Clean typography
└─ Professional tone     └─ Minimal clutter

ACCESSIBILITY           PERFORMANCE
├─ High contrast        ├─ Optimized animations
├─ Keyboard nav         ├─ Efficient rendering
├─ Screen readers       ├─ Mobile-optimized
└─ Focus states         └─ Fast interactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

See DESIGN_SYSTEM.md for:
• Complete color tokens
• Typography scale
• Component specifications
• Animation patterns
• Accessibility guidelines
• Implementation examples
• Future enhancements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created with 🏥 for MediTatva - Professional HealthTech Platform

EOF
