import { Connector } from '@web3-react/types'
import { ConnectionType } from 'modules/wallet'
import { getConnectionName, getIsTrustWallet } from 'modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { walletConnectConnection } from './walletConnect'

import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { initializeConnector } from '@web3-react/core'
import { Web3ReactConnection } from '../types'
import { useWalletMetaData } from 'modules/wallet'
import { WC_DISABLED_TEXT } from 'modules/wallet/constants'
import { InjectedWallet } from 'modules/wallet/web3-react/connectors/Injected'

import { default as TrustImage } from 'modules/wallet/api/assets/trust.svg'

const WALLET_LINK = 'https://trustwallet.com/'
const BASE_PROPS = {
  color: '#4196FC',
  icon: TrustImage,
  id: 'trust',
}

const [trustWallet, trustWalletHooks] = initializeConnector<Connector>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: WALLET_LINK,
      searchKeywords: ['isTrust', 'isTrustWallet'],
    })
)
export const trustWalletConnection: Web3ReactConnection = {
  connector: trustWallet,
  hooks: trustWalletHooks,
  type: ConnectionType.TRUST,
}

export function TrustWalletInjectedOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trustWalletConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trustWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TRUST)}
    />
  )
}

export function TrustWalletWCOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
  const isActive = isWalletConnect && getIsTrustWallet(null, walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.TRUST)}
    />
  )
}

const e = window.ethereum
export const TrustWalletOption =
  e && (e.isTrust || e.isTrustWallet || e.providers?.find((p: any) => p.isTrust || p.isTrustWallet))
    ? TrustWalletInjectedOption
    : TrustWalletWCOption
