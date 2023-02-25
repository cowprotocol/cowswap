import { ConnectionType } from '@cow/modules/wallet'
import { coinbaseWalletConnection } from '@cow/modules/wallet/web3-react/utils/connection/connections'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connections'

import { useSelectedWallet } from 'state/user/hooks'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' // MOD
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import {
  coinbaseMobileOption,
  coinbaseInjectedOption,
} from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'
import { TryActivation } from '..'

export function OpenCoinbaseWalletOption() {
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.COINBASE_WALLET
  return <ConnectWalletOption {...coinbaseMobileOption} isActive={isActive} />
}

export function CoinbaseWalletOption({ tryActivation }: { tryActivation: TryActivation }) {
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
