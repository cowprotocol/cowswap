import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import lpTokensList from './lpTokensList.json'
import tokensList from './tokensList.json'

import { ListSourceConfig, ListsSourcesByNetwork } from '../types'

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = {
  ...tokensList,
  ...mapSupportedNetworks(lpTokensList as Array<ListSourceConfig>)
}

export const UNISWAP_TOKENS_LIST = 'https://ipfs.io/ipns/tokens.uniswap.org'

export const GNOSIS_UNISWAP_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/GnosisUniswapTokensList.json'

export const ARBITRUM_ONE_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/ArbitrumOneUniswapTokensList.json'
