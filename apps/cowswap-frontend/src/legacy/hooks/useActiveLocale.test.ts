import type * as ActiveLocaleModule from './useActiveLocale'
import type * as WidgetLocaleModule from '../utils/widgetLocale'

jest.mock('legacy/state', () => ({ cowSwapStore: { getState: () => ({ user: { userLocale: 'fr-FR' } }) } }))

// The widget locale is kept for the page session, so each test is a fresh page
function loadActiveLocale(): typeof ActiveLocaleModule & Pick<typeof WidgetLocaleModule, 'setWidgetLocale'> {
  let activeLocaleModule: typeof ActiveLocaleModule | undefined
  let widgetLocaleModule: typeof WidgetLocaleModule | undefined

  jest.isolateModules(() => {
    activeLocaleModule = require('./useActiveLocale')
    widgetLocaleModule = require('../utils/widgetLocale')
  })

  if (!activeLocaleModule || !widgetLocaleModule) throw new Error('useActiveLocale not loaded')

  return { ...activeLocaleModule, setWidgetLocale: widgetLocaleModule.setWidgetLocale }
}

describe('getActiveLocale', () => {
  beforeEach(() => {
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    window.location.hash = ''
  })

  it('takes the widget locale from the integrator', () => {
    const { getActiveLocale } = loadActiveLocale()

    window.location.hash = '#/1/widget/swap/USDC?lng=en'

    expect(getActiveLocale()).toBe('en-US')
  })

  it('keeps the integrator locale after a widget link drops it', () => {
    const { getActiveLocale } = loadActiveLocale()

    window.location.hash = '#/1/widget/swap/USDC?lng=en'
    getActiveLocale()
    window.location.hash = '#/1/widget/limit/USDC?orderKind=sell'

    expect(getActiveLocale()).toBe('en-US')
  })

  it('takes a new locale from a params update of the integrator', () => {
    const { getActiveLocale, setWidgetLocale } = loadActiveLocale()

    window.location.hash = '#/1/widget/swap/USDC?lng=en'
    getActiveLocale()
    setWidgetLocale('es')
    window.location.hash = '#/1/widget/limit/USDC?orderKind=sell'

    expect(getActiveLocale()).toBe('es-ES')
  })

  it('follows the device after a params update of the integrator drops the locale', () => {
    const { getActiveLocale, setWidgetLocale } = loadActiveLocale()

    window.location.hash = '#/1/widget/swap/USDC?lng=en'
    getActiveLocale()
    setWidgetLocale(null)
    window.location.hash = '#/1/widget/swap/USDC'

    expect(getActiveLocale()).toBe('ru-RU')
  })

  it('follows the device in a widget without a locale, ignoring the stored one', () => {
    const { getActiveLocale } = loadActiveLocale()

    window.location.hash = '#/1/widget/swap/USDC'

    expect(getActiveLocale()).toBe('ru-RU')
  })

  it('takes the stored locale outside the widget', () => {
    const { getActiveLocale } = loadActiveLocale()

    window.location.hash = '#/1/swap/USDC'

    expect(getActiveLocale()).toBe('fr-FR')
  })
})
