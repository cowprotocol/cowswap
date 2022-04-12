// used to mark unsupported tokens, these are hosted lists of unsupported tokens
import { SupportedChainId as ChainId } from 'constants/chains'

export * from '@src/constants/lists'

export type NetworkLists = {
  [chain in ChainId]: string[]
}

const COW_DAO_LIST = 'token-list.cow.eth'
const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const UMA_LIST = 'https://umaproject.org/uma.tokenlist.json'
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
const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json'
const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'

// Rinkeby Default
const RINKEBY_LIST =
  'https://raw.githubusercontent.com/cowprotocol/cowswap/main/src/custom/tokens/rinkeby-token-list.json'

// XDAI Default
const HONEY_SWAP_XDAI = 'https://tokens.honeyswap.org'

export const UNSUPPORTED_LIST_URLS: NetworkLists = {
  [ChainId.MAINNET]: [BA_LIST],
  // [ChainId.KOVAN]: [BA_LIST],
  [ChainId.RINKEBY]: [BA_LIST],
  // [ChainId.ROPSTEN]: [BA_LIST],
  // [ChainId.GOERLI]: [BA_LIST],
  [ChainId.XDAI]: [BA_LIST],
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
      COMPOUND_LIST,
      AAVE_LIST,
      SYNTHETIX_LIST,
      UMA_LIST,
      WRAPPED_LIST,
      SET_LIST,
      OPYN_LIST,
      ROLL_LIST,
      // COINGECKO_LIST,
      CMC_ALL_LIST,
      CMC_STABLECOIN,
      KLEROS_LIST,
      GEMINI_LIST,
      COW_DAO_LIST,
    ],
  }),
  // [ChainId.KOVAN]: buildNetworkDefaultLists({
  //   chainId: ChainId.KOVAN,
  //   networkLists: [COMPOUND_LIST],
  // }),
  [ChainId.RINKEBY]: buildNetworkDefaultLists({
    chainId: ChainId.RINKEBY,
    networkLists: [RINKEBY_LIST, COMPOUND_LIST],
  }),
  // [ChainId.ROPSTEN]: buildNetworkDefaultLists({
  //   chainId: ChainId.ROPSTEN,
  //   networkLists: [COMPOUND_LIST],
  // }),
  // [ChainId.GOERLI]: buildNetworkDefaultLists({
  //   chainId: ChainId.GOERLI,
  //   networkLists: [COMPOUND_LIST],
  // }),
  [ChainId.XDAI]: buildNetworkDefaultLists({
    chainId: ChainId.XDAI,
    networkLists: [COW_DAO_LIST, HONEY_SWAP_XDAI],
  }),
}

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK: NetworkLists = {
  [ChainId.MAINNET]: [COW_DAO_LIST, GEMINI_LIST],
  // [ChainId.KOVAN]: [GEMINI_LIST],
  [ChainId.RINKEBY]: [COW_DAO_LIST, RINKEBY_LIST],
  // [ChainId.ROPSTEN]: [GEMINI_LIST],
  [ChainId.XDAI]: [COW_DAO_LIST, HONEY_SWAP_XDAI],
  // [ChainId.GOERLI]: [GEMINI_LIST],
}

// Set what we want as the default list when no chain id available: default = MAINNET
export const DEFAULT_NETWORK_FOR_LISTS = ChainId.MAINNET
// for testing in reducer.test.ts
export const DEFAULT_LIST_OF_LISTS = DEFAULT_LIST_OF_LISTS_BY_NETWORK[ChainId.MAINNET]
