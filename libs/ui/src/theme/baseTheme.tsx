import { css } from 'styled-components/macro'

import { Colors, CowProtocolTheme } from './typings'

import { Color, Gradients, getThemeColors } from '../colors'
import { UI } from '../enum'
import { CowSwapTheme } from '../types'

/**
 * Base theme implementation for CoW Protocol applications
 *
 * The base theme provides:
 * 1. Dark mode color variations
 * 2. Utility functions for styling
 * 3. Integration of static colors with theme context
 *
 * Usage:
 * const theme = baseTheme('dark')
 * <ThemeProvider theme={theme}>
 *
 * @param theme - Theme mode ('dark' | 'light')
 * @returns Complete theme object with colors and utilities
 */
export function baseTheme<T extends CowProtocolTheme>(theme: CowSwapTheme): CowProtocolTheme {
  const darkMode = theme === 'dark'

  return {
    ...colors(darkMode),
    ...utils(darkMode),
  } as T
}

/**
 * Generates the complete color palette based on theme mode
 * Combines:
 * 1. Dynamic theme-aware colors
 * 2. Static colors from Color enum
 * 3. Gradient definitions
 */
// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
function colors(darkMode: boolean): Colors {
  // TODO(theme-cleanup): These colors were migrated from apps/cow-fi/styles/variables.ts
  // They should be reviewed and potentially consolidated with the existing color system.

  // All theme-dependent colors are now calculated in colors.ts
  // We just call getThemeColors once with the darkMode parameter - much more DRY!
  const themeColors = getThemeColors(darkMode)

  return {
    // Import all static colors from Color first
    ...Color,
    // Add dynamic colors from Gradients
    ...Gradients,
    // Override with theme-specific computed values
    darkMode,
    // Spread all the computed theme colors
    ...themeColors,
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function utils(darkMode: boolean) {
  return {
    shimmer: css`
      background-image: linear-gradient(
        90deg,
        transparent 0,
        var(${UI.COLOR_PAPER}) 20%,
        var(${UI.COLOR_PAPER_DARKER}) 60%,
        transparent
      );
      animation: shimmer 2s infinite;
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
    colorScrollbar: css`
      scroll-behavior: smooth;

      /* Firefox-only styles */
      @supports (-moz-appearance: none) {
        /* another browsers support ::-webkit-scrollbar, so we need "scrollbar-color" only for Firefox */
        /* see https://caniuse.com/mdn-css_selectors_-webkit-scrollbar */
        scrollbar-color: var(${UI.COLOR_PAPER_DARKEST}) var(${UI.COLOR_TEXT_OPACITY_10});
      }

      &::-webkit-scrollbar {
        background: var(${UI.COLOR_PAPER_DARKER});
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(${UI.COLOR_TEXT_OPACITY_10});
        border: 3px solid var(${UI.COLOR_TEXT_OPACITY_10});
        border-radius: 14px;
        background-clip: padding-box;
      }
    `,
    invertImageForDarkMode: darkMode ? 'filter: invert(1) grayscale(1);' : null,
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}
