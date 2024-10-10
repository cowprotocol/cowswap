import { InlineBanner } from '@cowprotocol/ui'
import { useIsBundlingSupported, useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useIsNativeIn, useWrappedToken } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function BundleTxWrapBanner() {
  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'
  const wrappedCurrencySymbol = useWrappedToken().symbol || 'WETH'

  const isBundlingSupported = useIsBundlingSupported()
  const isNativeIn = useIsNativeIn()
  const isSmartContractWallet = useIsSmartContractWallet()
  const showWrapBundlingBanner = Boolean(isNativeIn && isSmartContractWallet && isBundlingSupported)

  if (!showWrapBundlingBanner) return null

  return (
    <InlineBanner bannerType="information" iconSize={32}>
      <strong>Token wrapping bundling</strong>
      <p>
        For your convenience, CoW Swap will bundle all the necessary actions for this trade into a single transaction.
        This includes the&nbsp;{nativeCurrencySymbol}&nbsp;wrapping and, if needed,&nbsp;{wrappedCurrencySymbol}
        &nbsp;approval. Even if the trade fails, your wrapping and approval will be done!
      </p>
    </InlineBanner>
  )
}
