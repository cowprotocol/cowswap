import { ConnectionType } from 'modules/wallet'
import {
  getConnectionName,
  getIsZengoWallet,
  getIsAmbireWallet,
  getIsAlphaWallet,
  getIsTrustWallet,
} from 'modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { TryActivation, onError } from '.'
import { useWalletMetaData } from 'modules/wallet'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { RPC_URLS } from 'legacy/constants/networks'
import { Web3ReactConnection } from '../types'
import { default as WalletConnectImage } from 'modules/wallet/api/assets/walletConnectIcon.svg'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

export const walletConnectOption = {
  color: '#4196FC',
  icon: WalletConnectImage,
  id: 'wallet-connect',
}

const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: RPC_URLS,
        qrcode: true,
      },
      onError,
    })
)
export const walletConnectConnection: Web3ReactConnection = {
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
}

export function WalletConnectOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(null, walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...walletConnectOption}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}
