import { buildWidgetUrl } from './utils'

describe('buildWidgetUrl', () => {
  it('minimal config', () => {
    const url = buildWidgetUrl({})
    expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/?')
  })

  describe('env', () => {
    it('local', () => {
      const url = buildWidgetUrl({ env: 'local' })
      expect(url).toEqual('http://localhost:3000/#/1/swap/widget/?')
    })
    it('prod', () => {
      const url = buildWidgetUrl({ env: 'prod' })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/?')
    })

    it('barn', () => {
      const url = buildWidgetUrl({ env: 'barn' })
      expect(url).toEqual('https://barn.cow.fi/#/1/swap/widget/?')
    })
  })

  describe('chainId', () => {
    it('mainnet', () => {
      const url = buildWidgetUrl({ chainId: 1 })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/?')
    })
    it('gnosis chain', () => {
      const url = buildWidgetUrl({ chainId: 5 })
      expect(url).toEqual('http://swap.cow.fi/#/5/swap/widget/?')
    })
  })

  describe('theme', () => {
    it('dark', () => {
      const url = buildWidgetUrl({ theme: 'dark' })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/?theme=dark')
    })
    it('light', () => {
      const url = buildWidgetUrl({ theme: 'light' })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/?theme=light')
    })
  })

  describe('trade assets', () => {
    it('without amounts', () => {
      const url = buildWidgetUrl({ tradeAssets: { sell: { asset: 'WETH' }, buy: { asset: 'COW' } } })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/WETH/COW?')
    })

    it('with sell amount', () => {
      const url = buildWidgetUrl({ tradeAssets: { sell: { asset: 'DAI', amount: '0.1' }, buy: { asset: 'USDC' } } })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/DAI/USDC?sellAmount=0.1')
    })

    it('with buy amount', () => {
      const url = buildWidgetUrl({ tradeAssets: { sell: { asset: 'DAI' }, buy: { asset: 'USDC', amount: '0.1' } } })
      expect(url).toEqual('http://swap.cow.fi/#/1/swap/widget/DAI/USDC?buyAmount=0.1')
    })
  })

  describe('all config', () => {
    it('dark', () => {
      const url = buildWidgetUrl({
        env: 'barn',
        chainId: 100,
        theme: 'light',
        tradeAssets: { sell: { asset: 'DAI', amount: '0.1' }, buy: { asset: 'USDC', amount: '0.1' } },
      })
      expect(url).toEqual('https://barn.cow.fi/#/100/swap/widget/DAI/USDC?sellAmount=0.1&buyAmount=0.1&theme=light')
    })
  })
})
