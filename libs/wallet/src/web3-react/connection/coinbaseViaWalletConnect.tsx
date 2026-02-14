import { ReactNode, useCallback, useState } from 'react'

import { RPC_URLS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { URI_AVAILABLE } from '@web3-react/walletconnect-v2'

import styled from 'styled-components/macro'

import { onError } from './onError'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { WC_PROJECT_ID } from '../../constants'
import { WalletConnectV2Connector } from '../connectors/WalletConnectV2Connector'
import { useIsActiveConnection } from '../hooks/useIsActiveConnection'
import { ConnectionOptionProps, Web3ReactConnection } from '../types'
import { coinbaseDebug } from '../utils/coinbaseDebugLogger'

const coinbaseAppOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet-app',
}

// Per-chain cache — same pattern as walletConnectV2.tsx
const cbWcConnections = new Map<SupportedChainId, Web3ReactConnection>()

function createCoinbaseWcConnection(chainId: SupportedChainId): Web3ReactConnection {
  coinbaseDebug('createCoinbaseWcConnection', { chainId })

  const [connector, hooks] = initializeConnector<WalletConnectV2Connector>(
    (actions) =>
      new WalletConnectV2Connector({
        actions,
        onError,
        options: {
          projectId: WC_PROJECT_ID,
          chains: [chainId],
          optionalChains: ALL_SUPPORTED_CHAIN_IDS,
          rpcMap: RPC_URLS,
          showQrModal: false, // We handle the URI ourselves via deep-link
        },
      }),
  )

  return { connector, hooks, type: ConnectionType.WALLET_CONNECT_V2 }
}

export function getCoinbaseWcConnection(chainId: SupportedChainId = getCurrentChainIdFromUrl()): Web3ReactConnection {
  let connection = cbWcConnections.get(chainId)

  if (!connection) {
    connection = createCoinbaseWcConnection(chainId)
    cbWcConnections.set(chainId, connection)
  }

  return connection
}

/** Check if a connector instance belongs to a Coinbase-via-WC connection */
export function isCoinbaseWcConnector(c: Connector): boolean {
  return Array.from(cbWcConnections.values()).some((conn) => conn.connector === c)
}

// Deep-link helper — constructs Coinbase Wallet deep link from WC URI
function buildCoinbaseDeepLink(wcUri: string): string {
  return `cbwallet://wc?uri=${encodeURIComponent(wcUri)}`
}

// Fallback universal link — used when custom scheme fails (e.g. app not installed)
function buildCoinbaseUniversalLink(wcUri: string): string {
  return `https://go.cb-w.com/wc?uri=${encodeURIComponent(wcUri)}`
}

// Styled components for the fallback CTA state
const FallbackCard = styled.div`
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
`

const DeepLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: #315cf5;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  width: 100%;
  text-align: center;

  &:hover {
    opacity: 0.9;
  }
`

const SecondaryLink = styled.a`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 12px;
  text-decoration: underline;
`

const HelpText = styled.p`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 11px;
  margin: 0;
  text-align: center;
`

const CancelButton = styled.button`
  background: none;
  border: none;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: underline;
`

export function CoinbaseWalletAppOption({ tryActivation, selectedWallet }: ConnectionOptionProps): ReactNode {
  const chainId = getCurrentChainIdFromUrl()
  const connection = getCoinbaseWcConnection(chainId)
  const isActive = useIsActiveConnection(selectedWallet, connection)
  const [deepLinkUri, setDeepLinkUri] = useState<string | null>(null)
  const [wcUri, setWcUri] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const handleClick = useCallback(() => {
    coinbaseDebug('CoinbaseWalletAppOption clicked')
    setConnecting(true)
    setDeepLinkUri(null)
    setWcUri(null)

    const wcConnector = connection.connector as WalletConnectV2Connector

    // Per-activation listener (once) — avoids stale/duplicate redirects.
    // Each click registers exactly one listener; it self-removes after firing.
    wcConnector.events.once(URI_AVAILABLE, (uri: string) => {
      coinbaseDebug('URI_AVAILABLE received', { uri })
      const deepLink = buildCoinbaseDeepLink(uri)

      // Store the raw WC URI for building the universal link fallback
      setWcUri(uri)

      // Optimistic attempt — may work if iOS still considers this
      // within the user gesture window (~1-3s from tap)
      window.location.href = deepLink

      // Always store the URI for the fallback CTA button.
      // If the optimistic deep-link was blocked by iOS (async context),
      // the user can tap the CTA (direct user gesture → guaranteed to work).
      setDeepLinkUri(deepLink)
    })

    tryActivation(wcConnector)
  }, [connection, tryActivation])

  const handleCancel = useCallback(() => {
    setConnecting(false)
    setDeepLinkUri(null)
    setWcUri(null)
  }, [])

  // If we have a deep link URI but the user is still here (deep-link may have been blocked),
  // show a fallback CTA. This is an <a> element — tapping it is a direct user gesture,
  // which iOS always allows for custom scheme / universal link navigation.
  if (deepLinkUri && connecting) {
    return (
      <FallbackCard>
        <DeepLinkButton href={deepLinkUri}>
          <img src={CoinbaseImage} alt="Coinbase" width={20} height={20} />
          Tap to open Coinbase Wallet
        </DeepLinkButton>
        {wcUri && <SecondaryLink href={buildCoinbaseUniversalLink(wcUri)}>Or try this link</SecondaryLink>}
        <HelpText>After approving, switch back to this browser.</HelpText>
        <CancelButton onClick={handleCancel}>Cancel</CancelButton>
      </FallbackCard>
    )
  }

  return (
    <ConnectWalletOption
      {...coinbaseAppOption}
      isActive={isActive}
      onClick={handleClick}
      header="Coinbase Wallet App"
      subheader="via WalletConnect"
    />
  )
}
