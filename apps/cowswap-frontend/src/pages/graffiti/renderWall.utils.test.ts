import { devicePixelRatio, needsContinuousRender, renderWall } from './renderWall.utils'
import { createWallRefs } from './useWallRefs'

import type { WallSnapshot } from './wall.types'

/** A placed, unlocked frame mid-session: the one state that animates. */
function snapshot(overrides: Partial<WallSnapshot> = {}): WallSnapshot {
  return {
    ...createWallRefs().snapshotRef.current,
    session: 'place',
    plot: { x: 0, y: 0 },
    plotLocked: false,
    tool: 'draw',
    fullscreen: false,
    ...overrides,
  }
}

describe('needsContinuousRender', () => {
  it('animates while the frame is placeable, because its outline marches', () => {
    expect(needsContinuousRender(snapshot())).toBe(true)
  })

  it('sleeps once the frame is locked', () => {
    expect(needsContinuousRender(snapshot({ plotLocked: true }))).toBe(false)
  })

  it('sleeps on the landing screen, before a session starts', () => {
    expect(needsContinuousRender(snapshot({ session: 'start' }))).toBe(false)
  })

  it('sleeps when no frame has been placed yet', () => {
    expect(needsContinuousRender(snapshot({ plot: null }))).toBe(false)
  })

  it('sleeps in fullscreen, which hides the frame', () => {
    expect(needsContinuousRender(snapshot({ fullscreen: true }))).toBe(false)
  })

  it('sleeps while panning, which hides the frame', () => {
    expect(needsContinuousRender(snapshot({ tool: 'pan' }))).toBe(false)
  })

  it('sleeps in the common case: drawing inside a locked frame', () => {
    expect(needsContinuousRender(snapshot({ session: 'paint', plotLocked: true }))).toBe(false)
  })
})

describe('devicePixelRatio', () => {
  const original = window.devicePixelRatio

  afterEach(() => {
    Object.defineProperty(window, 'devicePixelRatio', { value: original, configurable: true })
  })

  function withDpr(value: number | undefined): void {
    Object.defineProperty(window, 'devicePixelRatio', { value, configurable: true })
  }

  it('follows the display up to the cap', () => {
    withDpr(2)
    expect(devicePixelRatio()).toBe(2)

    withDpr(1.5)
    expect(devicePixelRatio()).toBe(1.5)
  })

  it('caps at 2, because every frame redraws the whole wall', () => {
    withDpr(3)
    expect(devicePixelRatio()).toBe(2)
  })

  it('falls back to 1 where the browser reports nothing', () => {
    withDpr(undefined)
    expect(devicePixelRatio()).toBe(1)
  })
})

describe('renderWall backing store', () => {
  const original = window.devicePixelRatio

  beforeEach(() => {
    // jsdom cannot provide a 2D context; returning null is how renderWall already
    // handles that, and it keeps the "not implemented" noise out of the run.
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(window, 'devicePixelRatio', { value: original, configurable: true })
  })

  /** renderWall bails right after sizing the canvas, which is what these assert. */
  function sizedRefs(clientWidth: number, clientHeight: number): ReturnType<typeof createWallRefs> {
    const refs = createWallRefs()

    refs.canvasElRef.current = document.createElement('canvas')
    refs.paintCanvasElRef.current = document.createElement('canvas')
    refs.wrapElRef.current = { clientWidth, clientHeight } as HTMLDivElement
    refs.offscreenRef.current = document.createElement('canvas')

    return refs
  }

  it('allocates device pixels, not CSS pixels', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })

    const refs = sizedRefs(800, 600)

    renderWall(refs)

    expect(refs.canvasElRef.current?.width).toBe(1600)
    expect(refs.canvasElRef.current?.height).toBe(1200)
    // the paint layer is stacked under the chrome layer and must match it
    expect(refs.paintCanvasElRef.current?.width).toBe(1600)
    expect(refs.paintCanvasElRef.current?.height).toBe(1200)
  })

  it('reallocates when the ratio changes', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })

    const refs = sizedRefs(800, 600)

    renderWall(refs)
    expect(refs.canvasElRef.current?.width).toBe(800)

    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
    renderWall(refs)
    expect(refs.canvasElRef.current?.width).toBe(1600)
  })
})
