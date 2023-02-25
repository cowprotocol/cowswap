import { ConnectionType } from '@cow/modules/wallet'
import { walletConnectConnection } from '@cow/modules/wallet/web3-react/utils/connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { walletConnectOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'
import { TryActivation } from '..'

export function WalletConnectOption({ tryActivation }: { tryActivation: TryActivation }) {
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
