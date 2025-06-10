import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector } from '@web3-react/core'

import { AsyncConnector } from './asyncConnector'
import { onError } from './onError'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const coinbaseInjectedOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet',
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<AsyncConnector>(
  (actions) =>
    new AsyncConnector(
      () =>
        import('@web3-react/coinbase-wallet').then(
          (m) =>
            new m.CoinbaseWallet({
              actions,
              options: {
                url: RPC_URLS[SupportedChainId.MAINNET],
                appName: 'CoW Swap',
                appLogoUrl: CowImage,
                reloadOnDisconnect: false,
              },
              onError,
            }),
        ),
      actions,
      onError,
    ),
)

export const coinbaseWalletConnection: Web3ReactConnection = {
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoinbaseWalletOption({ tryActivation, selectedWallet }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, coinbaseWalletConnection)

  return (
    <ConnectWalletOption
      {...coinbaseInjectedOption}
      isActive={isActive}
      onClick={() => tryActivation(coinbaseWalletConnection.connector)}
      header={getConnectionName(ConnectionType.COINBASE_WALLET)}
    />
  )
}
