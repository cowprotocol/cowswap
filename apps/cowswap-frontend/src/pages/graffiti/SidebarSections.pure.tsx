import type { ReactNode } from 'react'

import { textFontSize } from './raster.utils'
import { MAX_BRUSH, MIN_BRUSH, PALETTE, PHASE_LABEL } from './wall.constants'
import { glowStyle, styles, swatchGridStyle } from './wall.styled'

import type { DraftBox } from './draftBox.utils'
import type { PaintPhase } from './usePaintFlow'

const MUTED = '#8a8aa3'
const DANGER = '#ff5577'
const DANGER_BORDER = '#ff557755'

export interface BrushSectionProps {
  brushSize: number
  onBrushSize: (size: number) => void
}

export interface ColorSectionProps {
  color: string
  onColor: (color: string) => void
}

export interface CostSectionProps {
  plotLocked: boolean
  draftCost: number
  cost: number
}

export interface DraftActionsProps {
  show: boolean
  canUndo: boolean
  onUndo: () => void
  onClear: () => void
}

export interface LimitWarningProps {
  box: DraftBox | null
  maxBoxWidth: number
  maxBoxHeight: number
}

export interface PaintButtonProps {
  connected: boolean
  disabled: boolean
  draftCost: number
  cost: number
  onConnect: () => void
  onPaint: () => void
}

export interface PhaseStatusProps {
  phase: PaintPhase
  error: string | null
}

export interface SheetHandleProps {
  onHide: () => void
}

export interface TextLabelSectionProps {
  label: string
  brushSize: number
  onLabel: (label: string) => void
}

export function BrushSection({ brushSize, onBrushSize }: BrushSectionProps): ReactNode {
  return (
    <div>
      <p style={styles.sectionTitle}>Brush · {brushSize}px</p>
      <input
        type="range"
        min={MIN_BRUSH}
        max={MAX_BRUSH}
        step={1}
        value={brushSize}
        onChange={(e) => onBrushSize(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#00ffa3' }}
      />
    </div>
  )
}

export function CancelButton({ onCancel }: { onCancel: () => void }): ReactNode {
  return (
    <button style={{ ...styles.button, width: '100%', borderColor: DANGER_BORDER, color: DANGER }} onClick={onCancel}>
      ✕ cancel
    </button>
  )
}

export function ColorSection({ color, onColor }: ColorSectionProps): ReactNode {
  return (
    <div>
      <p style={styles.sectionTitle}>Color</p>
      <div style={swatchGridStyle}>
        {PALETTE.map((c) => (
          <button
            key={c}
            aria-label={`color ${c}`}
            onClick={() => onColor(c)}
            style={{
              ...styles.swatch,
              background: c,
              borderColor: color === c ? '#ffffff' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <input
          type="color"
          value={color}
          onChange={(e) => onColor(e.target.value)}
          style={{ width: 44, height: 32, background: 'none', border: 'none', cursor: 'pointer' }}
        />
        <span style={{ color: MUTED, fontSize: 12 }}>{color.toUpperCase()}</span>
      </div>
    </div>
  )
}

export function CostSection({ plotLocked, draftCost, cost }: CostSectionProps): ReactNode {
  return (
    <div style={styles.costBox}>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: plotLocked ? '#00ffa3' : MUTED }}>
        {plotLocked
          ? '📍 frame locked — undo everything to move it'
          : '📍 drag the frame to position it, then ✓ draw here'}
      </p>
      <p style={{ ...styles.sectionTitle, marginBottom: 6 }}>{draftCost > 0 ? 'Your draft' : 'Drawing'}</p>
      <div style={styles.costValue}>
        {cost} <span style={{ fontSize: 13, color: MUTED }}>MOOOXELS</span>
      </div>
      <p style={{ fontSize: 11, color: MUTED, margin: '4px 0 0' }}>
        {draftCost > 0 ? 'distinct pixels — one burn commits all' : 'pixels covered so far'}
      </p>
    </div>
  )
}

export function DraftActions({ show, canUndo, onUndo, onClear }: DraftActionsProps): ReactNode {
  if (!show) return null

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={{ ...styles.button, flex: 1 }} onClick={onUndo} disabled={!canUndo}>
        ↩ undo
      </button>
      <button style={{ ...styles.button, flex: 1, borderColor: DANGER_BORDER, color: DANGER }} onClick={onClear}>
        🗑 clear all
      </button>
    </div>
  )
}

export function HideToolsButton({ onHide }: SheetHandleProps): ReactNode {
  return (
    <button style={{ ...styles.button, ...glowStyle, width: '100%' }} onClick={onHide}>
      ⌄ hide tools
    </button>
  )
}

export function LimitWarning({ box, maxBoxWidth, maxBoxHeight }: LimitWarningProps): ReactNode {
  return (
    <div style={{ ...styles.costBox, borderColor: DANGER }}>
      <p style={{ margin: 0, color: DANGER, fontSize: 12, lineHeight: 1.4 }}>
        drawing {box?.w}×{box?.h} exceeds the max area ({maxBoxWidth}×{maxBoxHeight}) — undo or clear and keep it
        smaller
      </p>
    </div>
  )
}

export function PaintButton({ connected, disabled, draftCost, cost, onConnect, onPaint }: PaintButtonProps): ReactNode {
  if (!connected) {
    return (
      <button style={styles.primaryButton} onClick={onConnect}>
        CONNECT WALLET TO PAINT
      </button>
    )
  }

  return (
    <button style={{ ...styles.primaryButton, opacity: disabled ? 0.4 : 1 }} disabled={disabled} onClick={onPaint}>
      {draftCost > 0 ? `COMMIT · BURN ${cost} MOOOXELS` : 'DRAW SOMETHING ✏'}
    </button>
  )
}

export function PhaseStatus({ phase, error }: PhaseStatusProps): ReactNode {
  const failed = phase === 'error'

  return (
    <div
      style={{
        ...styles.costBox,
        borderColor: failed ? '#ff5c8a' : '#00ffa3',
        color: failed ? '#ff5c8a' : '#00ffa3',
        fontSize: 12,
      }}
    >
      <strong>{PHASE_LABEL[phase]}</strong>
      {error && <p style={{ color: '#ff9cb8', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}

/** Bottom-sheet grabber, shown on phones. */
export function SheetHandle(): ReactNode {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '2px 0 8px' }}>
      <div style={{ width: 44, height: 4, borderRadius: 2, background: '#3a3a55' }} />
      <span style={{ fontSize: 10, color: MUTED }}>scroll for more</span>
    </div>
  )
}

export function SidebarHints({ network }: { network: string }): ReactNode {
  return (
    <div style={{ marginTop: 'auto', fontSize: 11, color: '#5b5b72', lineHeight: 1.6 }}>
      pan: two fingers / pan tool · eraser paints black (1 MOOOXELS/cell)
      <br />
      every painted pixel burns 1 MOOOXELS (SPL)
      <br />
      network: {network}
    </div>
  )
}

export function TextLabelSection({ label, brushSize, onLabel }: TextLabelSectionProps): ReactNode {
  return (
    <div>
      <p style={styles.sectionTitle}>Label</p>
      <input
        type="text"
        value={label}
        maxLength={24}
        placeholder="type text…"
        onChange={(e) => onLabel(e.target.value)}
        style={{
          ...styles.button,
          width: '100%',
          background: '#0d0d18',
          textAlign: 'left',
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
      />
      <p style={{ fontSize: 11, color: MUTED, margin: '6px 0 0' }}>
        size follows the brush ({textFontSize(brushSize)}px) — tap the wall to stamp, tap again to re-stamp
      </p>
    </div>
  )
}
