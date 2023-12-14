import { useTheme } from '@cowprotocol/common-hooks'
import { isMobile } from '@cowprotocol/common-utils'
import {
  AlphaOption,
  AmbireOption,
  CoinbaseWalletOption,
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
  InstallKeystoneOption,
  KeystoneOption,
  // LedgerOption,
  TrezorOption,
  TrustWalletOption,
  WalletConnectV2Option,
  getIsCoinbaseWallet,
  getIsInjected,
  getIsMetaMask,
} from '@cowprotocol/wallet'
import { Connector } from '@web3-react/types'

import { useSelectedWallet } from 'legacy/state/user/hooks'

export type TryActivation = (connector: Connector) => void

export function ConnectWalletOptions({ tryActivation }: { tryActivation: TryActivation }) {
  const isInjected = getIsInjected()
  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()
  const selectedWallet = useSelectedWallet()
  const { darkMode } = useTheme()

  const isCoinbaseWalletBrowser = isMobile && isCoinbaseWallet
  const isMetaMaskBrowser = isMobile && isMetaMask
  const isInjectedMobileBrowser = isCoinbaseWalletBrowser || isMetaMaskBrowser
  // const isChromeMobile = isMobile && isChrome
  const showKeystone = !isInjectedMobileBrowser && !isMobile && window.ethereum?.isMetaMask

  const connectionProps = { darkMode, selectedWallet, tryActivation }

  // Show Tally option only in Chrome (includes Brave too), but not on mobile or as an injected browser
  // const showTally = !isInjectedMobileBrowser && isChrome && !isChromeMobile

  let injectedOption
  if (!isInjected) {
    if (!isMobile) {
      injectedOption = <InstallMetaMaskOption />
    } else {
      injectedOption = <OpenMetaMaskMobileOption />
    }
  } else {
    if (isMetaMask) {
      injectedOption = <MetaMaskOption {...connectionProps} />
    } else {
      injectedOption = <InjectedOption {...connectionProps} />
    }
  }

  const coinbaseWalletOption = <CoinbaseWalletOption {...connectionProps} />

  const walletConnectionV2Option = (!isInjectedMobileBrowser && <WalletConnectV2Option {...connectionProps} />) ?? null

  // Wallet-connect based
  // const zengoOption = (!isInjectedMobileBrowser && <ZengoOption {...connectionProps} />) ?? null
  const ambireOption = (!isInjectedMobileBrowser && <AmbireOption {...connectionProps} />) ?? null
  const alphaOption = (!isInjectedMobileBrowser && <AlphaOption {...connectionProps} />) ?? null
  // const ledgerOption = (!isInjectedMobileBrowser && !isMobile && <LedgerOption {...connectionProps} />) ?? null
  const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption {...connectionProps} />) ?? null
  const keystoneOption =
    (showKeystone && <KeystoneOption {...connectionProps} />) || (!isMobile && <InstallKeystoneOption />)

  // Injected
  // const tallyOption = (showTally && <TallyWalletOption {...connectionProps} />) ?? null
  const trustOption = (!isInjectedMobileBrowser && <TrustWalletOption {...connectionProps} />) ?? null

  return (
    <>
      {injectedOption}
      {walletConnectionV2Option}
      {coinbaseWalletOption}
      {/*{ledgerOption}*/}
      {trezorOption}
      {/*{zengoOption}*/}
      {ambireOption}
      {alphaOption}
      {/* {tallyOption} */}
      {trustOption}
      {keystoneOption}
    </>
  )
}
