import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { escapeJsonForInlineScript } from './common/escapeJsonForInlineScript.utils'
import { vanillaNoDepsExample } from './htmlExample'

import { DEFAULT_DARK_PALETTE } from '../../../configurator.constants'

describe('escapeJsonForInlineScript', () => {
  it('escapes script-breaking </ sequences in JSON text', () => {
    const json = JSON.stringify({ appCode: '</script><img src=x onerror=alert(1)>' }, null, 2)

    expect(escapeJsonForInlineScript(json)).not.toMatch(/<\/script>/i)
    expect(JSON.parse(escapeJsonForInlineScript(json))).toEqual({
      appCode: '</script><img src=x onerror=alert(1)>',
    })
  })
})

describe('vanillaNoDepsExample', () => {
  it('never emits a raw </script> tag from user-controlled appCode in copied HTML', () => {
    const maliciousAppCode = '</script><img src=x onerror=alert(1)>'
    const params: CowSwapWidgetParams = { appCode: maliciousAppCode }
    const html = vanillaNoDepsExample(params, DEFAULT_DARK_PALETTE)

    expect(html).not.toMatch(/"appCode":\s*"[^"]*<\/script>/i)
    expect(html.match(/<\/script>/gi)).toHaveLength(2)

    const inlineScriptMatch = html.match(/<script>\s*\n([\s\S]*?)\n\s*<\/script>/)

    expect(inlineScriptMatch).not.toBeNull()
    expect(inlineScriptMatch?.[1]).not.toMatch(/<\/script>/i)
    expect(inlineScriptMatch?.[1]).toContain('\\u003c/script>')
  })
})
