import { useMemo } from 'react'

import type { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

export function useConfirmButtonText(
  disableConfirm: boolean,
  inputCurrencyInfo: CurrencyPreviewInfo,
  confirmText: string,
): string {
  return useMemo(() => {
    if (disableConfirm) {
      const { amount } = inputCurrencyInfo
      return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
    }

    return confirmText
  }, [confirmText, disableConfirm, inputCurrencyInfo])
}
