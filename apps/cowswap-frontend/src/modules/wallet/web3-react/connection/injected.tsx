import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { Trans } from '@lingui/macro'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import useTheme from 'legacy/hooks/useTheme'

import { ConnectionType } from 'modules/wallet'
import { default as InjectedImage } from 'modules/wallet/api/assets/arrow-right.svg'
import { default as InjectedImageDark } from 'modules/wallet/api/assets/arrow-right.svg'
import { default as MetamaskImage } from 'modules/wallet/api/assets/metamask.png'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'

import { Web3ReactConnection } from '../types'

import { TryActivation, onError } from '.'

const METAMASK_DEEP_LINK = 'https://metamask.app.link/dapp/'

const metamaskCommonOption = {
  color: '#E8831D',
  icon: MetamaskImage,
  id: 'metamask',
}

const injectedCommon = {
  color: '#010101',
  id: 'injected',
}
export const injectedOption = {
  ...injectedCommon,
  icon: InjectedImage,
}

export const injectedOptionDark = {
  ...injectedCommon,
  icon: InjectedImageDark,
}

export const metamaskInstallOption = {
  ...metamaskCommonOption,
  header: 'Install MetaMask',
  link: 'https://metamask.io/',
}

export const metamaskInjectedOption = {
  ...metamaskCommonOption,
  header: 'MetaMask',
}

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
export const injectedConnection: Web3ReactConnection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
}

export function InstallMetaMaskOption() {
  return <ConnectWalletOption {...metamaskInstallOption} />
}

export function OpenMetaMaskMobileOption() {
  return (
    <ConnectWalletOption
      {...metamaskInjectedOption}
      header={<Trans>MetaMask</Trans>}
      link={METAMASK_DEEP_LINK + window.location}
    />
  )
}

export function MetaMaskOption({ tryActivation }: { tryActivation: TryActivation }) {
  // const isActive = injectedConnection.hooks.useIsActive()
  const isActive = useIsActiveWallet(injectedConnection) // MOD

  return (
    <ConnectWalletOption
      {...metamaskInjectedOption}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, true)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}

export function InjectedOption({ tryActivation }: { tryActivation: TryActivation }) {
  const { darkMode } = useTheme()
  const options = darkMode ? injectedOptionDark : injectedOption

  const isActive = useIsActiveWallet(injectedConnection) // MOD

  return (
    <ConnectWalletOption
      {...options}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, false)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}
