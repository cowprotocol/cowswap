import { useMemo } from 'react'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { useWalletMetaData } from 'modules/wallet'
import { default as WalletConnectImage } from 'modules/wallet/api/assets/walletConnectIcon.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import {
  getConnectionName,
  getIsZengoWallet,
  getIsAmbireWallet,
  getIsAlphaWallet,
  getIsTrustWallet,
} from 'modules/wallet/api/utils/connection'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

import { TryActivation, onError } from '.'

import { Web3ReactConnection } from '../types'

const WC_SUNSET_LINK =
  'https://medium.com/walletconnect/weve-reset-the-clock-on-the-walletconnect-v1-0-shutdown-now-scheduled-for-june-28-2023-ead2d953b595'

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
        bridge: 'https://safe-walletconnect.safe.global',
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
  const { walletConnectV1Enabled } = useFeatureFlags()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(null, walletName)

  const tooltipText = useMemo(() => {
    if (!walletConnectV1Enabled) {
      return 'The WalletConnect v1.0 protocol has been shut down on June 28, 2023 at 2pm (UTC). Click to read more.'
    }

    return !isActive && isWalletConnect ? WC_DISABLED_TEXT : null
  }, [isActive, isWalletConnect, walletConnectV1Enabled])

  const link = !walletConnectV1Enabled ? WC_SUNSET_LINK : null

  return (
    <ConnectWalletOption
      {...walletConnectOption}
      isActive={isActive}
      isDisabled={!walletConnectV1Enabled}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      link={link}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}
