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
// No entries means every theme obeys its LaunchDarkly flag and will not appear unless enabled there.
const CUSTOM_THEME_OVERRIDES: CustomThemeOverrides = {}

const CUSTOM_THEME_PRIORITY: CustomTheme[] = [CustomTheme.HALLOWEEN, CustomTheme.CHRISTMAS]

export function getCustomThemePriority(): CustomTheme[] {
  if (ACTIVE_CUSTOM_THEME === CustomTheme.NONE) {
    return CUSTOM_THEME_PRIORITY
  }

  return [ACTIVE_CUSTOM_THEME, ...CUSTOM_THEME_PRIORITY.filter((theme) => theme !== ACTIVE_CUSTOM_THEME)]
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
  return resolveActiveCustomTheme(featureFlags) === theme
}

export function resolveActiveCustomTheme(featureFlags?: FeatureFlags): CustomTheme | undefined {
  for (const theme of getCustomThemePriority()) {
    if (isCustomThemeEnabled(theme, featureFlags)) {
      return theme
    }
  }

  return undefined
}
