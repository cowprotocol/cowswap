import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'
import { initializeConnector } from '@web3-react/core'

import styled from 'styled-components/macro'

import { onError } from './onError'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { CoinbaseWallet } from '../connectors/Coinbase/coinbase.connector'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const coinbaseInjectedOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet',
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      onError,
    }),
)

export const coinbaseWalletConnection: Web3ReactConnection = {
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
}

export function CoinbaseWalletOption({ tryActivation, selectedWallet }: ConnectionOptionProps): ReactNode {
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

const coinbaseSmartWalletOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-smart-wallet',
}

export function CoinbaseSmartWalletOption({ tryActivation, selectedWallet }: ConnectionOptionProps): ReactNode {
  const isActive = useIsActiveConnection(selectedWallet, coinbaseWalletConnection)

  return (
    <ConnectWalletOption
      {...coinbaseSmartWalletOption}
      isActive={isActive}
      onClick={() => tryActivation(coinbaseWalletConnection.connector)}
      header="Coinbase Smart Wallet"
      subheader="Passkey / Smart Account"
    />
  )
}

const HintText = styled.p`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 12px;
  margin: 4px 0 0;
  text-align: center;
`

export function BaseAppHint(): ReactNode {
  const host = typeof window !== 'undefined' ? window.location.host : 'swap.cow.fi'

  return <HintText>Already have the Base app? Open {host} in the app&apos;s browser.</HintText>
}
