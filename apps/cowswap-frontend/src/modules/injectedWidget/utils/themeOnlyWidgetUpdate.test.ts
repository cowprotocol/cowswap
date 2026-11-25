import type { UpdateParamsPayload } from '@cowprotocol/widget-lib'

import { applyThemeQuery, getCurrentLocationWithTheme, isThemeOnlyWidgetUpdate } from './themeOnlyWidgetUpdate.utils'

const PATHNAME = '/1/widget/swap/USDC/0xabc'

function payload(search: string, overrides: Partial<UpdateParamsPayload> = {}): UpdateParamsPayload {
  return {
    urlParams: { pathname: PATHNAME, search },
    appParams: { appCode: 'RWA' },
    hasProvider: true,
    ...overrides,
  } as UpdateParamsPayload
}

describe('isThemeOnlyWidgetUpdate', () => {
  it('returns false without previous data', () => {
    expect(isThemeOnlyWidgetUpdate(null, payload('sellAmount=1000&palette=null&theme=dark'))).toBe(false)
  })

  it('returns true when only the theme changes', () => {
    const prev = payload('sellAmount=1000&palette=null&theme=light&lng=en-US')
    const next = payload('sellAmount=1000&palette=null&theme=dark&lng=en-US')

    expect(isThemeOnlyWidgetUpdate(prev, next)).toBe(true)
  })

  it('returns true when only the palette changes', () => {
    const prev = payload('palette=null&theme=dark')
    const next = payload(`palette=${encodeURIComponent('{"baseTheme":"dark"}')}&theme=dark`)

    expect(isThemeOnlyWidgetUpdate(prev, next)).toBe(true)
  })

  it('returns false when nothing changes', () => {
    const search = 'sellAmount=1000&palette=null&theme=dark'

    expect(isThemeOnlyWidgetUpdate(payload(search), payload(search))).toBe(false)
  })

  it('returns false when the amounts change along with the theme', () => {
    const prev = payload('sellAmount=1000&palette=null&theme=light')
    const next = payload('sellAmount=1&palette=null&theme=dark')

    expect(isThemeOnlyWidgetUpdate(prev, next)).toBe(false)
  })

  it('returns false when the pathname changes along with the theme', () => {
    const prev = payload('palette=null&theme=light')
    const next = payload('palette=null&theme=dark', {
      urlParams: { pathname: '/1/widget/swap/0xabc/USDC', search: 'palette=null&theme=dark' },
    })

    expect(isThemeOnlyWidgetUpdate(prev, next)).toBe(false)
  })

  it('returns false when the app params change along with the theme', () => {
    const prev = payload('palette=null&theme=light')
    const next = payload('palette=null&theme=dark', { appParams: { appCode: 'Other' } })

    expect(isThemeOnlyWidgetUpdate(prev, next)).toBe(false)
  })
})

describe('applyThemeQuery', () => {
  it('replaces the theme params and keeps the rest of the current query', () => {
    expect(applyThemeQuery('theme=light&palette=null&lng=en-US', 'sellAmount=1000&palette=null&theme=dark')).toBe(
      'theme=dark&palette=null&lng=en-US',
    )
  })

  it('removes theme params the next query does not have', () => {
    expect(applyThemeQuery('theme=light&palette=null&lng=en-US', 'palette=null')).toBe('palette=null&lng=en-US')
  })
})

describe('getCurrentLocationWithTheme', () => {
  it('keeps the current trade route and applies the new theme', () => {
    window.location.hash = '#/1/widget/swap/0xabc/USDC?theme=light&palette=null'

    expect(getCurrentLocationWithTheme('sellAmount=1000&palette=null&theme=dark')).toEqual({
      pathname: '/1/widget/swap/0xabc/USDC',
      search: 'theme=dark&palette=null',
    })
  })
})
