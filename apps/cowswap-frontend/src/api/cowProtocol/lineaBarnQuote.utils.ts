import {
  ORDER_BOOK_PROD_CONFIG,
  ORDER_BOOK_STAGING_CONFIG,
  SupportedChainId,
  type ApiContext,
  type PartialApiContext,
} from '@cowprotocol/cow-sdk'

/** Temporary: Linea orderbook calls use barn until that chain is on the env-resolved host. */
const LINEA_BARN_ORDER_BOOK_URL = 'https://barn.api.cow.fi/linea'

export function lineaBarnOrderBookContext(
  context: Pick<ApiContext, 'baseUrls' | 'chainId' | 'env'>,
  contextOverride?: PartialApiContext,
): PartialApiContext | undefined {
  const chainId = contextOverride?.chainId ?? context.chainId

  if (chainId !== SupportedChainId.LINEA) {
    return contextOverride
  }

  const env = contextOverride?.env ?? context.env
  const baseUrls =
    contextOverride?.baseUrls ??
    context.baseUrls ??
    (env === 'staging' ? ORDER_BOOK_STAGING_CONFIG : ORDER_BOOK_PROD_CONFIG)

  return {
    ...contextOverride,
    baseUrls: {
      ...baseUrls,
      [SupportedChainId.LINEA]: LINEA_BARN_ORDER_BOOK_URL,
    },
  }
}
