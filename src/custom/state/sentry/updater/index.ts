import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'

import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useSwapState } from 'state/swap/hooks'
import { SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { useWalletInfo } from 'hooks/useWalletInfo'

export default function Updater(): null {
  const { account, chainId, walletName, isSupportedWallet } = useWalletInfo()
  const windowVisible = useIsWindowVisible()

  const {
    INPUT: { currencyId: sellTokenAddress },
    OUTPUT: { currencyId: buyTokenAddress },
  } = useSwapState()

  const sellCurrency = useCurrency(sellTokenAddress)
  const buyCurrency = useCurrency(buyTokenAddress)

  // create sentry context based on "main" parameters
  useEffect(() => {
    if (windowVisible) {
      Sentry.setContext('user', {
        userAddress: account || 'DISCONNECTED',
        wallet: walletName,
        network: chainId ? SupportedChainId[chainId] : chainId,
        sellToken: `${sellTokenAddress} <${sellCurrency?.symbol}>`,
        buyToken: `${buyTokenAddress} <${buyCurrency?.symbol}>`,
      })
    }
  }, [
    // user
    account,
    chainId,
    walletName,
    isSupportedWallet,
    // tokens
    sellTokenAddress,
    buyTokenAddress,
    buyCurrency?.symbol,
    sellCurrency?.symbol,
    // window visibility check
    windowVisible,
  ])

  return null
}
