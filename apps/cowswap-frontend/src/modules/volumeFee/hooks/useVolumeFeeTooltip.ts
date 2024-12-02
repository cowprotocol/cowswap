import { useAtomValue } from 'jotai'

import { useInjectedWidgetParams } from '../../injectedWidget'
import { safeAppFeeAtom } from '../state/safeAppFeeAtom'

const SAFE_FEE_TOOLTIP =
  'The Safe App License Fee incurred here is charged by the Safe Foundation for the display of the app within their Safe Store. The fee is automatically calculated in this quote. Part of the fees will contribute to the CoW DAO treasury that supports the CoW Community.'

export function useVolumeFeeTooltip() {
  const safeAppFee = useAtomValue(safeAppFeeAtom)
  const widgetParams = useInjectedWidgetParams()

  if (safeAppFee) return SAFE_FEE_TOOLTIP

  return widgetParams.content?.feeTooltipMarkdown
}
