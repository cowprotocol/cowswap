import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
// TODO: Use any network when this PR is merged https://github.com/NoahZinsmeister/web3-react/pull/185
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletConnectConnector } from '@anxolin/walletconnect-connector'
// End of TODO ----
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from 'connectors/Fortmatic'
import { NetworkConnector } from 'connectors/NetworkConnector'

type RpcNetworks = { [chainId: number]: string }

function getRpcNetworks(): [RpcNetworks, number[]] {
  const supportedChainIdsEnv = process.env.REACT_APP_SUPPORTED_CHAIN_IDS
  const defaultChainId = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1')

  // Make sure the mandatory envs are present
  if (!supportedChainIdsEnv) {
    throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
  }

  // Get list of supported chains
  const chainIds = supportedChainIdsEnv.split(',').map(chainId => Number(chainId.trim()))
  if (chainIds.length === 0) {
    throw new Error(`At least one network should be supported. REACT_APP_CHAIN_ID`)
  }

  // Make sure the default chain is in the list of supported chains
  if (!chainIds.includes(defaultChainId)) {
    throw new Error(
      `The default chain id (${defaultChainId}) must be part of the list of supported networks: ${chainIds.join(', ')}`
    )
  }

  // Return rpc urls per network
  const rpcNetworks = chainIds.reduce<RpcNetworks>((acc, chainId) => {
    const url = process.env['REACT_APP_NETWORK_URL_' + chainId]

    if (!url) {
      throw new Error(
        `Network ${chainId} is supported, however 'REACT_APP_NETWORK_URL_${chainId} environment variable was not defined`
      )
    }

    acc[chainId] = url

    return acc
  }, {})

  // Get chainIds (excluding the NETWORK_CHAIN_ID)
  // Reason: By convention we will return NETWORK_CHAIN_ID as the first element in the supported networks
  const otherChainIds = Object.keys(rpcNetworks)
    .map(Number)
    .filter(networkId => networkId !== defaultChainId)
  const supportedChainIds = [defaultChainId, ...otherChainIds]

  return [rpcNetworks, supportedChainIds]
}

const [rpcNetworks, supportedChainIds] = getRpcNetworks()
export const NETWORK_CHAIN_ID = supportedChainIds[0]

export const network = new NetworkConnector({
  urls: rpcNetworks,
  defaultChainId: NETWORK_CHAIN_ID
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({ supportedChainIds })

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: rpcNetworks,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_KEY ?? '',
  chainId: NETWORK_CHAIN_ID
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: process.env.REACT_APP_PORTIS_ID ?? '',
  // TODO: Allow to configure multiple networks in portis
  // networks: supportedChainIds
  networks: [NETWORK_CHAIN_ID]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: rpcNetworks[NETWORK_CHAIN_ID],
  appName: 'CowSwap',
  appLogoUrl: 'https://raw.githubusercontent.com/gnosis/gp-swap-ui/develop/public/images/logo-square-512.png'
})
