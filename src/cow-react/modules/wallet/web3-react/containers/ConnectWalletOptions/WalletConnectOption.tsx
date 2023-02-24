import { Connector } from '@web3-react/types'
import { ConnectionType, walletConnectConnection } from 'connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { walletConnectOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'

export function WalletConnectOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(walletConnectConnection)
  return (
    <ConnectWalletOption
      {...walletConnectOption}
      isActive={isActive}
      onClick={() => tryActivation(walletConnectConnection.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT)}
    />
  )
}
