import { useTheme } from '@cowprotocol/common-hooks'
import { isMobile, isInjectedWidget } from '@cowprotocol/common-utils'
import {
  CoinbaseWalletOption,
  InjectedOption as DefaultInjectedOption,
  InstallMetaMaskOption,
  OpenMetaMaskMobileOption,
  TrezorOption,
  WalletConnectV2Option,
  getIsInjected,
  TryActivation,
  useMultiInjectedProviders,
  Eip6963Option,
  COINBASE_WALLET_RDNS,
  getIsInjectedMobileBrowser,
  EIP6963ProviderDetail,
} from '@cowprotocol/wallet'

import { useSelectedWallet } from 'legacy/state/user/hooks'


export function ConnectWalletOptions({ tryActivation }: { tryActivation: TryActivation }) {
  const selectedWallet = useSelectedWallet()
  const multiInjectedProviders = useMultiInjectedProviders()
  const { darkMode } = useTheme()

  const hasCoinbaseEip6963 = multiInjectedProviders.some((provider) => provider.info.rdns === COINBASE_WALLET_RDNS)

  const isWidget = isInjectedWidget()
  const isInjectedMobileBrowser = getIsInjectedMobileBrowser()

  const connectionProps = { darkMode, selectedWallet, tryActivation }

  const coinbaseWalletOption = (!hasCoinbaseEip6963 && <CoinbaseWalletOption {...connectionProps} />) ?? null
  const walletConnectionV2Option =
    ((!isInjectedMobileBrowser || isWidget) && <WalletConnectV2Option {...connectionProps} />) ?? null
  const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption {...connectionProps} />) ?? null

  return (
    <>
      <InjectedOptions connectionProps={connectionProps} multiInjectedProviders={multiInjectedProviders} />
      {walletConnectionV2Option}
      {coinbaseWalletOption}
      {trezorOption}
    </>
  )
}

interface InjectedOptionsProps {
  multiInjectedProviders: EIP6963ProviderDetail[]

  connectionProps: {
    darkMode: boolean
    tryActivation: TryActivation
    selectedWallet: string | undefined
  }
}

function InjectedOptions({ connectionProps, multiInjectedProviders }: InjectedOptionsProps) {
  const isInjected = getIsInjected()

  if (!isInjected) {
    if (!isMobile) {
      return <InstallMetaMaskOption />
    } else {
      return <OpenMetaMaskMobileOption />
    }
  } else {
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
}
