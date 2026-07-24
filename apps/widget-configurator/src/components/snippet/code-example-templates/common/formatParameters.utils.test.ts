import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

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

  it('drops invalid tradeType values from Javascript snippets', () => {
    const params = {
      appCode: 'test-app',
      tradeType: 'swap";alert(1);//',
    } as unknown as CowSwapWidgetParams

    const snippet = formatParameters(params, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('tradeType')
    expect(snippet).not.toContain('alert(1)')
  })

  it('emits TradeType enums only for valid Typescript trade types', () => {
    const validParams: CowSwapWidgetParams = {
      appCode: 'test-app',
      tradeType: TradeType.ADVANCED,
      enabledTradeTypes: [TradeType.SWAP, TradeType.YIELD],
    }

    const validSnippet = formatParameters(validParams, 0, true, DEFAULT_DARK_PALETTE)

    expect(validSnippet).toContain('TradeType.ADVANCED')
    expect(validSnippet).toContain('TradeType.SWAP')
    expect(validSnippet).toContain('TradeType.YIELD')

    const invalidParams = {
      appCode: 'test-app',
      tradeType: 'advanced};alert(1);//',
      enabledTradeTypes: [TradeType.SWAP, 'yield);alert(1);//'],
    } as unknown as CowSwapWidgetParams

    const invalidSnippet = formatParameters(invalidParams, 0, true, DEFAULT_DARK_PALETTE)

    expect(invalidSnippet).not.toContain('alert(1)')
    expect(invalidSnippet).not.toContain('TradeType.ADVANCED};ALERT(1);//')
    expect(invalidSnippet).toContain('TradeType.SWAP')
  })

  it('handles malformed trade type shapes safely', () => {
    const malformedParams = {
      appCode: 'test-app',
      tradeType: '',
      enabledTradeTypes: 'swap',
    } as unknown as CowSwapWidgetParams

    expect(() => formatParameters(malformedParams, 0, false, DEFAULT_DARK_PALETTE)).not.toThrow()
    expect(() => formatParameters(malformedParams, 0, true, DEFAULT_DARK_PALETTE)).not.toThrow()

    const jsSnippet = formatParameters(malformedParams, 0, false, DEFAULT_DARK_PALETTE)
    const tsSnippet = formatParameters(malformedParams, 0, true, DEFAULT_DARK_PALETTE)

    expect(jsSnippet).not.toContain('tradeType')
    expect(jsSnippet).not.toContain('enabledTradeTypes')
    expect(tsSnippet).not.toContain('tradeType')
    expect(tsSnippet).not.toContain('enabledTradeTypes')
  })
})
