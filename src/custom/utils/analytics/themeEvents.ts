import { Category, _reportEvent } from './index'

export function toggleDarkModeAnalytics(darkMode: boolean) {
  _reportEvent({
    category: Category.THEME,
    action: 'Toggle dark/light mode',
    label: `${darkMode ? 'Light' : 'Dark'} mode`,
  })
}
