import { useLingui } from '@lingui/react/macro'

export type ConfirmButtonLabelVariant = 'swap' | 'approve'

export function useGetConfirmButtonLabel(variant: ConfirmButtonLabelVariant, isBridging: boolean): string {
  const { t } = useLingui()

  if (variant === 'approve') {
    return isBridging ? t`Approve, Swap & Bridge` : t`Approve and Swap`
  }

  return isBridging ? t`Confirm Swap and Bridge` : t`Confirm Swap`
}
