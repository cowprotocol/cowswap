import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName, getIsZengoWallet, getIsAmbireWallet } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { TryActivation, onError } from '.'
import { useWalletMetaData } from '@cow/modules/wallet'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { RPC_URLS } from 'constants/networks'
import { Web3ReactConnection } from '../types'
import { default as WalletConnectImage } from '@cow/modules/wallet/api/assets/walletConnectIcon.svg'
import { WC_DISABLED_TEXT } from '@cow/modules/wallet/constants'

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
  const isActive = isWalletConnect && !getIsZengoWallet(walletName) && !getIsAmbireWallet(walletName)
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
