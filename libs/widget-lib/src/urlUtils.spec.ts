import { buildWidgetUrl } from './urlUtils'
import { TradeType } from './types'

const defaultEnv = 'prod'
const chainId = 1
const tradeType = TradeType.SWAP

describe('buildWidgetUrl', () => {
  describe('env', () => {
    it('local', () => {
      const url = buildWidgetUrl({ chainId, tradeType, env: 'local' })
      expect(url).toEqual('http://localhost:3000/#/1/widget/swap/?')
    })
    it('prod', () => {
      const url = buildWidgetUrl({ chainId, tradeType, env: 'prod' })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?')
    })
  })

  describe('chainId', () => {
    it('mainnet', () => {
      const url = buildWidgetUrl({ chainId: 1, tradeType, env: defaultEnv })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?')
    })
    it('gnosis chain', () => {
      const url = buildWidgetUrl({ chainId: 5, tradeType, env: defaultEnv })
      expect(url).toEqual('https://swap.cow.fi/#/5/widget/swap/?')
    })
  })

  describe('theme', () => {
    it('dark', () => {
      const url = buildWidgetUrl({ theme: 'dark', chainId, tradeType, env: defaultEnv })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/?theme=dark')
    })
    it('light', () => {
      const url = buildWidgetUrl({ theme: 'light', chainId, tradeType, env: defaultEnv })
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
        env: defaultEnv,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/WETH/COW?')
    })

    it('with sell amount', () => {
      const url = buildWidgetUrl({
        sell: { asset: 'DAI', amount: '0.1' },
        buy: { asset: 'USDC' },
        chainId,
        tradeType,
        env: defaultEnv,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/DAI/USDC?sellAmount=0.1')
    })

    it('with buy amount', () => {
      const url = buildWidgetUrl({
        sell: { asset: 'DAI' },
        buy: { asset: 'USDC', amount: '0.1' },
        chainId,
        tradeType,
        env: defaultEnv,
      })
      expect(url).toEqual('https://swap.cow.fi/#/1/widget/swap/DAI/USDC?buyAmount=0.1')
    })
  })

  describe('all config', () => {
    it('dark', () => {
      const url = buildWidgetUrl({
        env: 'prod',
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
