export enum CustomTheme {
  CHRISTMAS = 'CHRISTMAS',
  HALLOWEEN = 'HALLOWEEN',
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
})

export type FeatureFlags = Record<string, boolean | number | undefined>
export const APRILS_FOOLS_FLAG_KEY = 'isAprilsFoolsEnabled'

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

export function isCustomThemeActive(theme: CustomTheme, featureFlags?: FeatureFlags): boolean {
  return resolveActiveCustomTheme(featureFlags) === theme
}

export function resolveActiveCustomTheme(featureFlags?: FeatureFlags): CustomTheme | undefined {
  /**
   * Context-free resolver: returns the first enabled seasonal theme by priority.
   * It does not consider UI constraints (such as the dark-mode requirement for Halloween),
   * so prefer resolveCustomThemeForContext(...) when selecting themes for rendering or sounds.
   */
  for (const theme of getCustomThemePriority()) {
    if (isCustomThemeEnabled(theme, featureFlags)) {
      return theme
    }
  }

  return undefined
}

export interface CustomThemeContext {
  darkModeEnabled: boolean
}

/**
 * Resolve the active custom theme for a given UI context. Halloween has global priority but
 * requires dark mode; if it is enabled by flags yet dark mode is off, no seasonal theme is applied.
 */
export function resolveCustomThemeForContext(
  featureFlags: FeatureFlags | undefined,
  context: CustomThemeContext
): CustomTheme | undefined {
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
