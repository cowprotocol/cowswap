import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { t } from '@lingui/core/macro'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { safeAppFeeAtom } from '../state/safeAppFeeAtom'

export interface VolumeFeeTooltip {
  content: string | undefined
  label: string
}

export function useVolumeFeeTooltip(): VolumeFeeTooltip {
  const safeAppFee = useAtomValue(safeAppFeeAtom)
  const widgetParams = useInjectedWidgetParams()

  return useMemo(() => {
    if (safeAppFee)
      return {
        content: t`The Safe App License Fee incurred here is charged by the Safe Foundation for the display of the app within their Safe Store. The fee is automatically calculated in this quote. Part of the fees will contribute to the CoW DAO treasury that supports the CoW Community.`,
        label: t`Safe App License Fee`,
      }

    return {
      content: widgetParams.content?.feeTooltipMarkdown,
      label: widgetParams.content?.feeLabel || t`Partner fee`,
    }
  }, [safeAppFee, widgetParams])
}
