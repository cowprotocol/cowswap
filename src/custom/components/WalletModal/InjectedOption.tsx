import { Trans } from '@lingui/macro'
import { Connector } from '@web3-react/types'
import INJECTED_ICON_URL from 'assets/images/arrow-right.svg'
import INJECTED_ICON_WHITE_URL from 'assets/images/arrow-right-white.png'
import METAMASK_ICON_URL from 'assets/images/metamask.png'
import { ConnectionType, injectedConnection } from 'connection'
import { getConnectionName } from 'connection/utils'

import Option from 'components/WalletModal/Option'
import useTheme from 'hooks/useTheme'
import { useSelectedWallet } from 'state/user/hooks'

const INJECTED_PROPS = {
  color: '#010101',
  icon: INJECTED_ICON_URL,
  id: 'injected',
}

const METAMASK_PROPS = {
  color: '#E8831D',
  icon: METAMASK_ICON_URL,
  id: 'metamask',
}

export function InstallMetaMaskOption() {
  return <Option {...METAMASK_PROPS} header={<Trans>Install MetaMask</Trans>} link={'https://metamask.io/'} />
}

export function MetaMaskOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  // const isActive = injectedConnection.hooks.useIsActive()
  // MOD
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.INJECTED

  return (
    <Option
      {...METAMASK_PROPS}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, true)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}

export function InjectedOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  // const isActive = injectedConnection.hooks.useIsActive()
  // MOD
  const selectedWallet = useSelectedWallet()
  const isActive = selectedWallet === ConnectionType.INJECTED
  const { darkMode } = useTheme()
  const icon = darkMode ? INJECTED_ICON_WHITE_URL : INJECTED_ICON_URL
  return (
    <Option
      {...INJECTED_PROPS}
      icon={icon}
      isActive={isActive}
      header={getConnectionName(ConnectionType.INJECTED, false)}
      onClick={() => tryActivation(injectedConnection.connector)}
    />
  )
}
