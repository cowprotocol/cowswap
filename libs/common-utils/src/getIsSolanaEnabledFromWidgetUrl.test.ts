import { getIsSolanaEnabledFromWidgetUrl } from './getIsSolanaEnabledFromWidgetUrl'

describe('getIsSolanaEnabledFromWidgetUrl', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('is false without a hash query', () => {
    expect(getIsSolanaEnabledFromWidgetUrl()).toBe(false)

    window.location.hash = '#/1/widget/swap'

    expect(getIsSolanaEnabledFromWidgetUrl()).toBe(false)
  })

  it('reads the flag out of the hash query', () => {
    window.location.hash = '#/1000000001/widget/swap/_/_?solanaEnabled=true'

    expect(getIsSolanaEnabledFromWidgetUrl()).toBe(true)
  })

  it('is false for any value other than true', () => {
    window.location.hash = '#/1/widget/swap?solanaEnabled=false'

    expect(getIsSolanaEnabledFromWidgetUrl()).toBe(false)
  })

  it('reads it alongside other query params', () => {
    window.location.hash = '#/1/widget/swap?palette=null&solanaEnabled=true&hooksEnabled=true'

    expect(getIsSolanaEnabledFromWidgetUrl()).toBe(true)
  })
})
