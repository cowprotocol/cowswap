import type { CSSProperties, ReactNode } from 'react'

import { glowStyle, styles } from './wall.styled'

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
  label: string
  accent: string
  glow: string
  /** Whether the label takes the accent colour while active. */
  tint: boolean
}

const GREEN = { accent: '#00ffa3', glow: 'rgba(0,255,163,0.35)' }
const RED = { accent: '#ff5577', glow: 'rgba(255,85,119,0.35)' }

const TOOLS: ToolOption[] = [
  { id: 'draw', label: '✏ draw', ...GREEN, tint: false },
  { id: 'pan', label: '✋ pan', ...GREEN, tint: false },
  { id: 'text', label: 'T text', ...GREEN, tint: true },
  { id: 'erase', label: '🧽 erase', ...RED, tint: true },
]

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
    <div
      style={{
        position: 'absolute',
        left: 12,
        bottom: 12,
        display: hidden ? 'none' : 'flex',
        gap: 6,
      }}
    >
      <button style={styles.button} onClick={onZoomIn}>
        ＋
      </button>
      <button style={styles.button} onClick={onZoomOut}>
        －
      </button>
      <button style={styles.button} onClick={onFit}>
        fit
      </button>
      <button style={{ ...styles.button, borderColor: '#2a2a40' }} onClick={onFrame} aria-label="zoom to frame">
        ⌖ frame
      </button>
      {TOOLS.map((option) => (
        <button key={option.id} style={toolStyle(option, tool === option.id)} onClick={() => onTool(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function LoadErrorOverlay({ error, apiBase }: LoadErrorOverlayProps): ReactNode {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(6,6,9,0.9)',
        color: '#ff5c8a',
        fontSize: 14,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 40 }}>🧱</div>
        <p>Could not load the wall from {apiBase}</p>
        <p style={{ color: '#8a8aa3' }}>{error}</p>
      </div>
    </div>
  )
}

/** Brings the tool sidebar back after it was hidden. */
export function ShowToolsButton({ onClick }: ShowToolsButtonProps): ReactNode {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 5,
        ...styles.button,
        ...glowStyle,
        padding: '8px 16px',
      }}
    >
      <span style={{ filter: 'drop-shadow(0 0 6px #00ffa3)' }}>🧰</span> tools
    </button>
  )
}

function toolStyle(option: ToolOption, active: boolean): CSSProperties {
  return {
    ...styles.button,
    borderColor: active ? option.accent : '#2a2a40',
    ...(option.tint ? { color: active ? option.accent : undefined } : {}),
    boxShadow: active ? `0 0 10px ${option.glow}` : 'none',
  }
}
