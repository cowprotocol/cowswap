import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

import { vanillaNoDepsExample } from './htmlExample'
import { jsExample } from './jsExample'
import { tsExample } from './tsExample'

import { ColorPalette } from '../../configurator/types'

const defaultPalette: ColorPalette = {
  primary: '#000000',
  background: '#111111',
  paper: '#222222',
  text: '#ffffff',
}

describe('widget snippet serialization', () => {
  it('escapes script-breaking token values in the HTML snippet', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'Widget App',
      sell: {
        asset: '</script><script>alert(1)</script>',
      },
    }

    const snippet = vanillaNoDepsExample(params, defaultPalette)

    expect(snippet).not.toContain('</script><script>alert(1)</script>')
    expect(snippet).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e')
  })

  it('drops invalid tradeType values from Javascript snippets', () => {
    const params = {
      appCode: 'Widget App',
      tradeType: 'swap";alert(1);//',
    } as unknown as CowSwapWidgetParams

    const snippet = jsExample(params, defaultPalette)

    expect(snippet).not.toContain('tradeType')
    expect(snippet).not.toContain('alert(1)')
  })

  it('emits TradeType enums only for valid Typescript trade types', () => {
    const validParams: CowSwapWidgetParams = {
      appCode: 'Widget App',
      tradeType: TradeType.ADVANCED,
      enabledTradeTypes: [TradeType.SWAP, TradeType.YIELD],
    }

    const validSnippet = tsExample(validParams, defaultPalette)

    expect(validSnippet).toContain('TradeType.ADVANCED')
    expect(validSnippet).toContain('TradeType.SWAP')
    expect(validSnippet).toContain('TradeType.YIELD')

    const invalidParams = {
      appCode: 'Widget App',
      tradeType: 'advanced};alert(1);//',
      enabledTradeTypes: [TradeType.SWAP, 'yield);alert(1);//'],
    } as unknown as CowSwapWidgetParams

    const invalidSnippet = tsExample(invalidParams, defaultPalette)

    expect(invalidSnippet).not.toContain('alert(1)')
    expect(invalidSnippet).not.toContain('TradeType.ADVANCED};ALERT(1);//')
    expect(invalidSnippet).toContain('TradeType.SWAP')
  })
})
