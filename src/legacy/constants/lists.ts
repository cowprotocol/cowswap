import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { RAW_CODE_LINK } from 'legacy/constants'

export type NetworkLists = {
  [chain in ChainId]: string[]
}

const COW_DAO_LIST = 'https://files.cow.fi/tokens/CowSwap.json'
const COW_COINGECKO_LIST = 'https://files.cow.fi/tokens/CoinGecko.json'

const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const AAVE_LIST = 'tokenlist.aave.eth'
const SYNTHETIX_LIST = 'synths.snx.eth'
const WRAPPED_LIST = 'wrapped.tokensoft.eth'
const SET_LIST = 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
const OPYN_LIST = 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-squeeth-tokenlist.json'
const ROLL_LIST = 'https://app.tryroll.com/tokens.json'
// const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
const CMC_ALL_LIST = 'defi.cmc.eth'
const CMC_STABLECOIN = 'stablecoin.cmc.eth'
const KLEROS_LIST = 't2crtokens.eth'
const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'

// Goerli Default
// TODO: change develop -> main after release
const GOERLI_LIST = RAW_CODE_LINK + '/develop/src/tokens/goerli-token-list.json'

// XDAI Default
const HONEY_SWAP_XDAI = 'https://tokens.honeyswap.org'

export const UNSUPPORTED_LIST_URLS: NetworkLists = {
  [ChainId.MAINNET]: [BA_LIST],
  [ChainId.GOERLI]: [BA_LIST],
  [ChainId.GNOSIS_CHAIN]: [BA_LIST],
}

function buildNetworkDefaultLists({ networkLists, chainId }: { chainId: ChainId; networkLists: string[] }) {
  // need to add unsupported lists as well
  return [...UNSUPPORTED_LIST_URLS[chainId], ...networkLists]
}

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS_BY_NETWORK: NetworkLists = {
  [ChainId.MAINNET]: buildNetworkDefaultLists({
    chainId: ChainId.MAINNET,
    networkLists: [
      COW_DAO_LIST,
      COW_COINGECKO_LIST,
      COMPOUND_LIST,
      AAVE_LIST,
      SYNTHETIX_LIST,
      WRAPPED_LIST,
      SET_LIST,
      OPYN_LIST,
      ROLL_LIST,
      // COINGECKO_LIST,
      CMC_ALL_LIST,
      CMC_STABLECOIN,
      KLEROS_LIST,
    ],
  }),
  [ChainId.GOERLI]: buildNetworkDefaultLists({
    chainId: ChainId.GOERLI,
    networkLists: [GOERLI_LIST, COMPOUND_LIST],
  }),
  [ChainId.GNOSIS_CHAIN]: buildNetworkDefaultLists({
    chainId: ChainId.GNOSIS_CHAIN,
    networkLists: [COW_DAO_LIST, HONEY_SWAP_XDAI],
  }),
}

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK: NetworkLists = {
  [ChainId.MAINNET]: [COW_DAO_LIST, COW_COINGECKO_LIST],
  [ChainId.GNOSIS_CHAIN]: [COW_DAO_LIST, HONEY_SWAP_XDAI],
  [ChainId.GOERLI]: [COW_DAO_LIST, GOERLI_LIST],
}

// Set what we want as the default list when no chain id available: default = MAINNET
export const DEFAULT_NETWORK_FOR_LISTS = ChainId.MAINNET

export const DEFAULT_LIST_OF_LISTS: string[] = []
