import type { BrushState } from './useBrush'
import type { ClaimFlow } from './useClaimFlow'
import type { DraftState } from './useDraft'
import type { NarrowLayout } from './useNarrowLayout'
import type { PlotState } from './usePlot'
import type { PointerInput } from './usePointerInput'
import type { SessionActions } from './useSessionActions'
import type { SessionState } from './useSessionState'
import type { SolanaGate } from './useSolanaGate'
import type { Viewport } from './useViewport'
import type { WallPaint } from './useWallPaint'
import type { WallDomBindings } from './useWallRefs'
import type { WallSync } from './useWallSync'

/** Everything the wall's view needs, assembled by the page from its hooks. */
export interface WallModel {
  dom: WallDomBindings
  gate: SolanaGate
  layout: NarrowLayout
  sync: WallSync
  brush: BrushState
  draft: DraftState
  plot: PlotState
  session: SessionState
  paint: WallPaint
  viewport: Viewport
  actions: SessionActions
  pointer: PointerInput
  /** Wall-token balance of the connected wallet, or null while unknown. */
  balance: number | null
  /** The claim a `/graffiti/claim` link opened, null on the plain wall. */
  claim: ClaimFlow | null
}
