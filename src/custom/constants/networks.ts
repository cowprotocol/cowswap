import { Web3Provider, JsonRpcProvider, StaticJsonRpcProvider, InfuraProvider } from '@ethersproject/providers'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.OPTIMISM]: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.OPTIMISTIC_KOVAN]: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.POLYGON]: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.POLYGON_MUMBAI]: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.CELO]: `https://forno.celo.org`,
  // [SupportedChainId.CELO_ALFAJORES]: `https://alfajores-forno.celo-testnet.org`,
  [SupportedChainId.GNOSIS_CHAIN]: `https://rpc.gnosis.gateway.fm`,
}

export const RPC_CONFIG: { [key in SupportedChainId]: { chainId: SupportedChainId; name: string } } = {
  [SupportedChainId.MAINNET]: {
    chainId: SupportedChainId.MAINNET,
    name: 'homestead',
  },
  [SupportedChainId.GOERLI]: {
    chainId: SupportedChainId.GOERLI,
    name: 'goerli',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    name: 'gnosis',
  },
}

const RPC_TYPE: { [key in SupportedChainId]: 'infura' | 'custom' } = {
  [SupportedChainId.MAINNET]: 'infura',
  [SupportedChainId.GOERLI]: 'infura',
  [SupportedChainId.GNOSIS_CHAIN]: 'custom',
}

function getProvider(chainId: SupportedChainId): JsonRpcProvider {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found in window object.')
    }
    return new Web3Provider(window.ethereum, RPC_CONFIG[chainId])
  } catch (err: unknown) {
    if (RPC_TYPE[chainId] === 'infura') {
      return new InfuraProvider(RPC_CONFIG[chainId].name, INFURA_KEY)
    } else {
      return new StaticJsonRpcProvider(RPC_URLS[chainId])
    }
  }
}

export const PROVIDERS: {
  [key in SupportedChainId]: JsonRpcProvider
} = {
  [SupportedChainId.MAINNET]: getProvider(SupportedChainId.MAINNET),
  [SupportedChainId.GOERLI]: getProvider(SupportedChainId.GOERLI),
  [SupportedChainId.GNOSIS_CHAIN]: getProvider(SupportedChainId.GNOSIS_CHAIN),
}

export const MAINNET_PROVIDER = getProvider(SupportedChainId.MAINNET)
