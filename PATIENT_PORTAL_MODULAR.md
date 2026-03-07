# Patient Portal - Modular Architecture

## Overview
The Patient Portal has been redesigned with a clean, modular architecture matching the MediTatva design system. All features are preserved while improving maintainability and code organization.

## Color Palette
- **Primary**: Teal/Cyan (#14B8A6, #06B6D4)
- **Accents**: 
  - Pink/Magenta (#EC4899)
  - Emerald/Green (#10B981)
  - Blue/Purple (#3B82F6, #8B5CF6)
  - Amber (#F59E0B)
- **Backgrounds**: White/Gray-50 (light), Gray-900/950 (dark)
- **Text**: Gray-900 (light), White (dark)

## Component Structure

### Core Components (`/components/patient/`)

#### 1. **PatientHeader**
- Responsive header with logo, branding, and theme toggle
- Mobile menu toggle button
- Sticky positioning for easy navigation

#### 2. **PatientProfile**
- User avatar with online status indicator
- Premium and Verified badges
- Health Score with animated progress bar
- Gradient styling matching design system

#### 3. **PatientSidebarMenu**
- Collapsible sidebar navigation
- Active state highlighting
- Smooth animations on hover/select
- Icon-based navigation with descriptions

#### 4. **RecentActivity**
- Timeline of recent user actions
- Color-coded activity icons
- Relative timestamps
- Hover effects for interactivity

#### 5. **QuickActions**
- Gradient cards for primary actions:
  - Scan Prescription (Pink gradient)
  - Find Medicine (Cyan gradient)
  - Book Appointment (Green gradient)
  - AI Assistant (Blue-Purple gradient)
  - Medical Reports (Sky-Blue gradient)
- 3D hover effects
- Responsive grid layout

## Main Dashboard (`PremiumPatientDashboardNew.tsx`)

### Sections
1. **Home** - Dashboard overview with recent activity and quick actions
2. **Nearby Stores** - Find pharmacies and medical stores
3. **Find Medicine** - Search for medicines with availability
4. **Orders** - Track medicine orders and history
5. **Cabinet** - Manage prescriptions and family members
6. **Appointments** - Book and manage doctor appointments
7. **Report Analyzer** - AI-powered medical report analysis
8. **Chat** - AI health assistant
9. **Settings** - User preferences and profile

### Features Preserved
✅ All existing functionality maintained
✅ Prescription Scanner
✅ Voice Chat (Saarthi)
✅ Medi Call Saarthi
✅ Conference Calls
✅ Chatbot Integration
✅ Theme Switching (Light/Dark)
✅ Responsive Design (Mobile/Tablet/Desktop)

## State Management
- Local state for UI controls
- Context providers for:
  - Theme (ThemeProvider)
  - Orders (OrderProvider)
- Session storage for authentication

## Responsive Behavior
- **Mobile (<768px)**: Sidebar collapses, hamburger menu
- **Tablet (768-1024px)**: Sidebar toggleable
- **Desktop (>1024px)**: Sidebar always visible

## API Integration
- Backend endpoint: `http://localhost:3000`
- Separate Gemini API keys:
  - `GEMINI_API_KEY` - Call Saarthi
  - `GEMINI_REPORT_ANALYZER_KEY` - Report Analyzer

## How to Use

### Import Components
```tsx
import {
  PatientHeader,
  PatientProfile,
  PatientSidebarMenu,
  RecentActivity,
  QuickActions
} from '@/components/patient';
```

### Customize Colors
Update gradients in component files:
- Pink: `from-pink-500 via-rose-500 to-pink-600`
- Cyan: `from-cyan-500 via-teal-500 to-cyan-600`
- Green: `from-green-500 via-emerald-500 to-teal-500`
- Blue: `from-blue-500 via-indigo-500 to-purple-500`

### Add New Quick Action
```tsx
{
  icon: YourIcon,
  label: "Action Name",
  description: "Brief description",
  gradient: "from-color-500 to-color-600",
  onClick: handleAction
}
```

### Add New Menu Item
```tsx
{
  id: "section-id" as Section,
  icon: YourIcon,
  label: "Section Name",
  description: "Brief description"
}
```

## File Structure
```
meditatva-frontend/
├── src/
│   ├── components/
│   │   └── patient/
│   │       ├── index.ts
│   │       ├── PatientHeader.tsx
│   │       ├── PatientProfile.tsx
│   │       ├── PatientSidebarMenu.tsx
│   │       ├── RecentActivity.tsx
│   │       └── QuickActions.tsx
│   └── pages/
│       └── PremiumPatientDashboardNew.tsx
```

## Benefits
1. **Modular**: Each component is self-contained and reusable
2. **Maintainable**: Easy to update individual sections
3. **Scalable**: Simple to add new features
4. **Consistent**: Follows design system throughout
5. **Performant**: Optimized rendering and animations
6. **Accessible**: Proper ARIA labels and keyboard navigation

## Future Enhancements
- [ ] Add settings page implementation
- [ ] Implement user profile editing
- [ ] Add notification preferences
- [ ] Create health insights dashboard
- [ ] Implement family member management UI

## Testing
```bash
# Build frontend
cd meditatva-frontend
npm run build

# Start development server
npm run dev

# Backend should be running on port 3000
cd meditatva-backend
npm start
```

## Support
For issues or questions, refer to the main project documentation or create an issue in the repository.
