import type { CSSProperties, ReactNode } from 'react'

import {
  BrushSection,
  CancelButton,
  ColorSection,
  CostSection,
  DraftActions,
  HideToolsButton,
  LimitWarning,
  PaintButton,
  PhaseStatus,
  SheetHandle,
  SidebarHints,
  TextLabelSection,
} from './SidebarSections.pure'
import { styles } from './wall.styled'

import type { DraftBox } from './draftBox.utils'
import type { BrushState } from './useBrush'
import type { PaintPhase } from './usePaintFlow'
import type { SessionActions } from './useSessionActions'
import type { Session } from './wall.types'

export interface ToolsSidebarProps {
  narrow: boolean
  brush: BrushState
  connected: boolean
  network: string
  session: Session
  plotLocked: boolean
  plotConfirmed: boolean
  draftCost: number
  cost: number
  canUndo: boolean
  busy: boolean
  phase: PaintPhase
  phaseError: string | null
  paintDisabled: boolean
  draftBox: DraftBox | null
  boxTooBig: boolean
  maxBoxWidth: number
  maxBoxHeight: number
  actions: SessionActions
  onPaint: () => void
  onConnect: () => void
  onHide: () => void
}

/** On phones the sidebar becomes a scrollable bottom sheet. */
const narrowSheet: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  maxHeight: '72vh',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  WebkitOverflowScrolling: 'touch' as never,
  touchAction: 'pan-y',
  zIndex: 8,
  borderLeft: 'none',
  borderTop: '1px solid #2a2a40',
  borderRadius: '14px 14px 0 0',
  background: 'rgba(16,16,28,0.96)',
  backdropFilter: 'blur(8px)',
  width: '100%',
}

export function ToolsSidebar(props: ToolsSidebarProps): ReactNode {
  const { narrow, brush, session, phase, busy, draftCost, cost, actions } = props
  const showStatus = busy || phase === 'done' || phase === 'error'
  const canClear = (draftCost > 0 || props.plotConfirmed) && !busy

  return (
    <aside style={{ ...styles.sidebar, ...(narrow ? narrowSheet : {}) }}>
      {narrow && <SheetHandle />}
      <HideToolsButton onHide={props.onHide} />
      {brush.tool === 'text' && (
        <TextLabelSection label={brush.label} brushSize={brush.brushSize} onLabel={brush.setLabel} />
      )}
      <ColorSection color={brush.color} onColor={brush.setColor} />
      <BrushSection brushSize={brush.brushSize} onBrushSize={brush.setBrushSize} />
      <CostSection plotLocked={props.plotLocked} draftCost={draftCost} cost={cost} />
      <PaintButton
        connected={props.connected}
        disabled={props.paintDisabled}
        draftCost={draftCost}
        cost={cost}
        onConnect={props.onConnect}
        onPaint={props.onPaint}
      />
      {session !== 'start' && !busy && <CancelButton onCancel={actions.resetToStart} />}
      <DraftActions show={canClear} canUndo={props.canUndo} onUndo={actions.undo} onClear={actions.clearAll} />
      {props.boxTooBig && (
        <LimitWarning box={props.draftBox} maxBoxWidth={props.maxBoxWidth} maxBoxHeight={props.maxBoxHeight} />
      )}
      {showStatus && <PhaseStatus phase={phase} error={props.phaseError} />}
      <SidebarHints network={props.network} />
    </aside>
  )
}
