import { useEffect } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { SentryTag } from '@cowprotocol/common-utils'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import * as Sentry from '@sentry/browser'

import { useAppSelector } from 'legacy/state/hooks'

import { useTradeState } from 'modules/trade/hooks/useTradeState'

/**
 * _getSentryChainId
 * @param appChainId - redux chainId (not necessarily connected to a wallet)
 * @param connectedChainId - wallet chainId
 * @returns string e.g "DISCONNECTED" | appChainId | connectedChainId
 */
function _getSentryChainIdAndConnectionStatus(appChainId: number | null, connectedChainId: number | undefined): string {
  // match connectedChainId type
  const appChainNormalised = appChainId ?? undefined

  let sentryChainId
  if (connectedChainId) {
    // user is browsing app disconnected from wallet
    sentryChainId = connectedChainId
  } else {
    // connectedChainId takes precedence
    sentryChainId = appChainNormalised
  }

  // if not connected, sentry doesn't accept undefined, use "DISCONNECTED"
  return sentryChainId?.toString() || SentryTag.DISCONNECTED
}

export function SentryUpdater(): null {
  const { account, chainId: connectedChainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  // app chain id maintains state for users disconnected but browsing app
  const disconnectedChainId = useAppSelector((state) => state.application.chainId)
  const windowVisible = useIsWindowVisible()

  const { state } = useTradeState()

  const { inputCurrencyId, outputCurrencyId } = state || {}

  useEffect(() => {
    if (windowVisible) {
      const chainId = _getSentryChainIdAndConnectionStatus(disconnectedChainId, connectedChainId)
      // setup scope/context/tags
      Sentry.configureScope(function (scope) {
        // setup a context
        scope.setContext('user', {
          user: account || SentryTag.DISCONNECTED,
          sellToken: inputCurrencyId,
          buyToken: outputCurrencyId,
        })
        // also set tags for each session
        scope.setTag('chainId', chainId)
        // connectivity tag
        scope.setTag('walletConnected', !!account)
        // set walletName tag
        scope.setTag('wallet', walletName || SentryTag.UNKNOWN)
      })
    }
  }, [
    // user
    account,
    connectedChainId,
    disconnectedChainId,
    walletName,
    // tokens
    inputCurrencyId,
    outputCurrencyId,
    // window visibility check
    windowVisible,
  ])

  return null
}
