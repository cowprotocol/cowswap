import { initializeConnector } from '@web3-react/core'
import { WalletConnect } from '@web3-react/walletconnect-v2'

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

import { getCurrentChainIdFromUrl } from 'utils/getCurrentChainIdFromUrl'

import { Web3ReactConnection } from '../types'

import { TryActivation } from '.'

const TOOLTIP_TEXT =
  'Currently in development and not widely adopted yet. If you are experiencing issues, contact your wallet provider.'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

function createWc2Connection(chainId = getCurrentChainIdFromUrl()): Web3ReactConnection {
  const [web3WalletConnectV2, web3WalletConnectV2Hooks] = initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        onError(error) {
          console.error('WalletConnect2 ERROR:', error)
        },
        options: {
          projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
          chains: [chainId],
          showQrModal: true,
          rpcMap: RPC_URLS,
        },
      })
  )

  return {
    connector: web3WalletConnectV2,
    hooks: web3WalletConnectV2Hooks,
    type: ConnectionType.WALLET_CONNECT_V2,
  }
}

export const walletConnectConnectionV2 = createWc2Connection()

export function WalletConnectV2Option({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnectionV2)
  const isActive =
    isWalletConnect &&
    !getIsZengoWallet(walletName) &&
    !getIsAmbireWallet(walletName) &&
    !getIsAlphaWallet(walletName) &&
    !getIsTrustWallet(walletName)

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
