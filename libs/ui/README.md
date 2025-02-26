# CoW Protocol UI Library

## Theming System

The CoW Protocol UI library implements a comprehensive theming system that provides consistent styling across all applications. The system is built on top of styled-components and follows a centralized color management approach.

### Current Implementation

The theming system currently has different implementations across our applications:

1. **CSS Variables System with Theme Awareness (cowswap-frontend)**

   ```typescript
   import { UI } from '@cowprotocol/ui'

   const StyledComponent = styled.div`
     color: var(${UI.COLOR_TEXT});
     background: var(${UI.COLOR_PRIMARY});
   `
   ```

   This is the target architecture, offering:

   - Theme-aware color variations
   - Dynamic color calculations
   - Automatic contrast handling
   - Consistent color usage across components

2. **Direct Color Enum Usage (cow-fi, explorer, others)**

   ```typescript
   import { Color } from '@cowprotocol/ui'

   const StyledComponent = styled.div`
     color: ${Color.neutral100};
     background: ${Color.cowfi_orange};
   `
   ```

3. **Mixed Approach (explorer)**
   - Uses direct Color enum
   - Implements some theme-aware styling through baseTheme
   - Dark mode only implementation
   - Planned migration to CSS variables system

Note: All applications use `baseTheme` as their foundation, but differ in how they apply colors:

- cowswap-frontend: CSS Variables + baseTheme
- explorer: Direct Color enum + baseTheme
- cow-fi: Direct Color enum + baseTheme

### Color System

#### Current State

Colors are currently defined in `colors.ts` and organized into categories:

1. **Neutral Colors** (neutral0 - neutral100)

   - Base grayscale palette
   - Used for text, backgrounds, and borders
   - Follows a consistent naming convention based on lightness

2. **Brand Colors** (Currently App-Specific)
   - CoW Protocol specific colors (prefixed with `cowfi_`)
   - CoW AMM specific colors (prefixed with `cowamm_`)
   - Explorer specific colors (prefixed with `explorer_`)

#### Target Architecture

The goal is to move away from app-specific colors towards a consolidated color system where:

1. Colors are shared across applications
2. Names reflect their purpose rather than their app origin
3. Theme-awareness is handled through CSS variables
4. Colors are automatically adjusted for:
   - Contrast ratios
   - Light/dark mode variations
   - Opacity variants
   - Interactive states (hover, active, etc.)

### Theme Implementation

The theming system consists of several key components:

1. **CSS Variables (`ThemeColorVars.tsx`)**

   - Defines theme-aware CSS variables
   - Handles dynamic color calculations
   - Provides automatic contrast adjustments
   - Currently used by cowswap-frontend
   - Imported in app's GlobalStyle component
   - Target implementation for all apps

2. **Base Theme (`baseTheme.tsx`)**

   - Provides the foundation for all themed components
   - Implements dark mode variations
   - Combines static colors with dynamic utilities

3. **Theme Provider**
   - Wraps applications with the theme context
   - Applies the base theme with appropriate mode
   - Integrates with styled-components

The system works in layers:

1. `baseTheme` provides the core theme structure and default values
2. `ThemeColorVars` builds on baseTheme to create CSS variables with dynamic calculations
3. Applications can use either CSS variables (preferred) or direct Color enum
4. Theme Provider ensures consistency across the component tree

### Best Practices

1. **For New Components**

   - Use CSS variables (UI enum) for theme-aware styling
   - Leverage `ThemeColorVars` for consistent theming
   - Example: `color: var(${UI.COLOR_TEXT})`

2. **For Existing Components**

   - Continue using the current pattern for consistency
   - Plan to migrate to CSS variables during future refactoring
   - When refactoring, move towards shared color names

   Migration process:

   1. Start with new features using CSS variables
   2. When touching existing components, evaluate if they can be migrated
   3. Gradually replace direct Color usage with equivalent UI enum CSS variables
   4. Coordinate with team when making shared component changes

3. **General Guidelines**
   - Avoid hardcoding colors outside the theming system
   - Place shared components in the UI library
   - Keep app-specific styling in the respective app directories
   - When adding new colors, consider if they can be shared

### Architecture

```
libs/ui/
├── src/
│   ├── colors.ts           # Central color definitions (current)
│   ├── enum.ts            # CSS variable definitions
│   ├── theme/
│   │   ├── baseTheme.tsx   # Theme foundation
│   │   ├── ThemeColorVars.tsx # Theme-aware CSS variables
│   │   ├── typings.ts      # Theme type definitions
│   │   └── ...
│   └── ...
```

For more detailed information about specific components or implementation details, refer to the inline documentation in the respective files.
