import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { onError } from './onError'

import { default as KeystoneImage } from '../../api/assets/keystone.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName } from '../../api/utils/connection'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'

const TOOLTIP_TEXT = 'Connect your Keystone wallet using MetaMask'
const TOOLTIP_INSTALL_TEXT = 'Install Metamask to use Keystone wallet'

const keystoneCommonOption = {
  color: '#E8831D',
  icon: KeystoneImage,
  id: 'keystone',
}

export const keystoneInstallOption = {
  ...keystoneCommonOption,
  header: 'Keystone',
  link: 'https://metamask.io/',
}

export const keystoneOption = {
  ...keystoneCommonOption,
  header: 'Keystone',
  tooltipText: TOOLTIP_TEXT,
}

const [keystone, keystoneHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
export const keystoneConnection: Web3ReactConnection = {
  connector: keystone,
  hooks: keystoneHooks,
  type: ConnectionType.KEYSTONE,
}

export function InstallKeystoneOption() {
  return <ConnectWalletOption tooltipText={TOOLTIP_INSTALL_TEXT} {...keystoneInstallOption} />
}

export function KeystoneOption({ selectedWallet, tryActivation }: ConnectionOptionProps) {
  const isActive = useIsActiveConnection(selectedWallet, keystoneConnection)

  return (
    <ConnectWalletOption
      {...keystoneOption}
      isActive={isActive}
      clickable={!isActive}
      header={getConnectionName(ConnectionType.KEYSTONE, true)}
      onClick={() => tryActivation(keystoneConnection.connector)}
    />
  )
}
