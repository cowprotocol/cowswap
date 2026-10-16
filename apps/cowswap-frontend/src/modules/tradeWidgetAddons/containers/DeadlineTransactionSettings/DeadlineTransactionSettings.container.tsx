import { JSX, useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { useCountdown } from '@cowprotocol/common-hooks'
import { formatBatchCountdown } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { SettingsInput, SettingsFeedback } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useWaitAndSaveValidFrom } from 'modules/appData'

import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useCustomDeadline } from './hooks/useCustomDeadline'

interface DeadlineSettingsProps {
  deadlineState: StatefulValue<number>
}

export function DeadlineTransactionSettings({ deadlineState }: DeadlineSettingsProps): JSX.Element {
  const { viewValue, parseCustomDeadline, error, isDisabled, onBlur, deadlineRangeParams } =
    useCustomDeadline(deadlineState)
  const [deadline] = deadlineState
  const nativeCurrency = useNativeCurrency()
  const validFrom = useWaitAndSaveValidFrom()
  const showWaitForCows = validFrom !== undefined

  const batchWaitRef = useRef<HTMLElement | null>(null)
  const totalExpiryRef = useRef<HTMLElement | null>(null)
  const waitRemainingSecRef = useRef<number | undefined>(undefined)
  const [isExpirationShorterThanWait, setIsExpirationShorterThanWait] = useState(false)

  const totalExpiryEpochSec = validFrom !== undefined ? validFrom + deadline : undefined

  const syncWarning = useCallback((remainingSec: number | undefined, deadlineSec: number) => {
    const next = remainingSec !== undefined && deadlineSec > 0 && deadlineSec < remainingSec
    setIsExpirationShorterThanWait((prev) => (prev === next ? prev : next))
  }, [])

  const onBatchWaitRemainingChange = useCallback(
    (remainingSec: number) => {
      waitRemainingSecRef.current = remainingSec
      syncWarning(remainingSec, deadline)
    },
    [deadline, syncWarning],
  )

  useEffect(() => {
    syncWarning(waitRemainingSecRef.current, deadline)
  }, [deadline, syncWarning])

  useCountdown({
    targetRef: batchWaitRef,
    targetEpochSec: validFrom,
    format: formatBatchCountdown,
    onRemainingChange: onBatchWaitRemainingChange,
  })

  useCountdown({
    targetRef: totalExpiryRef,
    targetEpochSec: totalExpiryEpochSec,
    format: formatBatchCountdown,
  })

  const minMinutes = deadlineRangeParams.minMinutes
  const maxMinutes = deadlineRangeParams.maxMinutes
  const deadlineRangeMessage = t`Minimum ${minMinutes} min, maximum ${maxMinutes} min.`

  const waitForCowsMessage = showWaitForCows ? (
    <Trans>
      With Wait for CoWs, expiration starts after the next batch (~
      <span ref={batchWaitRef} />
      ). Total time until expiry ≈ <span ref={totalExpiryRef} />.
    </Trans>
  ) : null

  const footerSlot = error ? (
    <SettingsFeedback variant="error" message={deadlineRangeMessage} />
  ) : waitForCowsMessage ? (
    <SettingsFeedback variant={isExpirationShorterThanWait ? 'warning' : 'info'} message={waitForCowsMessage} />
  ) : null

  return (
    <SettingsInput
      id="deadline-input"
      label={t`Swap Expiration`}
      tooltip={
        deadlineRangeParams.isEoaEthFlow
          ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol])
          : getNonNativeOrderDeadlineTooltip(showWaitForCows)
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
