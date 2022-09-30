import { Category, sendEvent } from '../index'

export function toggleDarkModeAnalytics(darkMode: boolean) {
  sendEvent({
    category: Category.THEME,
    action: 'Toggle dark/light mode',
    label: `${darkMode ? 'Dark' : 'Light'} mode`,
  })
}
