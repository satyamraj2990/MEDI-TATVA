# Video Position Control Guide

## How to Change Video Location in Login Page

The login page is built with **Flexbox** for easy position swapping. You can change the video location by modifying the `flex-direction` class on the main container.

### Current Implementation

The main container in `Login.tsx` uses:
```tsx
<div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
```

## Position Options

### 1. Video on LEFT (Default - Desktop)
```tsx
// Current setup
<div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
  {/* Video section comes first */}
  {/* Login form comes second */}
</div>
```

### 2. Video on RIGHT (Desktop)
Change `lg:flex-row` to `lg:flex-row-reverse`:
```tsx
<div className="min-h-screen flex flex-col lg:flex-row-reverse overflow-hidden">
  {/* Video section comes first in HTML */}
  {/* But displays on RIGHT due to flex-row-reverse */}
</div>
```

### 3. Video on TOP (Mobile - Default)
The `flex-col` class on mobile already stacks vertically:
```tsx
// Video appears on top on mobile screens (< 1024px)
<div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
```

### 4. Video on BOTTOM (Mobile)
Change `flex-col` to `flex-col-reverse`:
```tsx
<div className="min-h-screen flex flex-col-reverse lg:flex-row overflow-hidden">
  {/* Login form on top, video on bottom on mobile */}
</div>
```

## Quick Reference

| Layout | Class Combination |
|--------|-------------------|
| Video LEFT + Video TOP (mobile) | `flex flex-col lg:flex-row` ✅ Current |
| Video RIGHT + Video TOP (mobile) | `flex flex-col lg:flex-row-reverse` |
| Video LEFT + Video BOTTOM (mobile) | `flex flex-col-reverse lg:flex-row` |
| Video RIGHT + Video BOTTOM (mobile) | `flex flex-col-reverse lg:flex-row-reverse` |

## Video Settings
The video is configured with:
- `autoPlay` - Starts automatically
- `muted` - No sound (required for autoplay)
- `loop` - Repeats infinitely
- `playsInline` - Plays inline on mobile devices
- `object-cover` - Fills container without distortion

## Video File Location
Place your video file at:
```
/workspaces/MediTatva/meditatva-frontend/public/the_size_of_the_video_is_lands.mp4
```

The video will be accessible at `/the_size_of_the_video_is_lands.mp4` in the browser.
