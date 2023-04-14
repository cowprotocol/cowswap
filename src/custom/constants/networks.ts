import {
  Network,
  Web3Provider,
  JsonRpcProvider,
  UrlJsonRpcProvider,
  StaticJsonRpcProvider,
  InfuraProvider,
  CloudflareProvider,
  AlchemyProvider,
  PocketProvider,
  AnkrProvider,
} from '@ethersproject/providers'
import * as Sentry from '@sentry/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Newable } from '@cow/types'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

interface RpcConfig extends Network {
  // You should only need to provide this if you are trying to connect to a custom RPC / network.
  readonly rpcUrl?: string
}

const STATIC_RPC_URLS: Partial<Record<SupportedChainId, string>> = {
  [SupportedChainId.GNOSIS_CHAIN]: 'https://rpc.gnosis.gateway.fm',
}

export const RPC_CONFIG: Record<SupportedChainId, RpcConfig> = {
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
    rpcUrl: STATIC_RPC_URLS[SupportedChainId.GNOSIS_CHAIN],
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

// List of public providers that don't require an API key, per chain support.
const PUBLIC_PROVIDER_LIST: Record<SupportedChainId, ProviderClass[]> = {
  [SupportedChainId.MAINNET]: [InfuraProvider, CloudflareProvider, AlchemyProvider, PocketProvider, AnkrProvider],
  [SupportedChainId.GOERLI]: [InfuraProvider, AlchemyProvider, PocketProvider, AnkrProvider],
  [SupportedChainId.GNOSIS_CHAIN]: [],
}

function getProvider(chainId: SupportedChainId): JsonRpcProvider[] {
  const result: JsonRpcProvider[] = []

  if (window.ethereum) {
    result.push(new Web3Provider(window.ethereum, RPC_CONFIG[chainId]))
  }

  if (typeof RPC_CONFIG[chainId].rpcUrl === 'string') {
    result.push(new StaticJsonRpcProvider(RPC_CONFIG[chainId].rpcUrl))
  } else {
    result.push(new InfuraProvider(RPC_CONFIG[chainId], INFURA_KEY))
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

export const PROVIDERS_RPC_URLS_FIRST_ONLY: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: PROVIDERS_RPC_URLS[SupportedChainId.MAINNET][0],
  [SupportedChainId.GOERLI]: PROVIDERS_RPC_URLS[SupportedChainId.GOERLI][0],
  [SupportedChainId.GNOSIS_CHAIN]: PROVIDERS_RPC_URLS[SupportedChainId.GNOSIS_CHAIN][0],
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
