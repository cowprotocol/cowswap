import { Theme } from 'theme/types'

export function useThemeMode(): Theme {
  return Theme.DARK
}

export function useThemeManager(): [Theme, (newTheme: Theme) => void] {
  return [Theme.DARK, () => {}] // No-op setter since we only use dark mode
}
