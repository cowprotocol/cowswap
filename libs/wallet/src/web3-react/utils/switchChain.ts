import { getChainInfo, RPC_URLS } from '@cowprotocol/common-const'
import {
  ALL_SUPPORTED_CHAIN_IDS,
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
  ink,
  SupportedChainId,
  HttpsString,
} from '@cowprotocol/cow-sdk'

import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'

function isChainAllowed(_connector: Connector, chainId: SupportedChainId): boolean {
  return ALL_SUPPORTED_CHAIN_IDS.includes(chainId)
}

function getRpcUrls(chainId: SupportedChainId): [HttpsString] {
  const rpcUrl = WALLET_RPC_SUGGESTION[chainId] || RPC_URLS[chainId]

  return [rpcUrl]
}

const WALLET_RPC_SUGGESTION: Record<SupportedChainId, HttpsString | null> = {
  [SupportedChainId.MAINNET]: mainnet.rpcUrls.default.http[0],
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain.rpcUrls.default.http[0],
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne.rpcUrls.default.http[0],
  [SupportedChainId.BASE]: base.rpcUrls.default.http[0],
  [SupportedChainId.SEPOLIA]: sepolia.rpcUrls.default.http[0],
  [SupportedChainId.POLYGON]: polygon.rpcUrls.default.http[0],
  [SupportedChainId.AVALANCHE]: avalanche.rpcUrls.default.http[0],
  [SupportedChainId.BNB]: bnb.rpcUrls.default.http[0],
  [SupportedChainId.LINEA]: linea.rpcUrls.default.http[0],
  [SupportedChainId.PLASMA]: plasma.rpcUrls.default.http[0],
  [SupportedChainId.INK]: ink.rpcUrls.default.http[0],
}

export async function switchChain(connector: Connector, chainId: SupportedChainId): Promise<void> {
  if (!isChainAllowed(connector, chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  }

  const isNetworkConnection = connector instanceof Network
  const isWalletConnectConnector = connector instanceof WalletConnect

  if (isNetworkConnection || isWalletConnectConnector) {
    await connector.activate(chainId)
  } else {
    const info = getChainInfo(chainId)
    const addChainParameter = {
      chainId,
      chainName: info.eip155Label,
      rpcUrls: getRpcUrls(chainId),
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: [info.explorer],
    }
    await connector.activate(addChainParameter)
  }
}
