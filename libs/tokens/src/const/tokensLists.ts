import tokensList from './tokensList.json'

import { ListsSourcesByNetwork } from '../types'

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = tokensList

export const UNISWAP_TOKENS_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

export const GNOSIS_UNISWAP_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/GnosisUniswapTokensList.json'

// TODO: update address once https://github.com/cowprotocol/token-lists/pull/393 is merged
export const ARBITRUM_ONE_TOKENS_LIST =
  'https://github.com/cowprotocol/token-lists/blob/feat/arb1-uniswap-mapped-list/src/public/ArbitrumOneUniswapTokensList.json'
