import { InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useIsTxBundlingSupported, useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useIsHooksTradeType, useIsNativeIn, useWrappedToken } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BundleTxWrapBanner() {
  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'
  const wrappedCurrencySymbol = useWrappedToken().symbol || 'WETH'

  const isHooksStore = useIsHooksTradeType()
  const isBundlingSupported = useIsTxBundlingSupported()
  const isNativeIn = useIsNativeIn()
  const isSmartContractWallet = useIsSmartContractWallet()
  const showWrapBundlingBanner = Boolean(isNativeIn && isSmartContractWallet && isBundlingSupported) && !isHooksStore

  if (!showWrapBundlingBanner) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Info} iconSize={32}>
      <strong>Token wrapping bundling</strong>
      <p>
        For your convenience, CoW Swap will bundle all the necessary actions for this trade into a single transaction.
        This includes the&nbsp;{nativeCurrencySymbol}&nbsp;wrapping and, if needed,&nbsp;{wrappedCurrencySymbol}
        &nbsp;approval. Even if the trade fails, your wrapping and approval will be done!
      </p>
    </InlineBanner>
  )
}
