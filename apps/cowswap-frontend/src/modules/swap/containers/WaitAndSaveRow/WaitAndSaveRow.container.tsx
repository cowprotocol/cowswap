import { useAtom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatBatchCountdown } from '@cowprotocol/common-utils'

import {
  canonicalBatchCountdownTargetAtom,
  canonicalBatchScheduleQueryAtom,
  isCanonicalBatchScheduleErrorAtom,
  waitAndSaveEnabledAtom,
} from 'modules/trade'

import { WaitAndSaveRow } from '../../pure/WaitAndSaveRow/WaitAndSaveRow.pure'

export function WaitAndSaveRowContainer(): ReactNode {
  const [isEnabled, setEnabled] = useAtom(waitAndSaveEnabledAtom)
  const joinsBatchInRef = useRef<HTMLElement | null>(null)
  const countdownTargetEpochSec = useAtomValue(canonicalBatchCountdownTargetAtom)
  const isScheduleError = useAtomValue(isCanonicalBatchScheduleErrorAtom)
  const { refetch } = useAtomValue(canonicalBatchScheduleQueryAtom)

  useEffect(() => {
    if (isScheduleError && isEnabled) {
      setEnabled(false)
    }
  }, [isEnabled, isScheduleError, setEnabled])

  useCountdown({
    targetRef: joinsBatchInRef,
    targetEpochSec: isScheduleError ? undefined : countdownTargetEpochSec,
    format: formatBatchCountdown,
  })

  const toggle = useCallback(() => {
    setEnabled(!isEnabled)
  }, [isEnabled, setEnabled])

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return (
    <WaitAndSaveRow
      isEnabled={isEnabled}
      toggle={toggle}
      joinsBatchInRef={joinsBatchInRef}
      isScheduleError={isScheduleError}
      onRetry={retry}
    />
  )
}
