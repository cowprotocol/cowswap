import { useAtomValue } from 'jotai'

import { useInjectedWidgetParams } from '../../injectedWidget'
import { safeAppFeeAtom } from '../state/safeAppFeeAtom'

const SAFE_FEE_TOOLTIP =
  'The [tiered widget fee](https://help.safe.global/en/articles/178530-how-does-the-widget-fee-work-for-native-swaps) incurred here is charged by CoW Protocol for the operation of this widget. The fee is automatically calculated into this quote. Part of the fee will contribute to a license fee that supports the Safe Community. Neither the Safe Ecosystem Foundation nor Safe{Wallet} operate the CoW Swap Widget and/or CoW Swap'

export function useVolumeFeeTooltip() {
  const safeAppFee = useAtomValue(safeAppFeeAtom)
  const widgetParams = useInjectedWidgetParams()

  if (safeAppFee) return SAFE_FEE_TOOLTIP

  return widgetParams.content?.feeTooltipMarkdown
}
