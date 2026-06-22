import { CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'

import { WIDGET_SNIPPET_APP_CODE_PLACEHOLDER } from './common/codeExample.constants'
import { formatParameters } from './common/formatParameters.utils'
import { vanillaNoDepsExample } from './htmlExample'
import { jsExample } from './jsExample'
import { tsExample } from './tsExample'

import { CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK, DEFAULT_DARK_PALETTE } from '../../../configurator.constants'

describe('snippet export', () => {
  const dappModeParams: CowSwapWidgetParams = {
    appCode: 'test-app',
    standaloneMode: false,
  }

  it('preserves standaloneMode: false in copied JS snippets', () => {
    expect(jsExample(dappModeParams, DEFAULT_DARK_PALETTE)).toContain('"standaloneMode": false')
  })

  it('preserves standaloneMode: false in copied TS snippets', () => {
    expect(tsExample(dappModeParams, DEFAULT_DARK_PALETTE)).toContain('"standaloneMode": false')
  })

  it('preserves standaloneMode: false in copied HTML snippets', () => {
    expect(vanillaNoDepsExample(dappModeParams, DEFAULT_DARK_PALETTE)).toContain('"standaloneMode": false')
  })

  it('drops hostile trade asset values from generated snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      sell: {
        asset: '</script><script>alert(1)</script>',
      },
      buy: {
        asset: '"><img src=x onerror=alert(1)>',
      },
    }

    const snippet = vanillaNoDepsExample(params, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('"sell":')
    expect(snippet).not.toContain('"buy":')
    expect(snippet).not.toContain('alert(1)')
    expect(snippet).not.toContain('\\u003c/script')
  })

  it('preserves valid trade asset values in copied TS snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      sell: { asset: 'USDC', amount: '100000' },
      buy: { asset: 'COW', amount: '0' },
    }

    const snippet = tsExample(params, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain('"asset": "USDC"')
    expect(snippet).toContain('"asset": "COW"')
  })

  it('omits standaloneMode when it matches the widget default', () => {
    const snippet = formatParameters({ appCode: 'test-app', standaloneMode: true }, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('standaloneMode')
  })

  it('omits configurator reset deadline values from copied snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      forcedOrderDeadline: {
        [TradeType.SWAP]: 30,
        [TradeType.LIMIT]: 10080,
        [TradeType.ADVANCED]: 60,
      },
    }

    const snippet = formatParameters(params, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('forcedOrderDeadline')
  })

  it('preserves non-default forced deadline values in copied snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      forcedOrderDeadline: {
        [TradeType.SWAP]: 45,
        [TradeType.LIMIT]: 10080,
      },
    }

    const snippet = formatParameters(params, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain('"forcedOrderDeadline"')
    expect(snippet).toContain('"swap": 45')
    expect(snippet).not.toContain('"limit"')
  })

  it('omits deprecated top-level width when iframeStyle carries sizing', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      width: '100%',
      iframeStyle: { width: '100%', height: 'var(--dynamicHeight)' },
    }
    const snippet = formatParameters(params, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toMatch(/^  "width":/m)
    expect(snippet).toContain('"iframeStyle"')
    expect(snippet).toContain('"width": "100%"')
    expect((snippet.match(/"width": "100%"/g) ?? []).length).toBe(1)
  })

  it('strips preview appCode suffix in copied snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: `my-app (${CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK})`,
    }

    const snippet = tsExample(params, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain('"appCode": "my-app"')
    expect(snippet).not.toContain(CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK)
  })

  it('uses snippet placeholder when preview appCode is the configurator fallback', () => {
    const params: CowSwapWidgetParams = {
      appCode: CONFIGURATOR_WIDGET_PREVIEW_APP_CODE_FALLBACK,
    }

    const snippet = tsExample(params, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain(`"appCode": "${WIDGET_SNIPPET_APP_CODE_PLACEHOLDER}"`)
  })

  it('preserves legacy palette boxShadow in copied snippets', () => {
    const params: CowSwapWidgetParams = {
      appCode: 'test-app',
      theme: {
        baseTheme: 'light',
        ...DEFAULT_DARK_PALETTE,
        boxShadow: 'none',
      },
    }

    const snippet = tsExample(params, DEFAULT_DARK_PALETTE)

    expect(snippet).toContain('"boxShadow": "none"')
  })
})
