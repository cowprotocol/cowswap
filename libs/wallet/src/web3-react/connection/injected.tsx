import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { AddEthereumChainParameter } from '@web3-react/types'

import { onError } from './onError'

import { default as InjectedImage } from '../../api/assets/arrow-right.svg'
import { default as InjectedImageDark } from '../../api/assets/arrow-right.svg'
import { default as MetamaskImage } from '../../api/assets/metamask.png'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'



class MetaMaskEnhanced extends MetaMask {
  /**
   * The trick is to override the activate method in order to call it without parameters
   * Because if we call it as activate(chainId)
   * It will request network change if the wallet is connected to a different chain
   *
   * @param chain when number, it means the initial request to connect, otherwise it's a request to change network
   */
  activate(chain: number | AddEthereumChainParameter): Promise<void> {
    return super.activate(typeof chain === 'number' ? undefined : chain)
  }
}

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

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMaskEnhanced>(
  (actions) => new MetaMaskEnhanced({ actions, onError })
)
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
    <ConnectWalletOption {...metamaskInjectedOption} header="MetaMask" link={METAMASK_DEEP_LINK + window.location} />
  )
}

export function MetaMaskOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, injectedConnection)

  return (
    <ConnectWalletOption
      {...metamaskInjectedOption}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, true)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}

export function InjectedOption({ darkMode, tryActivation, selectedWallet }: ConnectionOptionProps) {
  const options = darkMode ? injectedOptionDark : injectedOption

  const isActive = useIsActiveConnection(selectedWallet, injectedConnection)

  return (
    <ConnectWalletOption
      {...options}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, false)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}
