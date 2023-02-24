import { Trans } from '@lingui/macro'
import { Connector } from '@web3-react/types'

import { ConnectionType, injectedConnection } from 'connection'
import { getConnectionName } from '@cow/modules/wallet/api/utils'

import useTheme from 'hooks/useTheme'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet' 
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { metamaskInjectedOption, metamaskInstallOption, injectedOption, injectedOptionDark } from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'


const METAMASK_DEEP_LINK = 'https://metamask.app.link/dapp/'

export function InstallMetaMaskOption() {
  return <ConnectWalletOption {...metamaskInstallOption} />
}

export function OpenMetaMaskMobileOption() {
  return <ConnectWalletOption {...metamaskInjectedOption} header={<Trans>MetaMask</Trans>} link={METAMASK_DEEP_LINK + window.location} />
}

export function MetaMaskOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
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

export function InjectedOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
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
