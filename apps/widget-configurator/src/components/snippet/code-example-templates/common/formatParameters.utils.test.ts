import { formatParameters } from './formatParameters.utils'

import { DEFAULT_DARK_PALETTE } from '../../../../configurator.constants'

describe('formatParameters', () => {
  it('does not emit TradeType.UNDEFINED when tradeType is missing from TS snippets', () => {
    const snippet = formatParameters({ appCode: 'test-app' }, 0, true, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('TradeType.UNDEFINED')
    expect(snippet).not.toMatch(/"tradeType"/)
  })

  it('substitutes tradeType enum value when tradeType is set', () => {
    const snippet = formatParameters({ appCode: 'test-app', tradeType: 'swap' }, 0, true, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain('TradeType.SWAP')
  })
})
