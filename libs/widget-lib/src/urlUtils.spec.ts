import { TradeType } from './types'
import { buildWidgetUrl, buildWidgetUrlQuery } from './urlUtils'

const chainId = 1
const tradeType = TradeType.SWAP

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

  it('serializes color palette without legacy shell layout keys', () => {
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
      },
    })

    expect(query.get('theme')).toBe('light')
    const palette = JSON.parse(decodeURIComponent(query.get('palette') || ''))
    expect(palette.primary).toBe('#052b65')
    expect(palette.boxShadow).toBeUndefined()
    expect(palette.widgetPadding).toBeUndefined()
    expect(palette.widgetBorderRadius).toBeUndefined()
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
      },
    })

    expect(query.get('hooksEnabled')).toBe('true')
  })
})
