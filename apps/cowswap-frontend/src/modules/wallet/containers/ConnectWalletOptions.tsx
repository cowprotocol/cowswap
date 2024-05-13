import { useTheme } from '@cowprotocol/common-hooks'
import { isMobile } from '@cowprotocol/common-utils'
import {
  AlphaOption,
  AmbireOption,
  CoinbaseWalletOption,
  InjectedOption,
  InstallMetaMaskOption,
  OpenMetaMaskMobileOption,
  InstallKeystoneOption,
  KeystoneOption,
  TrezorOption,
  TrustWalletOption,
  WalletConnectV2Option,
  getIsInjected,
  TryActivation,
  useMultiInjectedProviders,
  Eip6963Option,
  COINBASE_WALLET_RDNS,
  TRUST_WALLET_RDNS,
} from '@cowprotocol/wallet'

import { useSelectedWallet } from 'legacy/state/user/hooks'

export function ConnectWalletOptions({ tryActivation }: { tryActivation: TryActivation }) {
  const isInjected = getIsInjected()
  const selectedWallet = useSelectedWallet()
  const multiInjectedProviders = useMultiInjectedProviders()
  const { darkMode } = useTheme()

  const hasCoinbaseEip6963 = multiInjectedProviders.some((provider) => provider.info.rdns === COINBASE_WALLET_RDNS)
  const hasTrustWalletEip6963 = multiInjectedProviders.some((provider) => provider.info.rdns === TRUST_WALLET_RDNS)

  const isInjectedMobileBrowser = isMobile && isInjected

  const connectionProps = { darkMode, selectedWallet, tryActivation }

  let injectedOption
  if (!isInjected) {
    if (!isMobile) {
      injectedOption = <InstallMetaMaskOption />
    } else {
      injectedOption = <OpenMetaMaskMobileOption />
    }
  } else {
    if (multiInjectedProviders.length) {
      injectedOption = (
        <>
          {multiInjectedProviders.map((providerInfo) => {
            return (
              <Eip6963Option
                key={providerInfo.info.rdns}
                tryActivation={tryActivation}
                providerDetails={providerInfo}
              />
            )
          })}
        </>
      )
    } else {
      injectedOption = <InjectedOption {...connectionProps} />
    }
  }

  const coinbaseWalletOption = (!hasCoinbaseEip6963 && <CoinbaseWalletOption {...connectionProps} />) ?? null

  const walletConnectionV2Option = (!isInjectedMobileBrowser && <WalletConnectV2Option {...connectionProps} />) ?? null

  // Wallet-connect based
  const ambireOption = (!isInjectedMobileBrowser && <AmbireOption {...connectionProps} />) ?? null
  const alphaOption = (!isInjectedMobileBrowser && <AlphaOption {...connectionProps} />) ?? null
  const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption {...connectionProps} />) ?? null
  const keystoneOption =
    (!isInjectedMobileBrowser && <KeystoneOption {...connectionProps} />) || (!isMobile && <InstallKeystoneOption />)

  // Injected
  const trustOption =
    (!isInjectedMobileBrowser && !hasTrustWalletEip6963 && <TrustWalletOption {...connectionProps} />) ?? null

  return (
    <>
      {injectedOption}
      {walletConnectionV2Option}
      {coinbaseWalletOption}
      {trezorOption}
      {ambireOption}
      {alphaOption}
      {trustOption}
      {keystoneOption}
    </>
  )
}
