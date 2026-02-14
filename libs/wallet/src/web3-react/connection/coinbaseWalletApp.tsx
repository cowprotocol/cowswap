import { ReactNode, useCallback, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { buildDappDeepLink, buildDappUniversalLink } from './coinbaseWalletAppLinks'

import { default as CoinbaseImage } from '../../api/assets/coinbase.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionOptionProps } from '../types'
import { coinbaseDebug } from '../utils/coinbaseDebugLogger'
import { navigateTo } from '../utils/navigateTo'

const SESSION_KEY = 'cowswap_cb_app_launched'

const coinbaseAppOption = {
  color: '#315CF5',
  icon: CoinbaseImage,
  id: 'coinbase-wallet-app',
}

// --- Styled components for the fallback CTA ---

const FallbackWrapper = styled.div`
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 120px;
  justify-content: center;
`

const FallbackText = styled.p`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 12px;
  margin: 0;
  text-align: center;
`

const FallbackLink = styled.a`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 12px;
  text-decoration: underline;
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

/**
 * "Coinbase Wallet App" option for iOS external browsers.
 *
 * One-way launcher — opens CoW Swap inside the Coinbase Wallet dapp browser
 * via `cbwallet://dapp?url=...`. NOT a web3-react connector.
 *
 * State persisted to sessionStorage so the fallback CTA survives
 * tab suspension during app-switch and page reloads.
 */
export function CoinbaseWalletAppOption(_props: ConnectionOptionProps): ReactNode {
  const [launched, setLaunched] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })

  const handleClick = useCallback(() => {
    coinbaseDebug('CoinbaseWalletAppOption: launching dapp browser', {
      url: window.location.href,
    })
    // 1. Commit state BEFORE navigation — if iOS suspends the tab
    //    immediately, the state update is already queued/committed.
    setLaunched(true)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* private browsing */
    }
    // 2. Navigate after state is committed
    navigateTo(buildDappDeepLink(window.location.href))
  }, [])

  const handleCancel = useCallback(() => {
    setLaunched(false)
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* noop */
    }
  }, [])

  // Neutral fallback CTA — works for both:
  //   - User returned from Coinbase Wallet (retry link)
  //   - App wasn't installed (install link)
  // Retry is an <a href> (direct user gesture → iOS always allows scheme navigation).
  if (launched) {
    return (
      <FallbackWrapper>
        <FallbackLink href={buildDappDeepLink(window.location.href)}>Open Coinbase Wallet</FallbackLink>
        <FallbackText>
          Don't have the app?{' '}
          <FallbackLink href={buildDappUniversalLink(window.location.href)}>Get Coinbase Wallet</FallbackLink>
        </FallbackText>
        <CancelButton onClick={handleCancel}>Back</CancelButton>
      </FallbackWrapper>
    )
  }

  return (
    <ConnectWalletOption
      {...coinbaseAppOption}
      isActive={false}
      onClick={handleClick}
      header="Coinbase Wallet App"
      subheader="Opens in Coinbase app"
    />
  )
}
