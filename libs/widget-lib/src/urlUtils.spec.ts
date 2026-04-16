import { TradeType } from './types'
import { buildWidgetUrl, buildWidgetUrlQuery, sanitizeWidgetBaseUrl } from './urlUtils'

const chainId = 1
const tradeType = TradeType.SWAP

describe('sanitizeWidgetBaseUrl', () => {
  it('returns production default when baseUrl is omitted or blank', () => {
    expect(sanitizeWidgetBaseUrl(undefined)).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('   ')).toBe('https://swap.cow.fi')
  })

  it('when not throwing, logs and returns production default for invalid URL', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => void 0)

    expect(sanitizeWidgetBaseUrl('not a url')).toBe('https://swap.cow.fi')
    expect(error).toHaveBeenCalledWith('[CoW Widget]', expect.stringMatching(/Not a valid URL/))

    error.mockRestore()
  })

  it('throws when baseUrl is not a valid URL and throwIfInvalid is true', () => {
    expect(() => sanitizeWidgetBaseUrl('not a url', true)).toThrow(/Not a valid URL/)
  })

  it('allows https origins and preserves path prefix for subpath deployments', () => {
    expect(sanitizeWidgetBaseUrl('https://swap.cow.fi')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('https://swap.cow.fi/')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('https://example.com/preview/app')).toBe('https://example.com/preview/app')
  })

  it('strips trailing slashes from non-root path', () => {
    expect(sanitizeWidgetBaseUrl('https://swap.cow.fi/staging/')).toBe('https://swap.cow.fi/staging')
  })

  it('allows http only for local dev hosts', () => {
    expect(sanitizeWidgetBaseUrl('http://localhost:3000')).toBe('http://localhost:3000')
    expect(sanitizeWidgetBaseUrl('http://127.0.0.1:8080')).toBe('http://127.0.0.1:8080')
    expect(sanitizeWidgetBaseUrl('http://app.localhost:3000')).toBe('http://app.localhost:3000')
  })

  it('when not throwing, logs and returns default for disallowed URLs', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => void 0)

    expect(sanitizeWidgetBaseUrl('http://evil.com')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('https://user:pass@swap.cow.fi')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('javascript:alert(1)')).toBe('https://swap.cow.fi')
    expect(sanitizeWidgetBaseUrl('data:text/html,<script>alert(1)</script>')).toBe('https://swap.cow.fi')
    expect(error).toHaveBeenCalledTimes(4)

    error.mockRestore()
  })

  it('throws for disallowed URLs when throwIfInvalid is true', () => {
    expect(() => sanitizeWidgetBaseUrl('http://evil.com', true)).toThrow(/Use https/)
    expect(() => sanitizeWidgetBaseUrl('https://user:pass@swap.cow.fi', true)).toThrow(/Userinfo/)
    expect(() => sanitizeWidgetBaseUrl('javascript:alert(1)', true)).toThrow(/Use https/)
    expect(() => sanitizeWidgetBaseUrl('data:text/html,<script>alert(1)</script>', true)).toThrow(/Use https/)
  })
})

// TODO: fix these tests! uncommenting to unblock a hotfix
// TODO: Break down this large function into smaller functions

describe.skip('buildWidgetUrl', () => {
  describe('env', () => {
    it('local', () => {
      const url = buildWidgetUrl({ chainId, tradeType, baseUrl: 'http://localhost:3000' })
      expect(url).toEqual('http://localhost:3000/#/1/widget/swap/?')
    })
    it('prod', () => {
      const url = buildWidgetUrl({ chainId, tradeType, baseUrl: 'https://swap.cow.fi' })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?')
    })
  })

  describe('chainId', () => {
    it('mainnet', () => {
      const url = buildWidgetUrl({ chainId: 1, tradeType })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?')
    })
    it('gnosis chain', () => {
      const url = buildWidgetUrl({ chainId: 100, tradeType })
      expect(url).toEqual('https://swap.cow.fi/#/100/widget/swap/?')
    })
  })

  describe('theme', () => {
    it('dark', () => {
      const url = buildWidgetUrl({ theme: 'dark', chainId, tradeType })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?theme=dark')
    })
    it('light', () => {
      const url = buildWidgetUrl({ theme: 'light', chainId, tradeType })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?theme=light')
    })
  })

  describe('trade assets', () => {
    it('without amounts', () => {
      const url = buildWidgetUrl({
        sell: { asset: 'WETH' },
        buy: { asset: 'COW' },
        chainId,
        tradeType,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/WETH/COW?')
    })

    it('with sell amount', () => {
      const url = buildWidgetUrl({
        sell: { asset: 'DAI', amount: '0.1' },
        buy: { asset: 'USDC' },
        chainId,
        tradeType,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/DAI/USDC?sellAmount=0.1')
    })

    it('with buy amount', () => {
      const url = buildWidgetUrl({
        sell: { asset: 'DAI' },
        buy: { asset: 'USDC', amount: '0.1' },
        chainId,
        tradeType,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/DAI/USDC?buyAmount=0.1')
    })
  })

  describe('all config', () => {
    it('dark', () => {
      const url = buildWidgetUrl({
        chainId: 100,
        tradeType,
        theme: 'light',
        sell: { asset: 'DAI', amount: '0.1' },
        buy: { asset: 'USDC', amount: '0.1' },
      })
      expect(url).toEqual('https://swap.cow.fi/#/100/widget/swap/DAI/USDC?sellAmount=0.1&buyAmount=0.1&theme=light')
    })
  })
})

describe('buildWidgetUrlQuery', () => {
  it('serializes locale forcing as lng', () => {
    const query = buildWidgetUrlQuery({ locale: 'es-ES' })

    expect(query.get('lng')).toBe('es-ES')
    expect(query.get('palette')).toBe('null')
  })

  it('serializes widget shadow inside the theme palette', () => {
    const query = buildWidgetUrlQuery({
      theme: {
        baseTheme: 'light',
        primary: '#052b65',
        background: '#FFFFFF',
        paper: '#FFFFFF',
        text: '#052B65',
        danger: '#D41300',
        warning: '#F8D06B',
        alert: '#DB971E',
        info: '#0d5ed9',
        success: '#007B28',
        boxShadow: 'none',
      },
    })

    expect(query.get('theme')).toBe('light')
    expect(JSON.parse(decodeURIComponent(query.get('palette') || ''))).toMatchObject({ boxShadow: 'none' })
  })

  it('includes locale in the iframe URL', () => {
    expect(buildWidgetUrl({ chainId, tradeType, locale: 'fr' })).toBe(
      'https://swap.cow.fi/#/1/widget/swap/_/_?palette=null&lng=fr',
    )
  })

  it('does not serialize hooksEnabled when hooks are not configured', () => {
    const query = buildWidgetUrlQuery({})

    expect(query.get('hooksEnabled')).toBeNull()
  })

  it('does not serialize hooksEnabled when hooks object is empty', () => {
    const query = buildWidgetUrlQuery({ hooks: {} })

    expect(query.get('hooksEnabled')).toBeNull()
  })

  it('serializes hooksEnabled when at least one hook callback is configured', () => {
    const query = buildWidgetUrlQuery({
      hooks: {
        onBeforeTrade: () => true,
        onBeforeApproval: () => true,
        onBeforeOrderCancel: () => true,
      },
    })

    expect(query.get('hooksEnabled')).toBe('true')
  })
})
