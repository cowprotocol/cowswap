import { ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { isMobile, isInjectedWidget, isTruthy } from '@cowprotocol/common-utils'
import { EIP6963ProviderDetail } from '@cowprotocol/types'
import {
  CoinbaseWalletOption,
  CoinbaseSmartWalletOption,
  BaseAppHint,
  isIosExternalBrowser,
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

export function ConnectWalletOptions({ tryActivation, children }: ConnectWalletOptionsProps): ReactNode {
  const selectedWallet = useSelectedWallet()
  const multiInjectedProviders = useMultiInjectedProviders()
  const { darkMode } = useTheme()

  const hasCoinbaseEip6963 = multiInjectedProviders.some((provider) => provider.info.rdns === COINBASE_WALLET_RDNS)

  const isWidget = isInjectedWidget()
  const isInjectedMobileBrowser = getIsInjectedMobileBrowser()

  const connectionProps = { darkMode, selectedWallet, tryActivation }

  const hasInjectedMetaMask = multiInjectedProviders.some((providerInfo) =>
    providerInfo.info.rdns.startsWith('io.metamask'),
  )
  const showMetaMaskSdkOption = !hasInjectedMetaMask && !isMobile
  const metaMaskSdkOption = showMetaMaskSdkOption ? (
    <MetaMaskSdkOption key="MetaMaskSdkOption" {...connectionProps} />
  ) : null

  const showCoinbase = !hasCoinbaseEip6963 && !(isMobile && isWidget)

  let coinbaseOptions: ReactNode[] = []
  if (showCoinbase) {
    if (isIosExternalBrowser()) {
      coinbaseOptions = [
        <div key="coinbase-ios">
          <CoinbaseSmartWalletOption {...connectionProps} />
          <BaseAppHint />
        </div>,
      ]
    } else {
      coinbaseOptions = [<CoinbaseWalletOption key="CoinbaseWalletOption" {...connectionProps} />]
    }
  }

  const walletConnectionV2Option =
    ((!isInjectedMobileBrowser || isWidget) && (
      <WalletConnectV2Option key="WalletConnectV2Option" {...connectionProps} />
    )) ??
    null
  // TODO: the Trezor connector is not working now and needs to be repaired
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
    ...coinbaseOptions,
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

function InjectedOptions({ connectionProps, multiInjectedProviders }: InjectedOptionsProps): ReactNode {
  if (multiInjectedProviders.length) {
    return (
      <>
        {multiInjectedProviders.map((providerInfo) => {
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
