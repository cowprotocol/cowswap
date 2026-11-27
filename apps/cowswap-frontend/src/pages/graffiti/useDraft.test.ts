import { act, renderHook } from '@testing-library/react'

import { useDraft } from './useDraft'
import { useWallRefs } from './useWallRefs'

function renderDraft(): ReturnType<typeof renderHook<ReturnType<typeof useDraft>, unknown>> {
  return renderHook(() => useDraft(useWallRefs(), 256, 128))
}

describe('useDraft', () => {
  it('undoes the latest snapshot', () => {
    const { result } = renderDraft()

    act(() => result.current.pushHistory())

    expect(result.current.canUndo).toBe(true)
    expect(result.current.popHistory()).toBeInstanceOf(Map)
  })

  it('forgets every snapshot when the history is cleared', () => {
    const { result } = renderDraft()

    act(() => {
      result.current.pushHistory()
      result.current.pushHistory()
    })
    act(() => result.current.clearHistory())

    expect(result.current.canUndo).toBe(false)
    expect(result.current.popHistory()).toBeUndefined()
  })
})
