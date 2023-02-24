import { Connector } from '@web3-react/types'
import { coinbaseWalletConnection, ConnectionType } from 'connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils'

import { useSelectedWallet } from 'state/user/hooks'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' // MOD
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { coinbaseMobileOption, coinbaseInjectedOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'


export function OpenCoinbaseWalletOption() {
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.COINBASE_WALLET
  return (
    <ConnectWalletOption
      {...coinbaseMobileOption}
      isActive={isActive}
    />
  )
}

export function CoinbaseWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(coinbaseWalletConnection)

  return (
    <ConnectWalletOption
      {...coinbaseInjectedOption}
      isActive={isActive}
      onClick={() => tryActivation(coinbaseWalletConnection.connector)}
      header={getConnectionName(ConnectionType.COINBASE_WALLET)}
    />
  )
}
