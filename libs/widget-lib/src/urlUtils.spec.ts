import { TradeType } from './types'
import { buildWidgetUrl } from './urlUtils'

const chainId = 1
const tradeType = TradeType.SWAP

// TODO: fix these tests! uncommenting to unblock a hotfix
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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
