export enum CustomTheme {
  CHRISTMAS = 'CHRISTMAS',
  HALLOWEEN = 'HALLOWEEN',
  NONE = 'NONE',
}

type CustomThemeOverrides = Partial<Record<CustomTheme, boolean>>
type CustomThemeFlagKeys = Partial<Record<CustomTheme, string>>

// Set the active custom theme here
export const ACTIVE_CUSTOM_THEME: CustomTheme = CustomTheme.HALLOWEEN

// Manual overrides let us hard-toggle themes without touching LaunchDarkly.
// Set to `true` to force enable, `false` to force disable, or remove the entry to defer to feature flags.
const CUSTOM_THEME_OVERRIDES: CustomThemeOverrides = {
  [CustomTheme.CHRISTMAS]: false,
  [CustomTheme.HALLOWEEN]: true, // TODO: remove this when we disable Halloween theme
}

const CUSTOM_THEME_FLAG_KEYS: CustomThemeFlagKeys = {
  [CustomTheme.CHRISTMAS]: 'isChristmasEnabled',
  [CustomTheme.HALLOWEEN]: 'isHalloweenEnabled',
}

type FeatureFlags = Record<string, boolean | number | undefined>

export function isCustomThemeEnabled(theme: CustomTheme, featureFlags?: FeatureFlags): boolean {
  if (theme === CustomTheme.NONE) {
    return false
  }

  const manualOverride = CUSTOM_THEME_OVERRIDES[theme]
  if (manualOverride !== undefined) {
    return manualOverride
  }

  const flagKey = CUSTOM_THEME_FLAG_KEYS[theme]
  if (flagKey && featureFlags) {
    return Boolean(featureFlags[flagKey])
  }

  return false
}

export function isCustomThemeActive(theme: CustomTheme, featureFlags?: FeatureFlags): boolean {
  return ACTIVE_CUSTOM_THEME === theme && isCustomThemeEnabled(theme, featureFlags)
}
