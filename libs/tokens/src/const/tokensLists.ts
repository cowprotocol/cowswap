import tokensList from './tokensList.json'

import { ListsSourcesByNetwork } from '../types'

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = tokensList

export const UNISWAP_TOKENS_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

export const GNOSIS_UNISWAP_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/GnosisUniswapTokensList.json'

// TODO: update address once https://github.com/cowprotocol/token-lists/pull/393 is merged
export const ARBITRUM_ONE_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/ca0fac81d0318234cf16b9f661d05a5c24c2ccb6/src/public/ArbitrumOneUniswapTokensList.json'
