import { SupportedChainId } from 'constants/chains'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'

import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'

import { useSelectedWallet } from 'state/user/hooks'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'

import CowImage from 'assets/cow-swap/cow_v2.svg'
import { RPC_URLS } from 'constants/networks'

import { TryActivation, onError } from '.'
import { Web3ReactConnection } from '../types'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'

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

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[SupportedChainId.MAINNET],
        appName: 'CoW Swap',
        appLogoUrl: CowImage,
        reloadOnDisconnect: false,
      },
      onError,
    })
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
