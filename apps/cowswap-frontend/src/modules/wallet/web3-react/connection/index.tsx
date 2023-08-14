import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Connector } from '@web3-react/types'

import { ALL_SUPPORTED_CHAIN_IDS } from 'legacy/constants/chains'
import { isMobile } from 'legacy/utils/userAgent'

import { getIsCoinbaseWallet, getIsInjected, getIsMetaMask } from 'modules/wallet/api/utils/connection'

import { FeatureGuard } from 'common/containers/FeatureGuard'

import { AlphaOption } from './alpha'
import { AmbireOption } from './ambire'
import { coinbaseWalletConnection, CoinbaseWalletOption } from './coinbase'
import { fortmaticConnection } from './formatic'
import {
  injectedConnection,
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
} from './injected'
import { injectedWidgetConnection } from './injectedWidget'
import { InstallKeystoneOption, keystoneConnection, KeystoneOption } from './keystone'
import { ledgerConnection, LedgerOption } from './ledger'
import { networkConnection } from './network'
import { gnosisSafeConnection } from './safe'
import { tallyWalletConnection } from './tally'
import { trezorConnection, TrezorOption } from './trezor'
import { trustWalletConnection, TrustWalletOption } from './trust'
import { walletConnectConnection, WalletConnectOption } from './walletConnect'
import { walletConnectConnectionV2, WalletConnectV2Option } from './walletConnectV2'

import { ConnectionType } from '../../api/types'
import { Web3ReactConnection } from '../types'

const allowedChainsByWallet: Record<ConnectionType, SupportedChainId[]> = {
  [ConnectionType.FORTMATIC]: [SupportedChainId.MAINNET],
  [ConnectionType.INJECTED]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.INJECTED_WIDGET]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.COINBASE_WALLET]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.WALLET_CONNECT]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.WALLET_CONNECT_V2]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.NETWORK]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.GNOSIS_SAFE]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TALLY]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TRUST]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.LEDGER]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.TREZOR]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.KEYSTONE]: ALL_SUPPORTED_CHAIN_IDS,
  [ConnectionType.ALPHA]: [],
  [ConnectionType.AMBIRE]: [],
  [ConnectionType.ZENGO]: [],
}

export function isChainAllowed(connector: Connector, chainId: number): boolean {
  const connection = getWeb3ReactConnection(connector)

  return allowedChainsByWallet[connection.type].includes(chainId)
}

const connectionTypeToConnection: Record<ConnectionType, Web3ReactConnection> = {
  [ConnectionType.INJECTED]: injectedConnection,
  [ConnectionType.COINBASE_WALLET]: coinbaseWalletConnection,
  [ConnectionType.WALLET_CONNECT]: walletConnectConnection,
  [ConnectionType.WALLET_CONNECT_V2]: walletConnectConnectionV2,
  [ConnectionType.ZENGO]: walletConnectConnection,
  [ConnectionType.FORTMATIC]: fortmaticConnection,
  [ConnectionType.NETWORK]: networkConnection,
  [ConnectionType.GNOSIS_SAFE]: gnosisSafeConnection,
  [ConnectionType.AMBIRE]: walletConnectConnection,
  [ConnectionType.ALPHA]: walletConnectConnection,
  [ConnectionType.TALLY]: tallyWalletConnection,
  [ConnectionType.TRUST]: trustWalletConnection,
  [ConnectionType.LEDGER]: ledgerConnection,
  [ConnectionType.KEYSTONE]: keystoneConnection,
  [ConnectionType.INJECTED_WIDGET]: injectedWidgetConnection,
  [ConnectionType.TREZOR]: trezorConnection,
}

const CONNECTIONS: Web3ReactConnection[] = Object.values(connectionTypeToConnection)

// TODO: add others
export const HARDWARE_WALLETS = [ConnectionType.TREZOR] as const

export type HardWareWallet = (typeof HARDWARE_WALLETS)[number]

export const getIsHardWareWallet = (connectionType: ConnectionType) =>
  HARDWARE_WALLETS.includes(connectionType as HardWareWallet)

export function getWeb3ReactConnection(c: Connector | ConnectionType): Web3ReactConnection {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  }

  return connectionTypeToConnection[c]
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
