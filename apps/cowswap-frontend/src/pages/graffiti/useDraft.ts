import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { computeDraftBox, type DraftBox, isDraftTooBig } from './draftBox.utils'
import { CANVAS } from './raster.utils'
import { useSyncRef } from './useSyncRef'

import type { Draft, WallRefs } from './wall.types'

export interface DraftState {
  draft: Draft
  setDraft: Dispatch<SetStateAction<Draft>>
  draftBox: DraftBox | null
  boxTooBig: boolean
  /** Snapshot the draft so the next change can be undone. */
  pushHistory: () => void
  /** Take back the latest snapshot, or undefined when there is none. */
  popHistory: () => Draft | undefined
  canUndo: boolean
}

/** Snapshots kept for undo. */
const MAX_HISTORY = 50

/**
 * Multi-stroke draft: strokes accumulate and the whole draft is committed with
 * ONE burn on Paint. `maxBox*` is the backend's per-draw bounding-box limit.
 */
export function useDraft({ draftRef }: WallRefs, maxBoxWidth: number, maxBoxHeight: number): DraftState {
  const [draft, setDraft] = useState<Draft>(new Map())
  const [historySize, setHistorySize] = useState(0)
  const historyRef = useRef<Array<Draft>>([])

  useSyncRef(draftRef, draft)

  const draftBox = useMemo(() => computeDraftBox(draft, CANVAS.w), [draft])
  const boxTooBig = isDraftTooBig(draftBox, maxBoxWidth, maxBoxHeight)

  const pushHistory = useCallback((): void => {
    historyRef.current.push(new Map(draftRef.current))

    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()

    setHistorySize(historyRef.current.length)
  }, [draftRef])

  const popHistory = useCallback((): Draft | undefined => {
    const previous = historyRef.current.pop()

    setHistorySize(historyRef.current.length)

    return previous
  }, [])

  return { draft, setDraft, draftBox, boxTooBig, pushHistory, popHistory, canUndo: historySize > 0 }
}
