import { Field } from 'legacy/state/types'

import { SellNativeWarningBanner as Pure } from 'common/pure/InlineBanner/banners'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useNavigateOnCurrencySelection } from '../../hooks/useNavigateOnCurrencySelection'
import { useWrappedToken } from '../../hooks/useWrappedToken'

export function SellNativeWarningBanner() {
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()

  return (
    <Pure
      nativeSymbol={native.symbol}
      wrappedNativeSymbol={wrapped.symbol}
      sellWrapped={() => navigateOnCurrencySelection(Field.INPUT, wrapped)}
      wrapNative={() => navigateOnCurrencySelection(Field.OUTPUT, wrapped)}
    />
  )
}
