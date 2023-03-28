import { Connector } from '@web3-react/types'
import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { initializeConnector } from '@web3-react/core'
import { InjectedWallet } from '@cow/modules/wallet/web3-react/connectors/Injected'
import { Web3ReactConnection } from '../types'

import { default as TrustImage } from '@cow/modules/wallet/api/assets/trust.png'

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

export function TrustWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
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
