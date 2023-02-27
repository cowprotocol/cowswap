import { Connector } from '@web3-react/types'
import COINBASE_ICON_URL from '../../../assets/coinbase.svg'
import { coinbaseWalletConnection, ConnectionType } from 'connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils'

import Option from '../Option'
import { useSelectedWallet } from 'state/user/hooks'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' // MOD

const BASE_PROPS = {
  color: '#315CF5',
  icon: COINBASE_ICON_URL,
  id: 'coinbase-wallet',
}

export function OpenCoinbaseWalletOption() {
  // const isActive = coinbaseWalletConnection.hooks.useIsActive()
  // MOD
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.COINBASE_WALLET
  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      link="https://go.cb-w.com/mtUDhEZPy1"
      header="Open in Coinbase Wallet"
    />
  )
}

export function CoinbaseWalletOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  // const isActive = coinbaseWalletConnection.hooks.useIsActive()
  const isActive = useIsActiveWallet(coinbaseWalletConnection) // MOD

  return (
    <Option
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(coinbaseWalletConnection.connector)}
      header={getConnectionName(ConnectionType.COINBASE_WALLET)}
    />
  )
}
