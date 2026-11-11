import { UiOrderType } from '@cowprotocol/types'

jest.mock('react-appzi', () => ({
  __esModule: true,
  default: { initialize: jest.fn() },
}))

function loadAppziModule(isProdLike = false, isInjectedWidget = false): typeof import('./appzi') {
  jest.doMock('@cowprotocol/common-utils', () => ({
    isCoinbaseWalletBrowser: false,
    isImTokenBrowser: false,
    isInjectedWidget: () => isInjectedWidget,
    isProdLike,
    majorBrowserVersion: 120,
    userAgent: { browser: { name: 'Chrome' }, os: { name: 'Linux' } },
  }))

  let appziModule: typeof import('./appzi') | undefined

  jest.isolateModules(() => {
    appziModule = require('./appzi') as typeof import('./appzi')
  })

  if (!appziModule) throw new Error('Failed to load Appzi module')

  return appziModule
}

describe('getSurveyType', () => {
  it('uses the limit survey for limit orders', () => {
    const { getSurveyType } = loadAppziModule()

    expect(getSurveyType(UiOrderType.LIMIT)).toBe('limit')
  })

  it.each([UiOrderType.SWAP, UiOrderType.TWAP, UiOrderType.HOOKS, UiOrderType.YIELD, undefined])(
    'uses the NPS survey for %s orders',
    (orderType) => {
      const { getSurveyType } = loadAppziModule()

      expect(getSurveyType(orderType)).toBe('nps')
    },
  )
})

describe('triggerAppziSurvey', () => {
  beforeEach(() => {
    window.appziSettings = { userId: '', data: {} }
  })

  describe.each([
    { environment: 'test', isProdLike: false, limitFlag: 'isLimitSurveyTest', npsFlag: 'isTestNps' },
    {
      environment: 'production',
      isProdLike: true,
      limitFlag: 'isLimitSurveyProd',
      npsFlag: 'userTradedOrWaitedForLong',
    },
  ])('in $environment', ({ isProdLike, limitFlag, npsFlag }) => {
    it('preserves the existing limit survey trigger and order metadata', () => {
      const { getSurveyType, triggerAppziSurvey } = loadAppziModule(isProdLike)
      const data = { orderType: UiOrderType.LIMIT, created: true as const, chainId: 1, account: '0x123' }

      triggerAppziSurvey(data, getSurveyType(UiOrderType.LIMIT))

      expect(window.appziSettings).toEqual({ userId: '', data: { ...data, [limitFlag]: true } })
    })

    it('sets the NPS survey trigger and preserves TWAP order metadata', () => {
      const { getSurveyType, triggerAppziSurvey } = loadAppziModule(isProdLike)
      const data = { orderType: UiOrderType.TWAP, created: true as const, chainId: 1, account: '0x123' }

      triggerAppziSurvey(data, getSurveyType(UiOrderType.TWAP))

      expect(window.appziSettings).toEqual({ userId: '', data: { ...data, [npsFlag]: true } })
    })

    it('preserves the default NPS survey trigger', () => {
      const { triggerAppziSurvey } = loadAppziModule(isProdLike)
      const data = { orderType: UiOrderType.SWAP, traded: true as const }

      triggerAppziSurvey(data)

      expect(window.appziSettings).toEqual({ userId: '', data: { ...data, [npsFlag]: true } })
    })
  })

  it('does not trigger a survey for injected widgets', () => {
    const { getSurveyType, triggerAppziSurvey } = loadAppziModule(false, true)
    const previousSettings = { userId: 'existing-user', data: { orderType: UiOrderType.SWAP } }
    window.appziSettings = previousSettings

    triggerAppziSurvey({ orderType: UiOrderType.TWAP, created: true }, getSurveyType(UiOrderType.TWAP))

    expect(window.appziSettings).toBe(previousSettings)
  })
})
