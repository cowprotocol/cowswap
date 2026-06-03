import { DEFAULT_CONFIGURATOR_FORM_VALUES } from './configurator.constants'
import {
  getDefaultCustomColorsByTheme,
  resolveConfiguratorCustomColorsByTheme,
  resolveConfiguratorFormValues,
} from './configurator.utils'

describe('configurator.utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when no value is persisted', () => {
    expect(resolveConfiguratorFormValues(null)).toEqual(DEFAULT_CONFIGURATOR_FORM_VALUES)
    expect(resolveConfiguratorCustomColorsByTheme(null)).toEqual(getDefaultCustomColorsByTheme())
  })

  it('merges persisted form values with defaults', () => {
    const resolved = resolveConfiguratorFormValues({ appCode: 'dedicated-key-app' })

    expect(resolved.appCode).toBe('dedicated-key-app')
    expect(resolved.theme).toBe(DEFAULT_CONFIGURATOR_FORM_VALUES.theme)
  })

  it('merges persisted custom colors with defaults', () => {
    const defaults = getDefaultCustomColorsByTheme()
    const resolved = resolveConfiguratorCustomColorsByTheme({
      light: { ...defaults.light, primary: '#111111' },
      dark: defaults.dark,
    })

    expect(resolved.light.primary).toBe('#111111')
    expect(resolved.dark).toEqual(defaults.dark)
  })
})
