import type { ReactNode } from 'react'

import { CanvasControls, LoadErrorOverlay, ShowToolsButton } from './CanvasControls.pure'
import { API_BASE } from './graffiti.service'
import { PlotOverlay } from './PlotOverlay.pure'
import { StartOverlay } from './StartOverlay.pure'
import * as styledEl from './wall.styled'

import type { Tool } from './wall.types'
import type { WallModel } from './wallModel.types'

const CURSOR: Record<Tool, string> = { draw: 'crosshair', pan: 'grab', erase: 'cell', text: 'text' }

const ZOOM_IN = 1.25
const ZOOM_OUT = 0.8

export interface WallStageProps {
  wall: WallModel
}

/** The canvas and everything laid over it. */
export function WallStage({ wall }: WallStageProps): ReactNode {
  const { gate, layout, sync, brush, session, paint, viewport, actions, pointer, balance } = wall
  const { wrap, canvas, paintCanvas, overlay } = wall.dom
  const inSession = session.session !== 'start' && !viewport.isFullscreen
  const spent = wall.draft.draft.size + pointer.liveCost
  const balanceLeft = balance === null ? null : Math.max(0, Math.floor(balance - spent))

  return (
    <styledEl.CanvasWrap ref={wrap}>
      {session.session === 'start' && !viewport.isFullscreen && (
        <StartOverlay
          phase={paint.phase}
          phaseError={paint.phaseError}
          onStart={actions.startDrawing}
          onFullscreen={viewport.toggleFullscreen}
        />
      )}
      <PlotOverlay
        bindOverlay={overlay}
        showBalance={gate.connected && inSession}
        balanceLeft={balanceLeft}
        showControls={!session.plotLocked && inSession}
        onRotate={actions.rotatePlot}
        onConfirm={actions.confirmPlot}
      />
      {!viewport.isFullscreen && !layout.toolsVisible && (
        <ShowToolsButton onClick={() => layout.setToolsVisible(true)} />
      )}
      <styledEl.PaintCanvas ref={paintCanvas} />
      <styledEl.Canvas
        ref={canvas}
        $cursor={CURSOR[brush.tool]}
        onPointerDown={pointer.onPointerDown}
        onPointerMove={pointer.onPointerMove}
        onPointerUp={pointer.onPointerUp}
        onPointerCancel={pointer.onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CanvasControls
        hidden={viewport.isFullscreen}
        tool={brush.tool}
        onTool={brush.setTool}
        onZoomIn={() => viewport.zoomBy(ZOOM_IN)}
        onZoomOut={() => viewport.zoomBy(ZOOM_OUT)}
        onFit={viewport.resetView}
        onFrame={viewport.zoomToPlot}
      />
      {sync.loadError && <LoadErrorOverlay error={sync.loadError} apiBase={API_BASE} />}
    </styledEl.CanvasWrap>
  )
}
