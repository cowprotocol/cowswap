import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ETH_NODE_URL, NODE_PROVIDER_ID } from 'const'
import Web3 from 'web3'

import type { HttpProvider } from 'web3-core'

// TODO connect to mainnet if we need AUTOCONNECT at all
export const getDefaultProvider = (): string | null => (process.env.NODE_ENV === 'test' ? null : ETH_NODE_URL)

const web3cache: { [key: string]: Web3 } = {}

export function createWeb3Api(provider?: string): Web3 {
  const _provider = provider || getDefaultProvider() || ''

  if (web3cache[_provider]) {
    return web3cache[_provider]
  }
  // TODO: Create an `EthereumApi` https://github.com/gnosis/gp-v1-ui/issues/331
  const web3 = new Web3(
    _provider.startsWith('wss:')
      ? new Web3.providers.WebsocketProvider(_provider, {
          reconnect: {
            auto: true,
            delay: 5000,
            maxAttempts: 5,
            onTimeout: false,
          },
        })
      : _provider
  )

  // `handleRevert = true` makes `require` failures to throw
  // For more details see https://github.com/gnosis/gp-v1-ui/issues/511
  web3.eth['handleRevert'] = true

  if (process.env.MOCK_WEB3 === 'true') {
    // Only function that needs to be mocked so far. We can add more and add extra logic as needed
    web3.eth.getCode = async (address: string): Promise<string> => address
  }

  web3cache[_provider] = web3
  return web3
}

const PROVIDER_ENDPOINTS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://eth-mainnet.nodereal.io/v1/' + NODE_PROVIDER_ID,
  [SupportedChainId.GNOSIS_CHAIN]: 'https://rpc.gnosis.gateway.fm/',
  [SupportedChainId.SEPOLIA]: 'https://eth-sepolia.nodereal.io/v1/' + NODE_PROVIDER_ID,
}

export function getProviderByNetwork(networkId: SupportedChainId): string | undefined {
  return PROVIDER_ENDPOINTS[networkId]
}

// Approach 2: update the provider in a single web3 instance
// Advantage is that regular APIs that require web3 instance should work without any changes
// Also, there's no change to consumers currently importing from <app>/api module
// Side effect is applied at reducer level (state/network/updater module)
export function updateWeb3Provider(web3: Web3, networkId?: SupportedChainId | null): void {
  if (!networkId) {
    return
  }

  const provider = getProviderByNetwork(networkId)

  if (web3.currentProvider === provider || (web3.currentProvider as HttpProvider)?.host === provider) {
    return
  }

  console.log('[api:web3] updateWeb3Provider', web3.currentProvider, provider, networkId)

  provider && web3.setProvider(provider)
}
