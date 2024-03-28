import { ListsSourcesByNetwork } from '../types'
import tokensList from './tokensList.json'

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = tokensList

// TODO: combined uniswap and lucky list
// TODO: revert
export const UNISWAP_TOKENS_LIST = 'https://dpaste.com/75C9XDTGP.txt' //'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
