export interface ShowResult {
  canFullscreen: boolean
  openPlotFullscreen: () => void
  zoomToPlot: () => void
  /** Leave the post-commit panel, uncovering the wall. */
  resetPhase: () => void
}

/**
 * Show the painter what just landed on the wall. iOS Safari fullscreens nothing
 * but a video, so where fullscreen is unavailable the panel steps aside and the
 * stage frames the plot in place rather than the button doing nothing at all.
 */
export function showResult({ canFullscreen, openPlotFullscreen, zoomToPlot, resetPhase }: ShowResult): void {
  if (canFullscreen) {
    openPlotFullscreen()

    return
  }

  resetPhase()
  zoomToPlot()
}
