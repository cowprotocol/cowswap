import { JSX } from 'react'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { StatefulValue } from '@cowprotocol/types'
import { SettingsInput, SettingsFeedback } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useCustomDeadline } from './hooks/useCustomDeadline'

interface DeadlineSettingsProps {
  deadlineState: StatefulValue<number>
}

export function DeadlineTransactionSettings({ deadlineState }: DeadlineSettingsProps): JSX.Element {
  const { viewValue, parseCustomDeadline, error, isDisabled, onBlur, deadlineRangeParams } =
    useCustomDeadline(deadlineState)
  const nativeCurrency = useNativeCurrency()

  const deadlineRangeMessage = t`Minimum ${deadlineRangeParams.minMinutes} min, maximum ${deadlineRangeParams.maxMinutes} min.`

  const footerSlot = error ? (
    <SettingsFeedback
      variant={error ? 'error' : 'info'}
      message={deadlineRangeMessage}
      tooltip={deadlineRangeMessage}
    />
  ) : null

  return (
    <SettingsInput
      id="deadline-input"
      label={t`Swap deadline`}
      tooltip={
        deadlineRangeParams.isEoaEthFlow
          ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol])
          : getNonNativeOrderDeadlineTooltip()
      }
      placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
      value={viewValue}
      unit={t`minutes`}
      onChange={(e) => parseCustomDeadline(e.target.value)}
      onBlur={onBlur}
      disabled={isDisabled}
      error={!!error}
      footerSlot={footerSlot}
    />
  )
}
