import { initializeConnector } from '@web3-react/core'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType, useWalletMetaData } from 'modules/wallet'
import { default as WalletConnectV2Image } from 'modules/wallet/api/assets/wallet-connect-v2.png'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import {
  getConnectionName,
  getIsAlphaWallet,
  getIsAmbireWallet,
  getIsTrustWallet,
  getIsZengoWallet,
} from 'modules/wallet/api/utils/connection'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'

import { AsyncConnector } from './asyncConnector'

import { Web3ReactConnection } from '../types'

import { TryActivation, onError } from '.'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'
const TOOLTIP_TEXT =
  'Currently in development and not widely adopted yet. If you are experiencing issues, contact your wallet provider.'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

const [mainnet, ...optionalChains] = Object.keys(RPC_URLS).map(Number)

const [web3WalletConnectV2, web3WalletConnectV2Hooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(
      () =>
        import('@web3-react/walletconnect-v2').then(
          (m) =>
            new m.WalletConnect({
              actions,
              options: {
                projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
                chains: [mainnet],
                optionalChains,
                showQrModal: true,
              },
              onError,
            })
        ),
      actions,
      onError
    )
)

export const walletConnectConnectionV2: Web3ReactConnection = {
  connector: web3WalletConnectV2,
  hooks: web3WalletConnectV2Hooks,
  type: ConnectionType.WALLET_CONNECT_V2,
}

export function WalletConnectV2Option({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnectionV2)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(null, walletName)

  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : TOOLTIP_TEXT

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
