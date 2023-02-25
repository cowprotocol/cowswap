import { Trans } from '@lingui/macro'

import { ConnectionType } from '@cow/modules/wallet'
import { injectedConnection } from '@cow/modules/wallet/web3-react/utils/connection/connections'
import { getConnectionName } from '@cow/modules/wallet/web3-react/utils/connection'

import useTheme from 'hooks/useTheme'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import {
  metamaskInjectedOption,
  metamaskInstallOption,
  injectedOption,
  injectedOptionDark,
} from '@cow/modules/wallet/api/pure/ConnectWalletOption/ConnectWalletOptions'
import { TryActivation } from '..'

const METAMASK_DEEP_LINK = 'https://metamask.app.link/dapp/'

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
