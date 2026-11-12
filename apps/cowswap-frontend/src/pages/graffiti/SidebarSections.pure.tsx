import type { ReactNode } from 'react'

import { Trans, useLingui } from '@lingui/react/macro'

import { textFontSize } from './raster.utils'
import { MAX_BRUSH, MIN_BRUSH, PALETTE, PHASE_LABEL, TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { DraftBox } from './draftBox.utils'
import type { PaintPhase } from './usePaintFlow'

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

export interface TextLabelSectionProps {
  label: string
  brushSize: number
  onLabel: (label: string) => void
}

export function BrushSection({ brushSize, onBrushSize }: BrushSectionProps): ReactNode {
  const { t } = useLingui()

  return (
    <div>
      <styledEl.SectionTitle>
        <Trans>Brush · {brushSize}px</Trans>
      </styledEl.SectionTitle>
      <styledEl.BrushRange
        type="range"
        min={MIN_BRUSH}
        max={MAX_BRUSH}
        step={1}
        value={brushSize}
        aria-label={t`brush size`}
        onChange={(e) => onBrushSize(Number(e.target.value))}
      />
    </div>
  )
}

export function CancelButton({ onCancel }: { onCancel: () => void }): ReactNode {
  return (
    <styledEl.DangerButton onClick={onCancel}>
      <Trans>✕ cancel</Trans>
    </styledEl.DangerButton>
  )
}

export function ColorSection({ color, onColor }: ColorSectionProps): ReactNode {
  const { t } = useLingui()

  return (
    <div>
      <styledEl.SectionTitle>
        <Trans>Color</Trans>
      </styledEl.SectionTitle>
      <styledEl.SwatchGrid>
        {PALETTE.map((c) => (
          <styledEl.Swatch
            key={c}
            type="button"
            aria-label={t`color ${c}`}
            $color={c}
            $selected={color === c}
            onClick={() => onColor(c)}
          />
        ))}
      </styledEl.SwatchGrid>
      <styledEl.ColorRow>
        <styledEl.ColorPicker
          type="color"
          value={color}
          aria-label={t`custom color`}
          onChange={(e) => onColor(e.target.value)}
        />
        <styledEl.Muted>{color.toUpperCase()}</styledEl.Muted>
      </styledEl.ColorRow>
    </div>
  )
}

export function CostSection({ plotLocked, draftCost, cost }: CostSectionProps): ReactNode {
  return (
    <styledEl.CostBox>
      <styledEl.Muted>
        {plotLocked ? (
          <Trans>📍 frame locked — undo everything to move it</Trans>
        ) : (
          <Trans>📍 drag the frame to position it, then ✓ draw here (or press Enter)</Trans>
        )}
      </styledEl.Muted>
      <styledEl.SectionTitle>
        {draftCost > 0 ? <Trans>Your draft</Trans> : <Trans>Drawing</Trans>}
      </styledEl.SectionTitle>
      <styledEl.CostValue>
        {cost} <styledEl.UnitLabel>{TOKEN_SYMBOL}</styledEl.UnitLabel>
      </styledEl.CostValue>
      <styledEl.Muted>
        {draftCost > 0 ? <Trans>distinct pixels — one burn commits all</Trans> : <Trans>pixels covered so far</Trans>}
      </styledEl.Muted>
    </styledEl.CostBox>
  )
}

export function DraftActions({ show, canUndo, onUndo, onClear }: DraftActionsProps): ReactNode {
  if (!show) return null

  return (
    <styledEl.ButtonRow>
      <styledEl.Button onClick={onUndo} disabled={!canUndo}>
        <Trans>↩ undo</Trans>
      </styledEl.Button>
      <styledEl.DangerButton onClick={onClear}>
        <Trans>🗑 clear all</Trans>
      </styledEl.DangerButton>
    </styledEl.ButtonRow>
  )
}

export function HideToolsButton({ onHide }: { onHide: () => void }): ReactNode {
  return (
    <styledEl.IconGlowButton onClick={onHide}>
      <styledEl.ChevronDown />
      <Trans>hide tools</Trans>
    </styledEl.IconGlowButton>
  )
}

export function LimitWarning({ box, maxBoxWidth, maxBoxHeight }: LimitWarningProps): ReactNode {
  const width = box?.w ?? 0
  const height = box?.h ?? 0

  return (
    <styledEl.CostBox $variant="danger">
      <Trans>
        drawing {width}×{height} exceeds the max area ({maxBoxWidth}×{maxBoxHeight}) — undo or clear and keep it smaller
      </Trans>
    </styledEl.CostBox>
  )
}

export function PaintButton({ connected, disabled, draftCost, cost, onConnect, onPaint }: PaintButtonProps): ReactNode {
  if (!connected) {
    return (
      <styledEl.PrimaryButton onClick={onConnect}>
        <Trans>CONNECT WALLET TO PAINT</Trans>
      </styledEl.PrimaryButton>
    )
  }

  return (
    <styledEl.PrimaryButton disabled={disabled} onClick={onPaint}>
      {draftCost > 0 ? (
        <Trans>
          COMMIT · BURN {cost} {TOKEN_SYMBOL}
        </Trans>
      ) : (
        <Trans>DRAW SOMETHING ✏</Trans>
      )}
    </styledEl.PrimaryButton>
  )
}

export function PhaseStatus({ phase, error }: PhaseStatusProps): ReactNode {
  return (
    <styledEl.CostBox $variant={phase === 'error' ? 'danger' : 'success'}>
      <strong>{PHASE_LABEL[phase]}</strong>
      {error && <styledEl.ErrorNote>{error}</styledEl.ErrorNote>}
    </styledEl.CostBox>
  )
}

/** Bottom-sheet grabber; CSS hides it outside phone widths. */
export function SheetHandle(): ReactNode {
  return (
    <styledEl.SheetHandleRow>
      <styledEl.SheetGrabber />
      <styledEl.Muted>
        <Trans>scroll for more</Trans>
      </styledEl.Muted>
    </styledEl.SheetHandleRow>
  )
}

export function SidebarHints({ network }: { network: string }): ReactNode {
  return (
    <styledEl.Hints>
      <Trans>pan: two fingers / pan tool · eraser paints black (1 {TOKEN_SYMBOL}/cell)</Trans>
      <br />
      <Trans>every painted pixel burns 1 {TOKEN_SYMBOL} (SPL)</Trans>
      <br />
      <Trans>network: {network}</Trans>
    </styledEl.Hints>
  )
}

export function TextLabelSection({ label, brushSize, onLabel }: TextLabelSectionProps): ReactNode {
  const { t } = useLingui()
  const fontSize = textFontSize(brushSize)

  return (
    <div>
      <styledEl.SectionTitle>
        <Trans>Label</Trans>
      </styledEl.SectionTitle>
      <styledEl.TextInput
        type="text"
        value={label}
        maxLength={24}
        placeholder={t`type text…`}
        onChange={(e) => onLabel(e.target.value)}
      />
      <styledEl.Muted>
        <Trans>size follows the brush ({fontSize}px) — tap the wall to stamp, tap again to re-stamp</Trans>
      </styledEl.Muted>
    </div>
  )
}
