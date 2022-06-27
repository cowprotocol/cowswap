import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'

import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useAppSelector } from 'state/hooks'

function _getSentryChainId(appChainId: null | number, chainId: number | undefined) {
  const connectedChainId = chainId
  const appChainIdFull = appChainId ?? undefined

  // app and connected chains the same
  if (appChainIdFull === connectedChainId) {
    return appChainIdFull
    // appChain but no connected chain
  } else if (connectedChainId === undefined) {
    return `${appChainIdFull} - DISCONNECTED`
    // connected chain but doesn't match app chain, use connected chain
  } else {
    return connectedChainId
  }
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
      const chainId = _getSentryChainId(disconnectedChainId, connectedChainId)
      // setup scope/context/tags
      Sentry.configureScope(function (scope) {
        // setup a context
        scope.setContext('user', {
          user: account || 'DISCONNECTED',
          wallet: walletName,
          // chainId,
          sellToken: `${sellTokenAddress} <${sellSymbol || sellName}>`,
          buyToken: `${buyTokenAddress} <${buySymbol || buyName}>`,
        })
        // also set tags for each session
        scope.setTag('chainId', chainId || 'DISCONNECTED')
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
