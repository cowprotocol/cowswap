import { useAtom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatApproximateBatchCountdown, formatBatchCountdown } from '@cowprotocol/common-utils'

import {
  canonicalBatchNextBatchAtom,
  canonicalBatchScheduleQueryAtom,
  isCanonicalBatchScheduleErrorAtom,
  waitAndSaveEnabledAtom,
} from 'modules/trade'

import { useWaitAndSaveSaveAmount } from '../../hooks/useWaitAndSaveSaveAmount'
import { WaitAndSaveRow } from '../../pure/WaitAndSaveRow/WaitAndSaveRow.pure'

export function WaitAndSaveRowContainer(): ReactNode {
  const [isEnabled, setEnabled] = useAtom(waitAndSaveEnabledAtom)
  const joinsBatchInRef = useRef<HTMLElement | null>(null)
  const remainingSecRef = useRef<number | undefined>(undefined)
  const countdownTargetEpochSec = useAtomValue(canonicalBatchNextBatchAtom)
  const hasError = useAtomValue(isCanonicalBatchScheduleErrorAtom)
  const { refetch, isFetching } = useAtomValue(canonicalBatchScheduleQueryAtom)
  const isLoading = !hasError && countdownTargetEpochSec === undefined
  const format = isEnabled ? formatBatchCountdown : formatApproximateBatchCountdown

  useEffect(() => {
    if (hasError && isEnabled) {
      setEnabled(false)
    }
  }, [isEnabled, hasError, setEnabled])

  useCountdown({
    targetRef: joinsBatchInRef,
    targetEpochSec: hasError || isLoading ? undefined : countdownTargetEpochSec,
    format,
    onRemainingChange: (remainingSec) => {
      remainingSecRef.current = remainingSec
    },
  })

  useEffect(() => {
    const element = joinsBatchInRef.current
    const remainingSec = remainingSecRef.current

    if (!element || remainingSec === undefined) {
      return
    }

    element.textContent = format(remainingSec)
  }, [format])

  const toggle = useCallback(() => {
    setEnabled(!isEnabled)
  }, [isEnabled, setEnabled])

  const onRetry = useCallback(() => {
    void refetch()
  }, [refetch])
  const saveAmount = useWaitAndSaveSaveAmount()

  return (
    <WaitAndSaveRow
      isEnabled={isEnabled}
      toggle={toggle}
      joinsBatchInRef={joinsBatchInRef}
      hasError={hasError}
      isLoading={isLoading}
      isFetching={isFetching}
      onRetry={onRetry}
      saveAmount={saveAmount}
    />
  )
}
