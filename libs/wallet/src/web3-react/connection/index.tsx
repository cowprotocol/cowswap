import { Connector } from '@web3-react/types'

import { isMobile } from 'legacy/utils/userAgent'

import { FeatureGuard } from 'common/containers/FeatureGuard'

import { AlphaOption } from './alpha'
import { AmbireOption } from './ambire'
import { CoinbaseWalletOption } from './coinbase'
import { InjectedOption, InstallMetaMaskOption, MetaMaskOption, OpenMetaMaskMobileOption } from './injected'
import { InstallKeystoneOption, KeystoneOption } from './keystone'
import { LedgerOption } from './ledger'
import { TrezorOption } from './trezor'
import { TrustWalletOption } from './trust'
import { WalletConnectOption } from './walletConnect'
import { WalletConnectV2Option } from './walletConnectV2'

import { getIsCoinbaseWallet, getIsInjected, getIsMetaMask } from '../../api/utils/connection'

export type TryActivation = (connector: Connector) => void

export function ConnectWalletOptions({ tryActivation }: { tryActivation: TryActivation }) {
  const isInjected = getIsInjected()
  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()

  const isCoinbaseWalletBrowser = isMobile && isCoinbaseWallet
  const isMetaMaskBrowser = isMobile && isMetaMask
  const isInjectedMobileBrowser = isCoinbaseWalletBrowser || isMetaMaskBrowser
  // const isChromeMobile = isMobile && isChrome
  const showKeystone = !isInjectedMobileBrowser && !isMobile && window.ethereum?.isMetaMask

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
      injectedOption = <MetaMaskOption tryActivation={tryActivation} />
    } else {
      injectedOption = <InjectedOption tryActivation={tryActivation} />
    }
  }

  const coinbaseWalletOption = <CoinbaseWalletOption tryActivation={tryActivation} />

  const walletConnectionOption =
    (!isInjectedMobileBrowser && <WalletConnectOption tryActivation={tryActivation} />) ?? null

  const walletConnectionV2Option =
    (!isInjectedMobileBrowser && <WalletConnectV2Option tryActivation={tryActivation} />) ?? null

  // Wallet-connect based
  // const zengoOption = (!isInjectedMobileBrowser && <ZengoOption tryActivation={tryActivation} />) ?? null
  const ambireOption = (!isInjectedMobileBrowser && <AmbireOption tryActivation={tryActivation} />) ?? null
  const alphaOption = (!isInjectedMobileBrowser && <AlphaOption tryActivation={tryActivation} />) ?? null
  const ledgerOption = (!isInjectedMobileBrowser && !isMobile && <LedgerOption tryActivation={tryActivation} />) ?? null
  const trezorOption = (!isInjectedMobileBrowser && !isMobile && <TrezorOption tryActivation={tryActivation} />) ?? null
  const keystoneOption =
    (showKeystone && <KeystoneOption tryActivation={tryActivation} />) || (!isMobile && <InstallKeystoneOption />)

  // Injected
  // const tallyOption = (showTally && <TallyWalletOption tryActivation={tryActivation} />) ?? null
  const trustOption = (!isInjectedMobileBrowser && <TrustWalletOption tryActivation={tryActivation} />) ?? null

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

export function onError(error: Error) {
  console.debug(`[web3-react] Error: ${error}`)
}
