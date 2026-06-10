import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './common/formatParameters.utils'
import { vanillaNoDepsExample } from './htmlExample'
import { jsExample } from './jsExample'
import { tsExample } from './tsExample'

import { DEFAULT_DARK_PALETTE } from '../../../configurator.constants'

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

  it('omits standaloneMode when it matches the widget default', () => {
    const snippet = formatParameters({ appCode: 'test-app', standaloneMode: true }, 0, false, DEFAULT_DARK_PALETTE)

    expect(snippet).not.toContain('standaloneMode')
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
})
