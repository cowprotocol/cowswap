import { Connector } from '@web3-react/types'
import TALLY_WALLET_ICON from '../../../assets/tally.svg'
import { ConnectionType, tallyWalletConnection } from '@cow/modules/wallet/api/utils/connections'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { getConnectionName } from '../../../utils'
import Option from '../Option'

const BASE_PROPS = {
  color: '#4196FC',
  icon: TALLY_WALLET_ICON,
  id: 'tally-ho',
}

export function TallyWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(tallyWalletConnection)

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(tallyWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TALLY_WALLET)}
    />
  )
}
