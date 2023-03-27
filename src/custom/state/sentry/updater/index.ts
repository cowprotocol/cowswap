import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'

import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { useAppSelector } from 'state/hooks'
import { SentryTag } from 'utils/logging'

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

export default function Updater(): null {
  const { account, chainId: connectedChainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  // app chain id maintains state for users disconnected but browsing app
  const disconnectedChainId = useAppSelector((state) => state.application.chainId)
  const windowVisible = useIsWindowVisible()

  const {
    currencies: { INPUT: sellCurrency, OUTPUT: buyCurrency },
    currenciesIds: { INPUT: sellCurrencyId, OUTPUT: buyCurrencyId },
  } = useDerivedSwapInfo()

  const { symbol: buySymbol, name: buyName } = buyCurrency || {}
  const { symbol: sellSymbol, name: sellName } = sellCurrency || {}

  useEffect(() => {
    if (windowVisible) {
      const chainId = _getSentryChainIdAndConnectionStatus(disconnectedChainId, connectedChainId)
      // setup scope/context/tags
      Sentry.configureScope(function (scope) {
        // setup a context
        scope.setContext('user', {
          user: account || SentryTag.DISCONNECTED,
          sellToken: `${sellCurrencyId} <${sellSymbol || sellName}>`,
          buyToken: `${buyCurrencyId} <${buySymbol || buyName}>`,
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
    sellSymbol,
    sellName,
    buySymbol,
    buyName,
    sellCurrencyId,
    buyCurrencyId,
    // window visibility check
    windowVisible,
  ])

  return null
}
