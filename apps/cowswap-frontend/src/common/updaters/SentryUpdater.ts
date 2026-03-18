import { useEffect } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { SentryTag } from '@cowprotocol/common-utils'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import * as Sentry from '@sentry/browser'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useTradeState } from 'modules/trade'

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
        /**
         * @deprecated because it can't be used for filtering
         */
        scope.setContext('user', {
          user: account || SentryTag.DISCONNECTED,
          sellToken: inputCurrencyId,
          buyToken: outputCurrencyId,
        })
        if (account) scope.setTag('walletAddress', account)
        if (inputCurrencyId) scope.setTag('sellToken', inputCurrencyId)
        if (outputCurrencyId) scope.setTag('buyToken', outputCurrencyId)
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
