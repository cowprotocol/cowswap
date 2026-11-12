// Graffiti Wall — collaborative pixel canvas where every painted cell burns
// one PIXEL (SPL) token. See docs/graffiti/SPEC.md.
//
// The page only composes: each concern lives in its own hook (wallet gate, wall
// data sync, drafting, frame/session state, viewport, pointer input, paint flow)
// and the view is a tree of small pure components. The canvas layer reads React
// state through one snapshot (see wall.types.ts), never through the hooks.

import { useMemo, type ReactNode } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { useFullBleedPage } from 'modules/application'

import { NetworkGate } from './NetworkGate.pure'
import { useBrush } from './useBrush'
import { useCanvasGestures } from './useCanvasGestures'
import { useDraft } from './useDraft'
import { useNarrowLayout } from './useNarrowLayout'
import { usePlot } from './usePlot'
import { usePointerInput } from './usePointerInput'
import { useSessionActions } from './useSessionActions'
import { useSessionState } from './useSessionState'
import { useSolanaGate } from './useSolanaGate'
import { useTokenBalance } from './useTokenBalance'
import { useViewport } from './useViewport'
import { useWallPaint } from './useWallPaint'
import { useWallPixels } from './useWallPixels'
import { useWallDomBindings, useWallRefs } from './useWallRefs'
import { useWallRenderLoop } from './useWallRenderLoop'
import { useWallSnapshot } from './useWallSnapshot'
import { useWallSync } from './useWallSync'
import { WallScreen } from './WallScreen.pure'

import type { WallSnapshot } from './wall.types'

const BALANCE_POLL_MS = 15_000

export default function GraffitiPage(): ReactNode {
  useFullBleedPage()
  useBodyScrollbarLocker(true)

  const gate = useSolanaGate()
  const layout = useNarrowLayout()
  const refs = useWallRefs()
  const dom = useWallDomBindings(refs)

  const brush = useBrush()
  const { wallColorAt, applyCells } = useWallPixels(refs)
  const sync = useWallSync(refs, applyCells)
  const mint = sync.info?.mint

  const plot = usePlot(refs, sync.info, sync.loaded)
  const draft = useDraft(refs, plot.maxBoxWidth, plot.maxBoxHeight)
  const session = useSessionState(draft.draft)
  const paint = useWallPaint({
    solanaAccount: gate.solanaAccount,
    connected: gate.connected,
    info: sync.info,
    draft,
    session,
    markSeq: sync.markSeq,
  })

  // Re-read on a finished commit rather than waiting out the poll: the panel
  // that lands there quotes what is left.
  const balance = useTokenBalance(gate.solanaAccount, mint, paint.phase === 'done', BALANCE_POLL_MS)

  const viewport = useViewport(refs, {
    canvasEl: dom.canvasEl,
    plotDims: plot.plotDims,
    // Not on the landing screen: framing the auto-placed plot there would
    // override the view that fills the stage. startDrawing frames it instead.
    plotReady: plot.plot !== null && session.session !== 'start',
    plotLocked: session.plotLocked,
  })
  const pointer = usePointerInput(refs, {
    wallColorAt,
    pushHistory: draft.pushHistory,
    setDraft: draft.setDraft,
    setPlot: plot.setPlot,
    resetPhase: paint.resetPhase,
  })

  useCanvasGestures(refs, dom.canvasEl, pointer.cancelInteraction)

  const actions = useSessionActions(refs, {
    ...draft,
    ...session,
    setPlot: plot.setPlot,
    plotDims: plot.plotDims,
    zoomToPlot: viewport.zoomToPlot,
    resetPhase: paint.resetPhase,
  })

  const snapshot = useMemo<WallSnapshot>(
    () => ({
      loaded: sync.loaded,
      busy: paint.busy,
      session: session.session,
      fullscreen: viewport.isFullscreen,
      tool: brush.tool,
      brushSize: brush.brushSize,
      color: brush.paintColor,
      label: brush.label,
      draft: draft.draft,
      plot: plot.plot,
      plotDims: plot.plotDims,
      plotLocked: session.plotLocked,
      plotConfirmed: session.plotConfirmed,
    }),
    [
      brush.brushSize,
      brush.label,
      brush.paintColor,
      brush.tool,
      draft.draft,
      paint.busy,
      plot.plot,
      plot.plotDims,
      session.plotConfirmed,
      session.plotLocked,
      session.session,
      sync.loaded,
      viewport.isFullscreen,
    ],
  )

  useWallSnapshot(refs, snapshot)
  useWallRenderLoop(refs)

  if (!gate.onSolana) {
    return <NetworkGate chainId={gate.chainId} switching={gate.switching} onSwitch={() => void gate.switchToSolana()} />
  }

  return (
    <WallScreen
      wall={{ dom, gate, layout, sync, brush, draft, plot, session, paint, viewport, actions, pointer, balance }}
    />
  )
}
