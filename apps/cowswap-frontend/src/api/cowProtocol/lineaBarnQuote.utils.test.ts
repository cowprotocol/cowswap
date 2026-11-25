import { ORDER_BOOK_PROD_CONFIG, SupportedChainId, type ApiContext } from '@cowprotocol/cow-sdk'

import { lineaBarnQuoteContext } from './lineaBarnQuote.utils'

const prodContext: Pick<ApiContext, 'baseUrls' | 'chainId' | 'env'> = {
  chainId: SupportedChainId.MAINNET,
  env: 'prod',
}

describe('lineaBarnQuoteContext', () => {
  it('leaves a non-Linea quote on the caller context', () => {
    const contextOverride = { chainId: SupportedChainId.MAINNET, env: 'prod' as const }

    expect(lineaBarnQuoteContext(prodContext, contextOverride)).toBe(contextOverride)
    expect(lineaBarnQuoteContext(prodContext)).toBeUndefined()
  })

  it('points a Linea quote at barn while the orderbook env is prod', () => {
    expect(
      lineaBarnQuoteContext({
        chainId: SupportedChainId.LINEA,
        env: 'prod',
      }),
    ).toEqual({
      baseUrls: {
        ...ORDER_BOOK_PROD_CONFIG,
        [SupportedChainId.LINEA]: 'https://barn.api.cow.fi/linea',
      },
    })
  })

  it('replaces only the Linea host when the request already has base urls', () => {
    const baseUrls = {
      ...ORDER_BOOK_PROD_CONFIG,
      [SupportedChainId.MAINNET]: 'https://example.test/mainnet',
    }

    const context = lineaBarnQuoteContext(prodContext, {
      chainId: SupportedChainId.LINEA,
      baseUrls,
    })

    expect(context?.baseUrls?.[SupportedChainId.LINEA]).toBe('https://barn.api.cow.fi/linea')
    expect(context?.baseUrls?.[SupportedChainId.MAINNET]).toBe('https://example.test/mainnet')
    expect(baseUrls[SupportedChainId.LINEA]).toBe(ORDER_BOOK_PROD_CONFIG[SupportedChainId.LINEA])
  })
})
