import { Category, reportEvent } from './index'

export function toggleDarkModeAnalytics(darkMode: boolean) {
  reportEvent({
    category: Category.THEME,
    action: 'Toggle dark/light mode',
    label: `${darkMode ? 'Dark' : 'Light'} mode`,
  })
}
