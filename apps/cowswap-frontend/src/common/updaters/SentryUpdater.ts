import { useEffect } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { SentryTag } from '@cowprotocol/common-utils'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import * as Sentry from '@sentry/browser'

import { useTradeState } from 'modules/trade/hooks/useTradeState'

export function SentryUpdater(): null {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const windowVisible = useIsWindowVisible()

  const { state } = useTradeState()

  const { inputCurrencyId, outputCurrencyId } = state || {}

  useEffect(() => {
    if (windowVisible) {
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
    chainId,
    walletName,
    // tokens
    inputCurrencyId,
    outputCurrencyId,
    // window visibility check
    windowVisible,
  ])

  return null
}
