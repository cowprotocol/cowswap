import { Category, _reportEvent } from './index'

const types = {
  toggle: 'Toggle dark/light mode',
}

export function toggleDarkModeAnalytics(darkMode: boolean) {
  _reportEvent({
    category: Category.THEME,
    action: types.toggle,
    label: `${darkMode ? 'Light' : 'Dark'} mode`,
  })
}
