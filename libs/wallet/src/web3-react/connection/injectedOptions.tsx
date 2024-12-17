import { useCallback } from 'react'

import { injectedWalletConnection } from './injectedWallet'

import { default as InjectedImage, default as InjectedImageDark } from '../../api/assets/arrow-right.svg'
import { default as MetamaskImage } from '../../api/assets/metamask.png'
import { useSelectedEip6963ProviderRdns, useSetEip6963Provider } from '../../api/hooks'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType, type EIP1193Provider, EIP6963ProviderDetail } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, TryActivation } from '../types'

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

export function InstallMetaMaskOption() {
  return <ConnectWalletOption {...metamaskInstallOption} />
}

export function OpenMetaMaskMobileOption() {
  return (
    <ConnectWalletOption {...metamaskInjectedOption} header="MetaMask" link={METAMASK_DEEP_LINK + window.location} />
  )
}

export function InjectedOption({ darkMode, tryActivation, selectedWallet }: ConnectionOptionProps) {
  const options = darkMode ? injectedOptionDark : injectedOption

  const isActive = useIsActiveConnection(selectedWallet, injectedWalletConnection)

  return (
    <ConnectWalletOption
      {...options}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED)}
      onClick={() => tryActivation(injectedWalletConnection.connector)}
    />
  )
}

interface Eip6963OptionProps {
  selectedWallet: string | undefined
  tryActivation: TryActivation
  providerDetails: EIP6963ProviderDetail
  providers: EIP6963ProviderDetail[]
}

export function Eip6963Option({
  tryActivation,
  selectedWallet,
  providerDetails: { provider, info },
  providers,
}: Eip6963OptionProps) {
  const setEip6963Provider = useSetEip6963Provider()
  const selectedRdns = useSelectedEip6963ProviderRdns()
  const isActive =
    useIsActiveConnection(selectedWallet, injectedWalletConnection) && !!selectedWallet && selectedRdns === info.rdns

  const onClick = useCallback(() => {
    // Save the previous provider in case the user disconnects to switch back to it
    if (injectedWalletConnection.connector.provider) {
      injectedWalletConnection.connector.prevProvider = injectedWalletConnection.connector.provider
    }

    injectedWalletConnection.connector.provider = provider
    injectedWalletConnection.connector.onConnect = (_provider: EIP1193Provider) => {
      const connected = providers.find((p) => p.provider === _provider)

      if (connected) {
        setEip6963Provider(connected.info.rdns)
      }
    }
    injectedWalletConnection.connector.onDisconnect = () => setEip6963Provider(null)

    tryActivation(injectedWalletConnection.connector)
  }, [provider, tryActivation, setEip6963Provider, providers])

  return (
    <ConnectWalletOption
      onClick={onClick}
      isActive={isActive}
      id={`wallet${info.rdns}`}
      color="#E8831D"
      icon={info.icon}
      header={info.name}
    />
  )
}
