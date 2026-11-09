import {
  type CanvasPointerEvent,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  type PointerContext,
} from './pointerHandlers.utils'
import { CANVAS } from './raster.utils'
import { createWallRefs } from './useWallRefs'

import type { Draft } from './wall.types'

const FRAME = { w: 256, h: 128 }

interface Harness {
  ctx: PointerContext
  draft: () => Draft
  setPlot: jest.Mock
  pushHistory: jest.Mock
  resetPhase: jest.Mock
  liveCost: () => number
}

function cellsOf(draft: Draft): Array<{ x: number; y: number }> {
  return [...draft.keys()].map((idx) => ({ x: idx % CANVAS.w, y: Math.floor(idx / CANVAS.w) }))
}

/** A canvas at scale 10 with no offset: screen px / 10 = wall cells. */
function harness(overrides: Partial<PointerContext> = {}, plotLocked = true): Harness {
  const refs = createWallRefs()
  let draft: Draft = new Map()
  let liveCost = 0
  const setPlot = jest.fn()
  const pushHistory = jest.fn()
  const resetPhase = jest.fn()

  refs.canvasElRef.current = {
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    clientWidth: 800,
    clientHeight: 600,
  } as unknown as HTMLCanvasElement
  refs.viewRef.current = { scale: 10, offsetX: 0, offsetY: 0 }
  refs.plotRef.current = { x: 0, y: 0 }
  refs.plotLockedRef.current = plotLocked

  const ctx: PointerContext = {
    refs,
    tool: 'draw',
    busy: false,
    loaded: true,
    brushSize: 6,
    color: '#ff0000',
    label: '',
    plotDims: (plot) => (plot?.vertical ? [FRAME.h, FRAME.w] : [FRAME.w, FRAME.h]),
    wallColorAt: () => 0,
    pushHistory,
    setDraft: (update) => {
      draft = typeof update === 'function' ? update(draft) : update
    },
    setPlot,
    setLiveCost: (cost) => {
      liveCost = cost
    },
    resetPhase,
    ...overrides,
  }

  return { ctx, draft: () => draft, setPlot, pushHistory, resetPhase, liveCost: () => liveCost }
}

function pointerEvent(
  x: number,
  y: number,
  extra: Partial<{ pointerId: number; button: number; movementX: number }> = {},
): CanvasPointerEvent {
  return {
    pointerId: 1,
    button: 0,
    movementX: 0,
    movementY: 0,
    clientX: x,
    clientY: y,
    currentTarget: { setPointerCapture: jest.fn(), releasePointerCapture: jest.fn() },
    ...extra,
  } as unknown as CanvasPointerEvent
}

function stroke(h: Harness, from: [number, number], to: [number, number], steps = 12): void {
  handlePointerDown(pointerEvent(...from), h.ctx)

  for (let i = 1; i <= steps; i++) {
    const x = from[0] + ((to[0] - from[0]) * i) / steps
    const y = from[1] + ((to[1] - from[1]) * i) / steps

    handlePointerMove(pointerEvent(x, y), h.ctx)
  }

  handlePointerUp(pointerEvent(...to), h.ctx)
}

describe('drawing a stroke', () => {
  it('drafts cells, in the chosen colour, inside the frame', () => {
    const h = harness()

    stroke(h, [100, 100], [300, 100])

    const cells = cellsOf(h.draft())

    expect(cells.length).toBeGreaterThan(0)
    expect(cells.every((c) => c.x >= 0 && c.x < FRAME.w && c.y >= 0 && c.y < FRAME.h)).toBe(true)
    expect([...h.draft().values()].every((c) => c === 0xff0000)).toBe(true)
    expect(h.pushHistory).toHaveBeenCalledTimes(1)
  })

  it('shows a live cost while drawing and clears it on release', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100), h.ctx)
    handlePointerMove(pointerEvent(200, 100), h.ctx)
    expect(h.liveCost()).toBeGreaterThan(0)

    handlePointerUp(pointerEvent(200, 100), h.ctx)
    expect(h.liveCost()).toBe(0)
  })

  it('clears the previous paint status when a new stroke starts', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100), h.ctx)

    expect(h.resetPhase).toHaveBeenCalled()
  })

  it('drops cells outside the frame', () => {
    const h = harness()

    // Entirely below the 128-cell-high frame.
    stroke(h, [100, 2000], [300, 2000])

    expect(h.draft().size).toBe(0)
    expect(h.pushHistory).not.toHaveBeenCalled()
  })

  it('does not draft cells that would not change the wall, since they are free', () => {
    const h = harness({ wallColorAt: () => 0xff0000 })

    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBe(0)
  })

  it('erases with black', () => {
    const h = harness({ tool: 'erase', wallColorAt: () => 0xff0000 })

    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBeGreaterThan(0)
    expect([...h.draft().values()].every((c) => c === 0)).toBe(true)
  })

  it('ignores a draw while busy', () => {
    const h = harness({ busy: true })

    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBe(0)
  })

  it('ignores a draw before the wall has loaded', () => {
    const h = harness({ loaded: false })

    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBe(0)
  })

  it('does not draw until the frame is locked', () => {
    const h = harness({ tool: 'draw' }, false)

    // Away from the frame so it is not interpreted as grabbing it.
    stroke(h, [3000, 3000], [3200, 3000])

    expect(h.draft().size).toBe(0)
  })

  it('only the primary button draws', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100, { button: 2 }), h.ctx)

    expect(h.ctx.refs.drawingRef.current).toBe(false)
  })
})

