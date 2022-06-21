// used to mark unsupported tokens, these are hosted lists of unsupported tokens
import { SupportedChainId as ChainId } from 'constants/chains'
import { RAW_CODE_LINK } from '.'

export * from '@src/constants/lists'

export type NetworkLists = {
  [chain in ChainId]: string[]
}

const COW_DAO_LIST = 'token-list.cow.eth'

const UNI_LIST = 'https://tokens.uniswap.org'
const AAVE_LIST = 'tokenlist.aave.eth'
const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'
const CMC_ALL_LIST = 'https://api.coinmarketcap.com/data-api/v3/uniswap/all.json'
const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json'
// export const ARBITRUM_LIST = 'https://bridge.arbitrum.io/token-list-42161.json'
const KLEROS_LIST = 't2crtokens.eth'
// export const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
const ROLL_LIST = 'https://app.tryroll.com/tokens.json'
const SET_LIST = 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
const WRAPPED_LIST = 'wrapped.tokensoft.eth'

// const SYNTHETIX_LIST = 'synths.snx.eth'
// const OPYN_LIST = 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-squeeth-tokenlist.json'

// Rinkeby Default
const RINKEBY_LIST = RAW_CODE_LINK + '/main/src/custom/tokens/rinkeby-token-list.json'

// XDAI Default
const HONEY_SWAP_XDAI = 'https://tokens.honeyswap.org'

export const UNSUPPORTED_LIST_URLS: NetworkLists = {
  [ChainId.MAINNET]: [BA_LIST],
  [ChainId.RINKEBY]: [BA_LIST],
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
      UNI_LIST,
      COMPOUND_LIST,
      AAVE_LIST,
      WRAPPED_LIST,
      SET_LIST,
      ROLL_LIST,
      COINGECKO_LIST,
      CMC_ALL_LIST,
      KLEROS_LIST,
      GEMINI_LIST,
      COW_DAO_LIST,
    ],
  }),

  [ChainId.RINKEBY]: buildNetworkDefaultLists({
    chainId: ChainId.RINKEBY,
    networkLists: [RINKEBY_LIST, COMPOUND_LIST],
  }),

  [ChainId.GNOSIS_CHAIN]: buildNetworkDefaultLists({
    chainId: ChainId.GNOSIS_CHAIN,
    networkLists: [COW_DAO_LIST, HONEY_SWAP_XDAI],
  }),
}

// Set what we want as the default list when no chain id available: default = MAINNET
export const DEFAULT_NETWORK_FOR_LISTS = ChainId.MAINNET

// for testing in reducer.test.ts
export const DEFAULT_LIST_OF_LISTS = DEFAULT_LIST_OF_LISTS_BY_NETWORK[ChainId.MAINNET]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK: NetworkLists = {
  [ChainId.MAINNET]: [COW_DAO_LIST, UNI_LIST, GEMINI_LIST],
  [ChainId.RINKEBY]: [COW_DAO_LIST, UNI_LIST, RINKEBY_LIST],
  [ChainId.GNOSIS_CHAIN]: [COW_DAO_LIST, HONEY_SWAP_XDAI],
}
