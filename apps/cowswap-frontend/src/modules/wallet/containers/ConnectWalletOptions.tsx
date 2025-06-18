import { ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { isMobile, isInjectedWidget, isTruthy } from '@cowprotocol/common-utils'
import { EIP6963ProviderDetail } from '@cowprotocol/types'
import {
  CoinbaseWalletOption,
  InjectedOption as DefaultInjectedOption,
  MetaMaskSdkOption,
  WalletConnectV2Option,
  getIsInjected,
  TryActivation,
  useMultiInjectedProviders,
  Eip6963Option,
  COINBASE_WALLET_RDNS,
  getIsInjectedMobileBrowser,
} from '@cowprotocol/wallet'

import { useSelectedWallet } from 'legacy/state/user/hooks'

interface ConnectWalletOptionsProps {
  tryActivation: TryActivation
  children: (content: ReactNode, count: number) => ReactNode
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConnectWalletOptions({ tryActivation, children }: ConnectWalletOptionsProps) {
  const selectedWallet = useSelectedWallet()
  const multiInjectedProviders = useMultiInjectedProviders()
  const { darkMode } = useTheme()

  const hasCoinbaseEip6963 = multiInjectedProviders.some((provider) => provider.info.rdns === COINBASE_WALLET_RDNS)

  const isWidget = isInjectedWidget()
  const isInjectedMobileBrowser = getIsInjectedMobileBrowser()

  const connectionProps = { darkMode, selectedWallet, tryActivation }

  const metaMaskSdkOption = <MetaMaskSdkOption key="MetaMaskSdkOption" {...connectionProps} />

  const coinbaseWalletOption =
    (!hasCoinbaseEip6963 && !(isMobile && isWidget) && (
      <CoinbaseWalletOption key="CoinbaseWalletOption" {...connectionProps} />
    )) ??
    null

  const walletConnectionV2Option =
    ((!isInjectedMobileBrowser || isWidget) && (
      <WalletConnectV2Option key="WalletConnectV2Option" {...connectionProps} />
    )) ??
    null
  // TODO: the Trezor connector is not working now and need to be repaired
  // const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption {...connectionProps} />) ?? null
  const injectedOption =
    (getIsInjected() && (
      <InjectedOptions
        key="InjectedOptions"
        connectionProps={connectionProps}
        multiInjectedProviders={multiInjectedProviders}
      />
    )) ??
    null

  const items = [
    injectedOption,
    metaMaskSdkOption,
    walletConnectionV2Option,
    coinbaseWalletOption,
    /*{trezorOption}*/
  ].filter(isTruthy)

  return children(<>{items}</>, items.length - 1)
}

interface InjectedOptionsProps {
  multiInjectedProviders: EIP6963ProviderDetail[]

  connectionProps: {
    darkMode: boolean
    tryActivation: TryActivation
    selectedWallet: string | undefined
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function InjectedOptions({ connectionProps, multiInjectedProviders }: InjectedOptionsProps) {
  if (multiInjectedProviders.length) {
    return (
      <>
        {multiInjectedProviders
          // Even if we detect the MetaMask Extension, we prefer to use the MetaMask SDK
          .filter((providerInfo) => !providerInfo.info.rdns.startsWith('io.metamask'))
          .map((providerInfo) => {
            return (
              <Eip6963Option
                key={providerInfo.info.rdns}
                providers={multiInjectedProviders}
                selectedWallet={connectionProps.selectedWallet}
                tryActivation={connectionProps.tryActivation}
                providerDetails={providerInfo}
              />
            )
          })}
      </>
    )
  }

  return <DefaultInjectedOption {...connectionProps} />
}
