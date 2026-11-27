import { act, renderHook } from '@testing-library/react'

import { usePlot } from './usePlot'
import { useWallRefs } from './useWallRefs'

function renderPlot(): ReturnType<typeof renderHook<ReturnType<typeof usePlot>, unknown>> {
  return renderHook(() => usePlot(useWallRefs(), null, true))
}

describe('usePlot', () => {
  it('places the frame once the wall has loaded', () => {
    const { result } = renderPlot()

    expect(result.current.plot).not.toBeNull()
  })

  it('moves the frame to another free spot on request', () => {
    const { result } = renderPlot()
    const before = result.current.plot

    act(() => result.current.placeAtFreeSpot())

    const after = result.current.plot

    expect(after).not.toBeNull()
    expect(after).not.toEqual(before)
  })

  it('keeps the orientation when moving the frame', () => {
    const { result } = renderPlot()

    act(() => result.current.setPlot((p) => (p ? { ...p, vertical: true } : p)))
    act(() => result.current.placeAtFreeSpot())

    expect(result.current.plot?.vertical).toBe(true)
  })
})
