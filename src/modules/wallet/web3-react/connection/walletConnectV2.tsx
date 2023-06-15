import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { default as WalletConnectV2Image } from 'modules/wallet/api/assets/wallet-connect-v2.png'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'

import { TryActivation, onError } from '.'

import { Web3ReactConnection } from '../types'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'
const TOOLTIP_TEXT = 'Under development and unsupported by most wallets'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

const [mainnet, ...optionalChains] = Object.keys(RPC_URLS).map(Number)

export const [web3WalletConnectV2, web3WalletConnectV2Hooks] = initializeConnector<WalletConnectV2>(
  (actions) =>
    new WalletConnectV2({
      actions,
      options: {
        projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
        chains: [mainnet],
        optionalChains,
        showQrModal: true,
      },
      onError,
    })
)

export const walletConnectConnectionV2: Web3ReactConnection = {
  connector: web3WalletConnectV2,
  hooks: web3WalletConnectV2Hooks,
  type: ConnectionType.WALLET_CONNECT_V2,
}

export function WalletConnectV2Option({ tryActivation }: { tryActivation: TryActivation }) {
  const isActive = useIsActiveWallet(walletConnectConnectionV2)

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      tooltipText={TOOLTIP_TEXT}
      clickable={!isActive}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
