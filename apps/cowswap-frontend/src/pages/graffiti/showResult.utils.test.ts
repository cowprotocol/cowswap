import { showResult } from './showResult.utils'

describe('showResult', () => {
  function target(canFullscreen: boolean): {
    canFullscreen: boolean
    openPlotFullscreen: jest.Mock
    zoomToPlot: jest.Mock
    resetPhase: jest.Mock
  } {
    return { canFullscreen, openPlotFullscreen: jest.fn(), zoomToPlot: jest.fn(), resetPhase: jest.fn() }
  }

  it('opens the plot fullscreen where the browser allows it', () => {
    const viewport = target(true)

    showResult(viewport)

    expect(viewport.openPlotFullscreen).toHaveBeenCalled()
    expect(viewport.zoomToPlot).not.toHaveBeenCalled()
    expect(viewport.resetPhase).not.toHaveBeenCalled()
  })

  // iOS Safari fullscreens nothing but a video, and the button did nothing there.
  it('uncovers the wall and frames the plot where it does not', () => {
    const viewport = target(false)

    showResult(viewport)

    expect(viewport.openPlotFullscreen).not.toHaveBeenCalled()
    expect(viewport.resetPhase).toHaveBeenCalled()
    expect(viewport.zoomToPlot).toHaveBeenCalled()
  })
})
