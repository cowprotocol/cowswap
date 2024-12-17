import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import lpTokensList from './lpTokensList.json'
import tokensList from './tokensList.json'

import { ListSourceConfig, ListsSourcesByNetwork } from '../types'

export const LP_TOKEN_LISTS = lpTokensList as Array<ListSourceConfig>

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = mapSupportedNetworks((chainId) => tokensList[chainId])

export const UNISWAP_TOKENS_LIST = 'https://ipfs.io/ipns/tokens.uniswap.org'
