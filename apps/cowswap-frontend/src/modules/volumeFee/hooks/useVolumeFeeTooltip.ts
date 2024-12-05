import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { safeAppFeeAtom } from '../state/safeAppFeeAtom'

const SAFE_FEE_TOOLTIP_CONTENT =
  'The Safe App License Fee incurred here is charged by the Safe Foundation for the display of the app within their Safe Store. The fee is automatically calculated in this quote. Part of the fees will contribute to the CoW DAO treasury that supports the CoW Community.'
const SAFE_FEE_LABEL = 'Safe App License Fee'

const SAFE_TOOLTIP = {
  content: SAFE_FEE_TOOLTIP_CONTENT,
  label: SAFE_FEE_LABEL,
}

export interface VolumeFeeTooltip {
  content: string | undefined
  label: string
}

export function useVolumeFeeTooltip(): VolumeFeeTooltip {
  const safeAppFee = useAtomValue(safeAppFeeAtom)
  const widgetParams = useInjectedWidgetParams()

  return useMemo(() => {
    if (safeAppFee) return SAFE_TOOLTIP

    return {
      content: widgetParams.content?.feeTooltipMarkdown,
      label: widgetParams.content?.feeLabel || 'Total fee',
    }
  }, [safeAppFee, widgetParams])
}
