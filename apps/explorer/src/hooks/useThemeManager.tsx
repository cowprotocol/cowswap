import { Theme } from 'theme/types'

const DARK_THEME_MANAGER: [Theme, (newTheme: Theme) => void] = [Theme.DARK, () => {}]

export function useThemeMode(): Theme {
  return Theme.DARK
}

export function useThemeManager(): [Theme, (newTheme: Theme) => void] {
  return DARK_THEME_MANAGER
}
