import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { initializeConnector } from '@web3-react/core'

import CowImage from 'legacy/assets/cow-swap/cow_v2.svg'
import { RPC_URLS } from 'legacy/constants/networks'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import { useSelectedWallet } from 'legacy/state/user/hooks'

import { ConnectionType } from 'modules/wallet'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'

import { AsyncConnector } from './asyncConnector'

import { TryActivation, onError } from '.'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { Web3ReactConnection } from '../types'

const coinbaseInjectedOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet',
}

const coinbaseMobileOption = {
  ...coinbaseInjectedOption,
  header: 'Open in Coinbase Wallet',
  link: 'https://go.cb-w.com/mtUDhEZPy1',
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
            })
        ),
      actions,
      onError
    )
)

export const coinbaseWalletConnection: Web3ReactConnection = {
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
}

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
