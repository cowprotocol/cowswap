// Graffiti Wall — collaborative pixel canvas where every painted cell burns
// one PIXEL (SPL) token. See docs/graffiti/SPEC.md.
//
// The page only composes: each concern lives in its own hook (wallet gate, wall
// data sync, drafting, frame/session state, viewport, pointer input, paint flow)
// and the view is a tree of small pure components.

import type { ReactNode } from 'react'

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
import { useWallRefs, useWallDomBindings } from './useWallRefs'
import { useWallRenderLoop } from './useWallRenderLoop'
import { useWallSync } from './useWallSync'
import { WallScreen } from './WallScreen.pure'

const BALANCE_POLL_MS = 15_000

export default function GraffitiPage(): ReactNode {
  const gate = useSolanaGate()
  const layout = useNarrowLayout()
  const refs = useWallRefs()
  const dom = useWallDomBindings(refs)

  const brush = useBrush(refs)
  const { wallColorAt, applyCells } = useWallPixels(refs)
  const sync = useWallSync(refs, applyCells)
  const mint = sync.info?.mint
  const balance = useTokenBalance(gate.solanaAccount, mint, mint, BALANCE_POLL_MS)

  const plot = usePlot(refs, sync.info, sync.loaded)
  const draft = useDraft(refs, plot.maxBoxWidth, plot.maxBoxHeight)
  const session = useSessionState(refs, draft.draft)
  const paint = useWallPaint({
    solanaAccount: gate.solanaAccount,
    connected: gate.connected,
    info: sync.info,
    draft,
    session,
    markSeq: sync.markSeq,
  })

  const pointer = usePointerInput(refs, {
    brush,
    busy: paint.busy,
    loaded: sync.loaded,
    plotDims: plot.plotDims,
    wallColorAt,
    pushHistory: draft.pushHistory,
    setDraft: draft.setDraft,
    setPlot: plot.setPlot,
    resetPhase: paint.resetPhase,
  })

  const viewport = useViewport(refs, {
    canvasEl: dom.canvasEl,
    plotDims: plot.plotDims,
    plotReady: plot.plot !== null,
    plotLocked: session.plotLocked,
  })
  useCanvasGestures(refs, dom.canvasEl, pointer.cancelInteraction)

  const actions = useSessionActions(refs, {
    ...draft,
    ...session,
    busy: paint.busy,
    setPlot: plot.setPlot,
    plotDims: plot.plotDims,
    zoomToPlot: viewport.zoomToPlot,
    resetPhase: paint.resetPhase,
  })
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
