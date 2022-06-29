import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'

import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useAppSelector } from 'state/hooks'

enum SentryTag {
  DISCONNECTED = 'DISCONNECTED',
}

/**
 * _getSentryChainId
 * @param appChainId - redux chainId (not necessarily connected to a wallet)
 * @param connectedChainId - wallet chainId
 * @returns string e.g "DISCONNECTED" | appChainId | connectedChainId
 */
function _getSentryChainIdAndConnectionStatus(
  appChainId: number | null,
  connectedChainId: number | undefined
): [string, boolean] {
  // match connectedChainId type
  const appChainNormalised = appChainId ?? undefined

  let sentryChainId
  let connected
  // neither connected
  if (appChainNormalised === undefined && connectedChainId === undefined) {
    connected = false
  } else if (connectedChainId === undefined) {
    // user is browsing app disconnected from wallet
    sentryChainId = appChainNormalised
    connected = false
  } else {
    // connectedChainId takes precedence
    sentryChainId = connectedChainId
    connected = true
  }

  // if not connected, sentry doesn't accept undefined, use "DISCONNECTED"
  return [sentryChainId?.toString() || SentryTag.DISCONNECTED, connected]
}

export default function Updater(): null {
  const { account, chainId: connectedChainId, walletName } = useWalletInfo()
  // app chain id maintains state for users disconnected but browsing app
  const disconnectedChainId = useAppSelector((state) => state.application.chainId)
  const windowVisible = useIsWindowVisible()

  const {
    INPUT: { currencyId: sellTokenAddress },
    OUTPUT: { currencyId: buyTokenAddress },
  } = useSwapState()

  const { symbol: buySymbol, name: buyName } = useCurrency(buyTokenAddress) || {}
  const { symbol: sellSymbol, name: sellName } = useCurrency(sellTokenAddress) || {}

  // create sentry context based on "main" parameters
  useEffect(() => {
    if (windowVisible) {
      const [chainId, connected] = _getSentryChainIdAndConnectionStatus(disconnectedChainId, connectedChainId)
      // setup scope/context/tags
      Sentry.configureScope(function (scope) {
        // setup a context
        scope.setContext('user', {
          user: account,
          wallet: walletName,
          sellToken: `${sellTokenAddress} <${sellSymbol || sellName}>`,
          buyToken: `${buyTokenAddress} <${buySymbol || buyName}>`,
        })
        // also set tags for each session
        scope.setTag('chainId', chainId)
        // connectivity tag
        scope.setTag('walletConnected', connected)
        // set walletName tag
        scope.setTag('wallet', walletName)
      })
    }
  }, [
    // user
    account,
    connectedChainId,
    disconnectedChainId,
    walletName,
    // tokens
    sellSymbol,
    sellName,
    buySymbol,
    buyName,
    sellTokenAddress,
    buyTokenAddress,
    // window visibility check
    windowVisible,
  ])

  return null
}
