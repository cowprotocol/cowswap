import { ListsSourcesByNetwork } from '../types'
import tokensList from './tokensList.json'

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = tokensList

export const UNISWAP_TOKENS_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'

export const GNOSIS_UNISWAP_TOKENS_LIST =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/GnosisUniswapTokensList.json'