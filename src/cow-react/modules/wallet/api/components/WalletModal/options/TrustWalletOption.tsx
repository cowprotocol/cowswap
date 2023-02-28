import { Connector } from '@web3-react/types'
import TRUST_WALLET_ICON from '../../../assets/trust-wallet.png'
import { ConnectionType, trustWalletConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName } from '@cow/modules/wallet/api/utils'

import Option from '../Option'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' // MOD

const TRUST_WALLET_PROPS = {
  color: '#E8831D',
  icon: TRUST_WALLET_ICON,
  id: 'trust-wallet',
}

export function TrustWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trustWalletConnection)

  return (
    <Option
      {...TRUST_WALLET_PROPS}
      isActive={isActive}
      header={getConnectionName(ConnectionType.TRUST_WALLET, true)}
      onClick={() => tryActivation(trustWalletConnection.connector)}
    />
  )
}
