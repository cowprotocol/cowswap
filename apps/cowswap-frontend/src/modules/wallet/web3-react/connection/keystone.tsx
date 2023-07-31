import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { ConnectionType } from 'modules/wallet'
import { default as KeystoneImage } from 'modules/wallet/api/assets/keystone.svg'
import { ConnectWalletOption } from 'modules/wallet/api/pure/ConnectWalletOption'
import { getConnectionName } from 'modules/wallet/api/utils/connection'

import { Web3ReactConnection } from '../types'

import { TryActivation, onError } from '.'

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
