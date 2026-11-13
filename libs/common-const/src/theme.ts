import type { FeatureFlags } from './featureFlags'

/**
 * localStorage key of the persisted CoW Swap `user` state (the default `redux-localstorage-simple` key of `user`).
 * Its `userDarkMode` (`null` follows the system) is the theme of CoW Swap and of the RWA app on `swap.cow.fi/rwa`.
 */
export const USER_STATE_STORAGE_KEY = 'redux_localstorage_simple_user'

export enum CustomTheme {
  CHRISTMAS = 'CHRISTMAS',
  HALLOWEEN = 'HALLOWEEN',
  SOLANA = 'SOLANA',
  NONE = 'NONE',
}

type CustomThemeFlagKeys = Partial<Record<CustomTheme, string>>

// Set the active custom theme here. This only changes ordering when multiple seasonal flags are enabled;
// themes still require their LaunchDarkly flags to be true before they can activate.
export const ACTIVE_CUSTOM_THEME: CustomTheme = CustomTheme.HALLOWEEN

const CUSTOM_THEME_PRIORITY: CustomTheme[] = [CustomTheme.HALLOWEEN, CustomTheme.CHRISTMAS]

export function getCustomThemePriority(): CustomTheme[] {
  if (ACTIVE_CUSTOM_THEME === CustomTheme.NONE) {
    return CUSTOM_THEME_PRIORITY
  }

  return [ACTIVE_CUSTOM_THEME, ...CUSTOM_THEME_PRIORITY.filter((theme) => theme !== ACTIVE_CUSTOM_THEME)]
}

const CUSTOM_THEME_FLAG_KEYS: Readonly<CustomThemeFlagKeys> = Object.freeze({
  [CustomTheme.CHRISTMAS]: 'isChristmasEnabled',
  [CustomTheme.HALLOWEEN]: 'isHalloweenEnabled',
  [CustomTheme.SOLANA]: 'isSolanaThemeEnabled',
})

export const APRILS_FOOLS_FLAG_KEY = 'isAprilsFoolsEnabled'

export interface CustomThemeContext {
  darkModeEnabled: boolean
  /** Whether the active network is Solana. */
  onSolanaChain?: boolean
  /** Whether the graffiti wall feature is on. */
  graffitiWallEnabled?: boolean
  /** Whether the graffiti wall page is the one on screen. */
  onWallPage?: boolean
  /** Whether the user turned the graffiti theme off in settings. */
  graffitiThemeOptOut?: boolean
}

export function isCustomThemeEnabled(theme: CustomTheme, featureFlags?: FeatureFlags): boolean {
  if (theme === CustomTheme.NONE) {
    return false
  }

  const flagKey = CUSTOM_THEME_FLAG_KEYS[theme]
  if (flagKey && featureFlags) {
    return Boolean(featureFlags[flagKey])
  }

  return false
}

/**
 * Resolve the active custom theme for a given UI context. Solana is chain-scoped rather than
 * seasonal, so it wins on its own network, and the wall page carries it on any network: that page
 * is the wall, and its own chrome is drawn to sit in this theme, so following the wallet's chain
 * there would leave it in the plain one until you switched networks. Either way it paints the live
 * graffiti wall, so it also needs the wall itself to be on. Opting out in settings drops it back to
 * whatever the context would otherwise give, but not on the wall page, whose own chrome assumes it.
 * Among the seasonal themes Halloween has global priority but requires dark mode; if it is enabled
 * by flags yet dark mode is off, no seasonal theme is applied.
 */
export function resolveCustomThemeForContext(
  featureFlags: FeatureFlags | undefined,
  context: CustomThemeContext,
): CustomTheme | undefined {
  if (wantsSolanaTheme(featureFlags, context)) {
    return CustomTheme.SOLANA
  }

  for (const theme of getCustomThemePriority()) {
    if (!isCustomThemeEnabled(theme, featureFlags)) {
      continue
    }

    if (theme === CustomTheme.HALLOWEEN) {
      if (!context.darkModeEnabled) {
        return undefined
      }
      return CustomTheme.HALLOWEEN
    }

    if (theme === CustomTheme.CHRISTMAS) {
      return CustomTheme.CHRISTMAS
    }
  }

  return undefined
}

/** The graffiti theme: chain-scoped rather than seasonal, so it is decided on its own terms. */
function wantsSolanaTheme(featureFlags: FeatureFlags | undefined, context: CustomThemeContext): boolean {
  if (!context.onSolanaChain && !context.onWallPage) return false
  // The wall page's own chrome is drawn to sit in this theme, so the setting does not reach it.
  if (context.graffitiThemeOptOut && !context.onWallPage) return false
  if (!context.graffitiWallEnabled) return false

  return isCustomThemeEnabled(CustomTheme.SOLANA, featureFlags)
}
