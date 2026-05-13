import { __resetNoopCowAnalyticsInstance, createNoopCowAnalytics } from './createNoopCowAnalytics'

import { AnalyticsContext } from '../CowAnalytics'

describe('createNoopCowAnalytics', () => {
  afterEach(() => {
    __resetNoopCowAnalyticsInstance()
    delete (window as unknown as { cowAnalyticsInstance?: unknown }).cowAnalyticsInstance
    delete (window as unknown as { dataLayer?: unknown }).dataLayer
  })

  it('returns the same singleton', () => {
    const a = createNoopCowAnalytics()
    const b = createNoopCowAnalytics()
    expect(a).toBe(b)
  })

  it('registers on window without creating dataLayer', () => {
    expect(window.dataLayer).toBeUndefined()
    createNoopCowAnalytics()
    expect(window.dataLayer).toBeUndefined()
    expect(window.cowAnalyticsInstance).toBeDefined()
  })

  it('exposes safe no-op methods', () => {
    const analytics = createNoopCowAnalytics()
    expect(() => {
      analytics.setUserAccount('0xabc')
      analytics.sendPageView('/x')
      analytics.sendEvent({ category: 'c', action: 'a' })
      analytics.sendTiming('cat', 'var', 1, 'label')
      analytics.sendError(new Error('e'))
      analytics.setContext(AnalyticsContext.chainId, '1')
    }).not.toThrow()
  })

  it('invokes outbound hitCallback asynchronously', (done) => {
    const analytics = createNoopCowAnalytics()
    analytics.outboundLink({
      label: 'x',
      hitCallback: () => {
        done()
      },
    })
  })
})
