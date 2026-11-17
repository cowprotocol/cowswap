import type * as ActiveLocaleModule from './useActiveLocale'

jest.mock('legacy/state', () => ({ cowSwapStore: { getState: () => ({ user: { userLocale: 'fr-FR' } }) } }))

// The widget locale is kept for the page session, so each test is a fresh page
function loadActiveLocale(): typeof ActiveLocaleModule {
  let activeLocaleModule: typeof ActiveLocaleModule | undefined

  jest.isolateModules(() => {
    activeLocaleModule = require('./useActiveLocale')
  })

  if (!activeLocaleModule) throw new Error('useActiveLocale not loaded')

  return activeLocaleModule
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
