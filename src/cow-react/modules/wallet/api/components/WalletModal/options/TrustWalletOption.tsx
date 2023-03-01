import { Connector } from '@web3-react/types'
import TRUST_WALLET_ICON_URL from '../../../assets/trust-wallet.png'
import { ConnectionType, trustWalletConnection } from '@cow/modules/wallet/api/utils/connections'
import { getConnectionName } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'

import Option from '../Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TRUST_WALLET_ICON_URL,
  id: 'tally-ho',
}

export function TrustWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trustWalletConnection)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trustWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TRUST_WALLET)}
    />
  )
}
