import { useAtom } from 'jotai'
import { ReactNode, useCallback, useRef } from 'react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatBatchCountdown } from '@cowprotocol/common-utils'

import { useCowBatchValidFrom, waitAndSaveEnabledAtom } from 'modules/trade'

import { WaitAndSaveRow } from '../../pure/WaitAndSaveRow/WaitAndSaveRow.pure'

export function WaitAndSaveRowContainer(): ReactNode {
  const [isEnabled, setEnabled] = useAtom(waitAndSaveEnabledAtom)
  const joinsBatchInRef = useRef<HTMLElement | null>(null)
  const validFrom = useCowBatchValidFrom(true)

  useCountdown({
    targetRef: joinsBatchInRef,
    targetEpochSec: validFrom,
    format: formatBatchCountdown,
  })

  const toggle = useCallback(() => {
    setEnabled(!isEnabled)
  }, [isEnabled, setEnabled])

  return <WaitAndSaveRow isEnabled={isEnabled} toggle={toggle} joinsBatchInRef={joinsBatchInRef} />
}
