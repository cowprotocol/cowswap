import { useAtom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatApproximateBatchCountdown, formatBatchCountdown } from '@cowprotocol/common-utils'

import { cowBatchValidFromAtom, waitAndSaveEnabledAtom } from 'modules/trade'

import { WaitAndSaveRow } from '../../pure/WaitAndSaveRow/WaitAndSaveRow.pure'

export function WaitAndSaveRowContainer(): ReactNode {
  const [isEnabled, setEnabled] = useAtom(waitAndSaveEnabledAtom)
  const joinsBatchInRef = useRef<HTMLElement | null>(null)
  const remainingSecRef = useRef<number | undefined>(undefined)
  const validFrom = useAtomValue(cowBatchValidFromAtom)
  const format = isEnabled ? formatBatchCountdown : formatApproximateBatchCountdown

  useCountdown({
    targetRef: joinsBatchInRef,
    targetEpochSec: validFrom,
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

  const onRetry = useCallback(() => undefined, [])

  return (
    <WaitAndSaveRow
      isEnabled={isEnabled}
      toggle={toggle}
      joinsBatchInRef={joinsBatchInRef}
      hasError={false}
      onRetry={onRetry}
    />
  )
}
