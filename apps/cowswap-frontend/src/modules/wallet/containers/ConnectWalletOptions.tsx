import { Connector } from '@web3-react/types'

import { isMobile } from '@cowswap/common-utils'

import { FeatureGuard } from 'common/containers/FeatureGuard'

import { AlphaOption } from '../../../../../../libs/wallet/src/web3-react/connection/alpha'
import { AmbireOption } from '../../../../../../libs/wallet/src/web3-react/connection/ambire'
import { CoinbaseWalletOption } from '../../../../../../libs/wallet/src/web3-react/connection/coinbase'
import {
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
} from '../../../../../../libs/wallet/src/web3-react/connection/injected'
import { InstallKeystoneOption, KeystoneOption } from '../../../../../../libs/wallet/src/web3-react/connection/keystone'
import { LedgerOption } from '../../../../../../libs/wallet/src/web3-react/connection/ledger'
import { TrezorOption } from '../../../../../../libs/wallet/src/web3-react/connection/trezor'
import { TrustWalletOption } from '../../../../../../libs/wallet/src/web3-react/connection/trust'
import { WalletConnectOption } from '../../../../../../libs/wallet/src/web3-react/connection/walletConnect'
import { WalletConnectV2Option } from '../../../../../../libs/wallet/src/web3-react/connection/walletConnectV2'

import {
  getIsCoinbaseWallet,
  getIsInjected,
  getIsMetaMask,
} from '../../../../../../libs/wallet/src/api/utils/connection'
import { useSelectedWallet } from 'legacy/state/user/hooks'
import { useTheme } from '@cowswap/common-hooks'

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

  const walletConnectionOption = (!isInjectedMobileBrowser && <WalletConnectOption {...connectionProps} />) ?? null

  const walletConnectionV2Option = (!isInjectedMobileBrowser && <WalletConnectV2Option {...connectionProps} />) ?? null

  // Wallet-connect based
  // const zengoOption = (!isInjectedMobileBrowser && <ZengoOption {...connectionProps} />) ?? null
  const ambireOption = (!isInjectedMobileBrowser && <AmbireOption {...connectionProps} />) ?? null
  const alphaOption = (!isInjectedMobileBrowser && <AlphaOption {...connectionProps} />) ?? null
  const ledgerOption = (!isInjectedMobileBrowser && !isMobile && <LedgerOption {...connectionProps} />) ?? null
  const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption {...connectionProps} />) ?? null
  const keystoneOption =
    (showKeystone && <KeystoneOption {...connectionProps} />) || (!isMobile && <InstallKeystoneOption />)

  // Injected
  // const tallyOption = (showTally && <TallyWalletOption {...connectionProps} />) ?? null
  const trustOption = (!isInjectedMobileBrowser && <TrustWalletOption {...connectionProps} />) ?? null

  return (
    <>
      {injectedOption}
      <FeatureGuard featureFlag="walletConnectV1Enabled">{walletConnectionOption}</FeatureGuard>
      <FeatureGuard featureFlag="walletConnectV2Enabled">{walletConnectionV2Option}</FeatureGuard>
      {coinbaseWalletOption}
      {ledgerOption}
      <FeatureGuard featureFlag="trezorEnabled">{trezorOption}</FeatureGuard>
      {/*{zengoOption}*/}
      {ambireOption}
      {alphaOption}
      {/* {tallyOption} */}
      {trustOption}
      {keystoneOption}
    </>
  )
}
