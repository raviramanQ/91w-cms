# Theme System Setup - Dark/Light Mode

## Overview

Added a complete dark/light theme system to the 91Wheels CMS with an attractive blue-themed login page and theme toggle functionality throughout the application.

## Features Implemented

### 1. Modern Login Page
- **Blue gradient theme** with animated background blobs
- **Glass-morphism design** with backdrop blur effects
- **Responsive layout** with smooth animations
- **Password visibility toggle** with eye icon
- **Loading states** with spinner animation
- **Error animations** with shake effect
- **Dark mode support** for login page

### 2. Theme System
- **Theme Context** (`ThemeContext.js`) for global theme state
- **localStorage persistence** - theme preference saved
- **Class-based dark mode** using Tailwind's `dark:` classes
- **Smooth transitions** between themes

### 3. Theme Toggle Button
- Located in AdminLayout header
- **Sun icon** for dark mode (switch to light)
- **Moon icon** for light mode (switch to dark)
- Accessible with tooltip
- Smooth icon transitions

### 4. Dark Mode Styling

**Login Page:**
- Dark gradient background (gray-900 → blue-900 → indigo-900)
- Dark form cards with glass effect
- Dark input fields with proper contrast
- Adjusted text colors for readability

**Admin Layout:**
- Dark header with backdrop blur
- Dark sidebar with proper contrast
- Dark navigation items
- Dark user info card
- Gradient backgrounds adapt to theme

**Components:**
- All text colors have dark mode variants
- Borders adjusted for dark mode
- Backgrounds use opacity for glass effects
- Hover states work in both themes

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.js          # Theme provider and hook
├── app/
│   ├── layout.js                # Wrapped with ThemeProvider
│   └── login/
│       └── page.js              # Modern login page with dark mode
├── components/
│   └── AdminLayout.js           # Theme toggle button + dark styles
└── tailwind.config.js           # Dark mode enabled
```

## Usage

### Toggle Theme
Click the sun/moon icon in the header to switch between dark and light modes.

### Theme Persistence
The selected theme is automatically saved to localStorage and restored on page reload.

### Using Theme in Components

```javascript
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="bg-white dark:bg-gray-800">
      <p className="text-gray-900 dark:text-white">
        Current theme: {theme}
      </p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

## Color Scheme

### Light Mode
- **Background:** Gradient from slate-50 → blue-50 → indigo-50
- **Cards:** White with subtle shadows
- **Text:** Gray-900 for headings, gray-700 for body
- **Accents:** Blue-600, Indigo-600

### Dark Mode
- **Background:** Gradient from gray-900 → blue-900 → indigo-900
- **Cards:** Gray-800 with opacity and backdrop blur
- **Text:** White for headings, gray-300 for body
- **Accents:** Blue-400, Indigo-400

## Login Page Features

### Visual Elements
1. **Animated Background Blobs**
   - Three floating gradient circles
   - Smooth blob animation (7s loop)
   - Staggered animation delays

2. **Logo Container**
   - Gradient background (blue-600 → indigo-600)
   - Hover scale effect
   - Shadow effects

3. **Form Card**
   - Glass-morphism effect
   - Rounded corners (2xl)
   - Backdrop blur
   - Border with opacity

4. **Input Fields**
   - Icon prefixes (Mail, Lock)
   - Password visibility toggle
   - Focus ring effects
   - Smooth transitions

5. **Submit Button**
   - Gradient background
   - Hover scale effect
   - Loading spinner
   - Icon (LogIn)

6. **Demo Credentials Card**
   - Compact design
   - Emoji icons
   - Glass effect

### Animations
- **Blob animation:** Floating background elements
- **Shake animation:** Error message
- **Scale animations:** Hover effects
- **Spin animation:** Loading state

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

## Theme Context API

```javascript
// ThemeContext.js
const { theme, toggleTheme } = useTheme()

// theme: 'light' | 'dark'
// toggleTheme: () => void
```

## Browser Support

- Modern browsers with CSS backdrop-filter support
- Fallback backgrounds for older browsers
- localStorage for theme persistence

## Customization

### Change Theme Colors

Edit the gradient colors in components:

```javascript
// Light mode
className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"

// Dark mode
className="dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"
```

### Add New Theme

Extend ThemeContext to support more themes:

```javascript
const [theme, setTheme] = useState('light') // 'light' | 'dark' | 'auto'
```

## Performance

- Theme preference cached in localStorage
- No flash of unstyled content (FOUC)
- Smooth transitions with CSS
- Minimal JavaScript overhead

## Accessibility

- Theme toggle has descriptive title
- Proper color contrast in both themes
- Focus states visible
- Screen reader friendly

## Next Steps

1. ✅ Modern login page with blue theme
2. ✅ Dark/light theme toggle
3. ✅ Theme persistence
4. ✅ Dark mode styles for all components
5. 🔲 Add theme to other pages (if needed)
6. 🔲 Add system preference detection (auto theme)
7. 🔲 Add more theme options (e.g., high contrast)

## Testing

**Test Light Mode:**
1. Click moon icon in header
2. Verify all components use light colors
3. Check login page appearance

**Test Dark Mode:**
1. Click sun icon in header
2. Verify all components use dark colors
3. Check contrast and readability

**Test Persistence:**
1. Toggle theme
2. Refresh page
3. Verify theme persists

**Test Login Page:**
1. Visit `/login`
2. Test in both themes
3. Verify animations work
4. Test form submission
5. Test error states

## Browser DevTools

Toggle dark mode manually:
```javascript
document.documentElement.classList.toggle('dark')
```

Check current theme:
```javascript
localStorage.getItem('theme')
```
