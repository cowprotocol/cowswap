import { needsContinuousRender } from './renderWall.utils'
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