describe('panning', () => {
  it('pans with the pan tool instead of drawing', () => {
    const h = harness({ tool: 'pan' })

    handlePointerDown(pointerEvent(100, 100), h.ctx)
    handlePointerMove(pointerEvent(120, 130, { movementX: 20 }), h.ctx)

    expect(h.ctx.refs.viewRef.current.offsetX).toBe(20)
    expect(h.ctx.refs.drawingRef.current).toBe(false)

    handlePointerUp(pointerEvent(120, 130), h.ctx)
    expect(h.ctx.refs.panningRef.current).toBe(false)
  })

  it('pans with the middle mouse button', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100, { button: 1 }), h.ctx)

    expect(h.ctx.refs.panningRef.current).toBe(true)
  })
})

describe('moving the frame', () => {
  it('grabs an unlocked frame and drags it, clamped inside the wall', () => {
    const h = harness({}, false)

    handlePointerDown(pointerEvent(100, 100), h.ctx)
    expect(h.ctx.refs.movingPlotRef.current).not.toBeNull()

    handlePointerMove(pointerEvent(150, 130), h.ctx)
    expect(h.setPlot).toHaveBeenCalledWith({ x: 5, y: 3, vertical: undefined })

    handlePointerMove(pointerEvent(-5000, -5000), h.ctx)
    expect(h.setPlot).toHaveBeenLastCalledWith({ x: 0, y: 0, vertical: undefined })

    handlePointerUp(pointerEvent(150, 130), h.ctx)
    expect(h.ctx.refs.movingPlotRef.current).toBeNull()
  })

  it('keeps a portrait frame portrait while dragging', () => {
    const h = harness({}, false)

    h.ctx.refs.plotRef.current = { x: 0, y: 0, vertical: true }
    handlePointerDown(pointerEvent(100, 100), h.ctx)
    handlePointerMove(pointerEvent(110, 110), h.ctx)

    expect(h.setPlot).toHaveBeenCalledWith(expect.objectContaining({ vertical: true }))
  })

  it('cannot grab a locked frame', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100), h.ctx)

    expect(h.ctx.refs.movingPlotRef.current).toBeNull()
  })
})

describe('multi-touch', () => {
  function twoFingers(h: Harness): void {
    handlePointerDown(pointerEvent(100, 100, { pointerId: 1 }), h.ctx)
    handlePointerDown(pointerEvent(200, 100, { pointerId: 2 }), h.ctx)
  }

  it('a second finger cancels the stroke instead of drawing', () => {
    const h = harness()

    handlePointerDown(pointerEvent(100, 100, { pointerId: 1 }), h.ctx)
    handlePointerMove(pointerEvent(140, 100, { pointerId: 1 }), h.ctx)
    expect(h.ctx.refs.drawingRef.current).toBe(true)

    handlePointerDown(pointerEvent(300, 100, { pointerId: 2 }), h.ctx)

    expect(h.ctx.refs.drawingRef.current).toBe(false)
    expect(h.liveCost()).toBe(0)
  })

  it('ignores moves while two fingers are down; the pinch gesture owns them', () => {
    const h = harness()

    twoFingers(h)
    handlePointerMove(pointerEvent(60, 100, { pointerId: 1 }), h.ctx)
    handlePointerMove(pointerEvent(240, 100, { pointerId: 2 }), h.ctx)

    expect(h.draft().size).toBe(0)
    expect(h.ctx.refs.viewRef.current).toEqual({ scale: 10, offsetX: 0, offsetY: 0 })
  })

  it('ignores input while the gesture library reports a pinch', () => {
    const h = harness()

    h.ctx.refs.pinchActiveRef.current = true
    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBe(0)
  })

  it('does not start drawing from the finger left after a pinch', () => {
    const h = harness()

    twoFingers(h)
    handlePointerUp(pointerEvent(100, 100, { pointerId: 1 }), h.ctx)
    handlePointerMove(pointerEvent(220, 100, { pointerId: 2 }), h.ctx)
    handlePointerUp(pointerEvent(220, 100, { pointerId: 2 }), h.ctx)

    expect(h.draft().size).toBe(0)
    expect(h.ctx.refs.activePointersRef.current.size).toBe(0)
  })

  it('draws again normally once all fingers have lifted', () => {
    const h = harness()

    twoFingers(h)
    handlePointerUp(pointerEvent(100, 100, { pointerId: 1 }), h.ctx)
    handlePointerUp(pointerEvent(200, 100, { pointerId: 2 }), h.ctx)
    stroke(h, [100, 100], [300, 100])

    expect(h.draft().size).toBeGreaterThan(0)
  })
})
