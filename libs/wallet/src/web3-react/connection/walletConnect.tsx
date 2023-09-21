import { useMemo } from 'react'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { default as WalletConnectImage } from '../../api/assets/walletConnectIcon.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import {
  getConnectionName,
  getIsAlphaWallet,
  getIsAmbireWallet,
  getIsTrustWallet,
  getIsZengoWallet,
} from '../../api/utils/connection'
import { WC_DISABLED_TEXT } from '../../constants'
import { useWalletMetaData } from '../hooks/useWalletMetadata'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { RPC_URLS } from '@cowprotocol/common-const'
import { onError } from './onError'
import { useFlags } from 'launchdarkly-react-client-sdk'

const WC_SUNSET_LINK =
  'https://medium.com/walletconnect/weve-reset-the-clock-on-the-walletconnect-v1-0-shutdown-now-scheduled-for-june-28-2023-ead2d953b595'
const WC_SUNSET_TEXT =
  'The WalletConnect v1.0 protocol has been shut down on June 28, 2023 at 2pm (UTC). Click to read more.'

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
        bridge: process.env.REACT_APP_WALLET_CONNECT_V1_BRIDGE || 'https://safe-walletconnect.safe.global',
      },
      onError,
    })
)
export const walletConnectConnection: Web3ReactConnection = {
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
}

export function WalletConnectOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const { walletName } = useWalletMetaData()
  const { walletConnectV1Deprecated: isDeprecated } = useFlags()

  const isWalletConnect = useIsActiveConnection(selectedWallet, walletConnectConnection)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(walletName)

  const tooltipText = useMemo(() => {
    if (isDeprecated) {
      return WC_SUNSET_TEXT
    }

    return !isActive && isWalletConnect ? WC_DISABLED_TEXT : null
  }, [isActive, isWalletConnect, isDeprecated])

  const link = isDeprecated ? WC_SUNSET_LINK : null

  return (
    <ConnectWalletOption
      {...walletConnectOption}
      isActive={isActive}
      isDeprecated={isDeprecated}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      link={link}
      onClick={() => (!isDeprecated ? tryActivation(walletConnectConnection.connector) : null)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}
