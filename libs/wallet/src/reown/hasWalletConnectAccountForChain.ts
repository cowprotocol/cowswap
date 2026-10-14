import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import { WALLET_CONNECT_CONNECTOR_ID } from './consts'
import { getReownChainNamespace } from './getReownChainNamespace'

export function hasWalletConnectAccountForChain(chainId: SupportedChainId): boolean {
  const namespace = getReownChainNamespace(chainId)

  if (!namespace) return false

  return (
    ConnectorController.getConnectorId(namespace) === WALLET_CONNECT_CONNECTOR_ID &&
    Boolean(ChainController.getAccountData(namespace)?.address)
  )
}
