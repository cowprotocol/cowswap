import { ConnectionType } from '@cow/modules/wallet'
import { getConnectionName } from '@cow/modules/wallet/api/utils/connection'

import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { TryActivation, onError } from '.'

import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Web3ReactConnection } from '../types'

import { default as KeystoneImage } from '@cow/modules/wallet/api/assets/keystone.svg'

const TOOLTIP_TEXT = 'Connect your Keystone wallet using Metamask'
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

export function KeystoneOption({ tryActivation }: { tryActivation: TryActivation }) {
  const isActive = useIsActiveWallet(keystoneConnection)

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
