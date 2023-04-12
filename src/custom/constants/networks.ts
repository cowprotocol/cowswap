import {
  Web3Provider,
  JsonRpcProvider,
  UrlJsonRpcProvider,
  StaticJsonRpcProvider,
  InfuraProvider as EthersInfuraProvider,
  CloudflareProvider as EthersCloudflareProvider,
  AlchemyProvider as EthersAlchemyProvider,
  PocketProvider as EthersPocketProvider,
  AnkrProvider as EthersAnkrProvider,
} from '@ethersproject/providers'
import * as Sentry from '@sentry/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Newable } from '@cow/types'

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

/**
 * We use this class for type inference.
 *
 * UrlJsonRpcProvider is an abstract class, therefore we have trouble inferring the type of its constructor.
 * However, as all of the RPC providers we use extend UrlJsonRpcProvider, we can use this class to infer the type of the constructor, by turning it into a concrete one.
 */
class BaseUrlJsonRpcProvider extends UrlJsonRpcProvider {}
type ProviderClass = Newable<typeof BaseUrlJsonRpcProvider>

/**
 * UrlJsonRpcProvider instances do not have a getSigner implementation, however we need it.
 *
 * As they are all based on JsonRpcProvider, we can use JsonRpcProvider's getSigner implementation.
 *
 * Why not use JsonRpcProvider directly? Because it does not have specific API provider optimisations,
 * and it does not automatically support community resources.
 *
 * Why not instantiate and return a JsonRpcSigner? Because it has a constructor guard that prevents it from being instantiated directly.
 * Intention with this guard is to prevent users from accidentally using a JsonRpcSigner with another provider. Which is not possible here.
 */
class InfuraProvider extends EthersInfuraProvider {}
InfuraProvider.prototype.getSigner = JsonRpcProvider.prototype.getSigner
class CloudflareProvider extends EthersCloudflareProvider {}
CloudflareProvider.prototype.getSigner = JsonRpcProvider.prototype.getSigner
class AlchemyProvider extends EthersAlchemyProvider {}
AlchemyProvider.prototype.getSigner = JsonRpcProvider.prototype.getSigner
class PocketProvider extends EthersPocketProvider {}
PocketProvider.prototype.getSigner = JsonRpcProvider.prototype.getSigner
class AnkrProvider extends EthersAnkrProvider {}
AnkrProvider.prototype.getSigner = JsonRpcProvider.prototype.getSigner

// List of public providers that don't require an API key, per chain support.
const PUBLIC_PROVIDER_LIST: Record<SupportedChainId, ProviderClass[]> = {
  [SupportedChainId.MAINNET]: [InfuraProvider, CloudflareProvider, AlchemyProvider, PocketProvider, AnkrProvider],
  [SupportedChainId.GOERLI]: [InfuraProvider, AlchemyProvider, PocketProvider, AnkrProvider],
  [SupportedChainId.GNOSIS_CHAIN]: [],
}

const RPC_TYPE: { [key in SupportedChainId]: 'infura' | 'custom' } = {
  [SupportedChainId.MAINNET]: 'infura',
  [SupportedChainId.GOERLI]: 'infura',
  [SupportedChainId.GNOSIS_CHAIN]: 'custom',
}

function getProvider(chainId: SupportedChainId): JsonRpcProvider[] {
  const result: JsonRpcProvider[] = []

  if (window.ethereum) {
    result.push(new Web3Provider(window.ethereum, RPC_CONFIG[chainId]))
  }

  result.pop()

  if (RPC_TYPE[chainId] === 'infura') {
    result.push(new InfuraProvider(RPC_CONFIG[chainId], INFURA_KEY))
  } else {
    result.push(new StaticJsonRpcProvider(RPC_URLS[chainId]))
  }

  if (result.length > 0) {
    return result
  }

  for (const Provider of PUBLIC_PROVIDER_LIST[chainId]) {
    try {
      const provider = new Provider(RPC_CONFIG[chainId])

      result.push(provider)
    } catch (error) {
      const { sentryError, tags } = constructSentryError(error, { message: "Couldn't create public provider" })

      Sentry.captureException(sentryError, { tags })
    }
  }

  return result
}

export const PROVIDERS: Record<SupportedChainId, JsonRpcProvider[]> = {
  [SupportedChainId.MAINNET]: getProvider(SupportedChainId.MAINNET),
  [SupportedChainId.GOERLI]: getProvider(SupportedChainId.GOERLI),
  [SupportedChainId.GNOSIS_CHAIN]: getProvider(SupportedChainId.GNOSIS_CHAIN),
}

export const getRpcUrls = (chainId: SupportedChainId) => PROVIDERS[chainId].map((provider) => provider.connection.url)

export const PROVIDERS_RPC_URLS: Record<SupportedChainId, string[]> = {
  [SupportedChainId.MAINNET]: getRpcUrls(SupportedChainId.MAINNET),
  [SupportedChainId.GOERLI]: getRpcUrls(SupportedChainId.GOERLI),
  [SupportedChainId.GNOSIS_CHAIN]: getRpcUrls(SupportedChainId.GNOSIS_CHAIN),
}

export const providers = {
  get mainnet() {
    const _providers = getProvider(SupportedChainId.MAINNET)

    if (_providers.length > 0) {
      return _providers[0]
    } else {
      const message = 'No provider found for MAINNET_PROVIDER'
      const { sentryError, tags } = constructSentryError(new Error(), {
        message,
      })

      Sentry.captureException(sentryError, { tags })

      throw new Error(message)
    }
  },
}

function constructSentryError(baseError: unknown, { message }: { message: string }) {
  const constructedError = Object.assign(new Error(), baseError, {
    message,
    name: 'ProviderError',
  })

  const tags = {
    errorType: 'provider',
  }

  return { baseError, sentryError: constructedError, tags }
}
