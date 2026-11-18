import type { ReactNode } from 'react'

import {
  BalanceWarning,
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
import * as styledEl from './wall.styled'

import type { DraftBox } from './draftBox.utils'
import type { BrushState } from './useBrush'
import type { PaintPhase } from './usePaintFlow'
import type { SessionActions } from './useSessionActions'
import type { Session } from './wall.types'

export interface ToolsSidebarProps {
  brush: BrushState
  connected: boolean
  /** Wall-token balance of the connected wallet, or null while unknown. */
  balance: number | null
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
  /** Drop a wallet prompt that never answered. Absent while that is unsafe. */
  onResetPaint?: () => void
}

export function ToolsSidebar(props: ToolsSidebarProps): ReactNode {
  const { brush, session, phase, busy, draftCost, cost, actions } = props
  const showStatus = busy || phase === 'done' || phase === 'error'
  const canClear = (draftCost > 0 || props.plotConfirmed) && !busy
  // The wall's preflight is the authority on affordability; this only keeps the
  // user out of a wallet prompt that cannot possibly succeed.
  const missing = props.balance === null ? 0 : Math.max(0, draftCost - props.balance)

  return (
    <styledEl.Sidebar>
      <SheetHandle />
      <HideToolsButton onHide={props.onHide} />
      {brush.tool === 'text' && (
        <TextLabelSection label={brush.label} brushSize={brush.brushSize} onLabel={brush.setLabel} />
      )}
      <ColorSection color={brush.color} onColor={brush.setColor} />
      <BrushSection brushSize={brush.brushSize} onBrushSize={brush.setBrushSize} />
      <CostSection plotLocked={props.plotLocked} draftCost={draftCost} cost={cost} />
      <PaintButton
        connected={props.connected}
        disabled={props.paintDisabled || missing > 0}
        draftCost={draftCost}
        cost={cost}
        onConnect={props.onConnect}
        onPaint={props.onPaint}
      />
      {missing > 0 && <BalanceWarning missing={missing} needed={draftCost} />}
      {session !== 'start' && !busy && <CancelButton onCancel={actions.resetToStart} hasDrawing={draftCost > 0} />}
      <DraftActions show={canClear} canUndo={props.canUndo} onUndo={actions.undo} onClear={actions.clearAll} />
      {props.boxTooBig && (
        <LimitWarning box={props.draftBox} maxBoxWidth={props.maxBoxWidth} maxBoxHeight={props.maxBoxHeight} />
      )}
      {showStatus && <PhaseStatus phase={phase} error={props.phaseError} onReset={props.onResetPaint} />}
      <SidebarHints network={props.network} />
    </styledEl.Sidebar>
  )
}
