import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './wall.styled'

import type { Tool } from './wall.types'

export interface CanvasControlsProps {
  hidden: boolean
  tool: Tool
  onTool: (tool: Tool) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  onFrame: () => void
}

interface ToolOption {
  id: Tool
  label: ReactNode
  accent: string
  /** Whether the label takes the accent colour while active. */
  tint: boolean
}

const TOOLS: ToolOption[] = [
  { id: 'draw', label: <Trans>✏ draw</Trans>, accent: styledEl.wallColors.neon, tint: false },
  { id: 'pan', label: <Trans>✋ pan</Trans>, accent: styledEl.wallColors.neon, tint: false },
  { id: 'text', label: <Trans>T text</Trans>, accent: styledEl.wallColors.neon, tint: true },
  { id: 'erase', label: <Trans>🧽 erase</Trans>, accent: styledEl.wallColors.danger, tint: true },
]

export interface ExitFullscreenButtonProps {
  onClick: () => void
}

export interface LoadErrorOverlayProps {
  error: string
  apiBase: string
}

export interface ShowToolsButtonProps {
  onClick: () => void
}

/** Zoom buttons and the tool picker, along the bottom-left of the wall. */
export function CanvasControls({
  hidden,
  tool,
  onTool,
  onZoomIn,
  onZoomOut,
  onFit,
  onFrame,
}: CanvasControlsProps): ReactNode {
  return (
    <styledEl.ControlBar $hidden={hidden}>
      <styledEl.Button onClick={onZoomIn}>＋</styledEl.Button>
      <styledEl.Button onClick={onZoomOut}>－</styledEl.Button>
      <styledEl.Button onClick={onFit}>
        <Trans>fit</Trans>
      </styledEl.Button>
      <styledEl.Button onClick={onFrame}>
        <Trans>⌖ frame</Trans>
      </styledEl.Button>
      {TOOLS.map((option) => (
        <styledEl.ToolButton
          key={option.id}
          $active={tool === option.id}
          $accent={option.accent}
          $tint={option.tint}
          onClick={() => onTool(option.id)}
        >
          {option.label}
        </styledEl.ToolButton>
      ))}
    </styledEl.ControlBar>
  )
}

/** The only way out of fullscreen besides ESC, which a touch screen has not got. */
export function ExitFullscreenButton({ onClick }: ExitFullscreenButtonProps): ReactNode {
  return (
    <styledEl.ExitFullscreen onClick={onClick}>
      <Trans>← menu</Trans>
    </styledEl.ExitFullscreen>
  )
}

export function LoadErrorOverlay({ error, apiBase }: LoadErrorOverlayProps): ReactNode {
  return (
    <styledEl.LoadError>
      <div>
        <styledEl.BigEmoji>🧱</styledEl.BigEmoji>
        <p>
          <Trans>Could not load the wall from {apiBase}</Trans>
        </p>
        <styledEl.Muted>{error}</styledEl.Muted>
      </div>
    </styledEl.LoadError>
  )
}

/** Brings the tool sidebar back after it was hidden. */
export function ShowToolsButton({ onClick }: ShowToolsButtonProps): ReactNode {
  return (
    <styledEl.ShowTools onClick={onClick}>
      🧰 <Trans>tools</Trans>
    </styledEl.ShowTools>
  )
}
