import { useAtomValue } from 'jotai'
import { JSX, useCallback, useRef, useState } from 'react'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { useCountdown, useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { formatApproximateBatchCountdown, getServerNowSec } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { SettingsInput, SettingsFeedback } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

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
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const nextBatchValidTo = useAtomValue(canonicalBatchScheduleAtom)?.nextBatchValidTo

  const showWaitForCows = isWaitAndSaveAvailable && isWaitAndSaveEnabled
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const expiryRef = useRef<HTMLElement | null>(null)
  const expiryEpochSec = showWaitForCows && !error ? nextBatchValidTo : undefined
  const [, setExpiryRevision] = useState(0)
  const autoExpiryLabel =
    expiryEpochSec === undefined
      ? undefined
      : formatApproximateBatchCountdown(remainingSecUntil(expiryEpochSec, timeOffsetSec))
  const autoExpiryLabelRef = useRef(autoExpiryLabel)
  autoExpiryLabelRef.current = autoExpiryLabel

  const refreshAutoExpiry = useCallback((remainingSec: number) => {
    const next = formatApproximateBatchCountdown(remainingSec)
    if (next === autoExpiryLabelRef.current) return

    setExpiryRevision((revision) => revision + 1)
  }, [])

  useCountdown({
    targetRef: expiryRef,
    targetEpochSec: expiryEpochSec,
    format: formatApproximateBatchCountdown,
    onRemainingChange: refreshAutoExpiry,
  })

  const minMinutes = deadlineRangeParams.minMinutes
  const maxMinutes = deadlineRangeParams.maxMinutes
  const deadlineRangeMessage = t`Minimum ${minMinutes} min, maximum ${maxMinutes} min.`

  const waitForCowsMessage = showWaitForCows ? (
    expiryEpochSec !== undefined ? (
      <Trans>
        With Wait & save, your swap is automatically set to expire in <span ref={expiryRef} />.
      </Trans>
    ) : (
      <Trans>With Wait & save, your swap is automatically set to expire with the next batch.</Trans>
    )
  ) : null

  const footerSlot = error ? (
    <SettingsFeedback variant="error" message={deadlineRangeMessage} />
  ) : waitForCowsMessage ? (
    <SettingsFeedback variant="info" message={waitForCowsMessage} />
  ) : null

  return (
    <SettingsInput
      id="deadline-input"
      label={t`Swap Expiration`}
      tooltip={
        showWaitForCows
          ? getNonNativeOrderDeadlineTooltip(true)
          : deadlineRangeParams.isEoaEthFlow
            ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol])
            : getNonNativeOrderDeadlineTooltip()
      }
      placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
      value={autoExpiryLabel ?? viewValue}
      unit={autoExpiryLabel === undefined ? t`minutes` : undefined}
      onChange={(e) => parseCustomDeadline(e.target.value)}
      onBlur={onBlur}
      disabled={isDisabled || showWaitForCows}
      error={!!error}
      footerSlot={footerSlot}
    />
  )
}

/** Whole seconds until `targetEpochSec`, rounded the same way as the countdown hook. */
function remainingSecUntil(targetEpochSec: number, timeOffsetSec: number): number {
  const msLeft = (targetEpochSec - getServerNowSec(timeOffsetSec)) * 1000

  return Math.max(0, Math.ceil(msLeft / 1000))
}
