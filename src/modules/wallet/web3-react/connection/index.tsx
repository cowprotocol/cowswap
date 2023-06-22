import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { ALL_SUPPORTED_CHAIN_IDS } from 'legacy/constants/chains'
import { /* isChrome, */ isMobile } from 'legacy/utils/userAgent'

import { getIsCoinbaseWallet, getIsInjected, getIsMetaMask } from 'modules/wallet/api/utils/connection'

import { AlphaOption } from './alpha'
import { AmbireOption } from './ambire'
import { CoinbaseWalletOption } from './coinbase'
import { coinbaseWalletConnection } from './coinbase'
import { fortmaticConnection } from './formatic'
import { InjectedOption, InstallMetaMaskOption, MetaMaskOption, OpenMetaMaskMobileOption } from './injected'
import { injectedConnection } from './injected'
import { injectedWidgetConnection } from './injectedWidget'
import { InstallKeystoneOption, keystoneConnection, KeystoneOption } from './keystone'
import { ledgerConnection, LedgerOption } from './ledger'
import { networkConnection } from './network'
import { gnosisSafeConnection } from './safe'
import { tallyWalletConnection /* TallyWalletOption */ } from './tally'
import { trustWalletConnection, TrustWalletOption } from './trust'
import { WalletConnectOption } from './walletConnect'
import { walletConnectConnection } from './walletConnect'
import { ZengoOption } from './zengo'

import { ConnectionType } from '../../api/types'
import { Web3ReactConnection } from '../types'

const CONNECTIONS: Web3ReactConnection[] = [
  gnosisSafeConnection,
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  fortmaticConnection,
  networkConnection,
  tallyWalletConnection,
  trustWalletConnection,
  ledgerConnection,
  keystoneConnection,
  injectedWidgetConnection,
]

export function isChainAllowed(connector: Connector, chainId: number) {
  switch (connector) {
    case fortmaticConnection.connector:
      return chainId === SupportedChainId.MAINNET
    case injectedConnection.connector:
    case coinbaseWalletConnection.connector:
    case walletConnectConnection.connector:
    case networkConnection.connector:
    case gnosisSafeConnection.connector:
    case tallyWalletConnection.connector:
    case trustWalletConnection.connector:
    case injectedWidgetConnection.connector:
    case ledgerConnection.connector:
    case keystoneConnection.connector:
      return ALL_SUPPORTED_CHAIN_IDS.includes(chainId)
    default:
      return false
  }
}

export function getWeb3ReactConnection(c: Connector | ConnectionType): Web3ReactConnection {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection
      case ConnectionType.ZENGO:
        return walletConnectConnection
      case ConnectionType.FORTMATIC:
        return fortmaticConnection
      case ConnectionType.NETWORK:
        return networkConnection
      case ConnectionType.GNOSIS_SAFE:
        return gnosisSafeConnection
      case ConnectionType.AMBIRE:
        return walletConnectConnection
      case ConnectionType.ALPHA:
        return walletConnectConnection
      case ConnectionType.TALLY:
        return tallyWalletConnection
      case ConnectionType.TRUST:
        return trustWalletConnection
      case ConnectionType.LEDGER:
        return ledgerConnection
      case ConnectionType.KEYSTONE:
        return keystoneConnection
      case ConnectionType.INJECTED_WIDGET:
        return injectedWidgetConnection
    }
  }
}

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

  // Wallet-connect based
  const zengoOption = (!isInjectedMobileBrowser && <ZengoOption tryActivation={tryActivation} />) ?? null
  const ambireOption = (!isInjectedMobileBrowser && <AmbireOption tryActivation={tryActivation} />) ?? null
  const alphaOption = (!isInjectedMobileBrowser && <AlphaOption tryActivation={tryActivation} />) ?? null
  const ledgerOption = (!isInjectedMobileBrowser && !isMobile && <LedgerOption tryActivation={tryActivation} />) ?? null
  const keystoneOption =
    (showKeystone && <KeystoneOption tryActivation={tryActivation} />) || (!isMobile && <InstallKeystoneOption />)

  // Injected
  // const tallyOption = (showTally && <TallyWalletOption tryActivation={tryActivation} />) ?? null
  const trustOption = (!isInjectedMobileBrowser && <TrustWalletOption tryActivation={tryActivation} />) ?? null

  return (
    <>
      {injectedOption}
      {walletConnectionOption}
      {coinbaseWalletOption}
      {ledgerOption}
      {zengoOption}
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
