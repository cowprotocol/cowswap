import type { CSSProperties, ReactNode } from 'react'

import { API_BASE } from './graffiti.service'
import { CANVAS } from './raster.utils'
import { styles } from './wall.styled'

import type { PaintPhase } from './usePaintFlow'

export interface StartOverlayProps {
  narrow: boolean
  phase: PaintPhase
  phaseError: string | null
  onStart: () => void
  onFullscreen: () => void
}

function downloadWallImage(): void {
  const link = document.createElement('a')

  link.href = `${API_BASE}/canvas.png`
  link.download = 'graffiti-wall.png'
  link.click()
}

const compactButton: CSSProperties = { padding: '6px 8px', fontSize: 12 }

const wideBackdrop: CSSProperties = {
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(5,5,10,0.62)',
  backdropFilter: 'blur(2px)',
}

const narrowBackdrop: CSSProperties = { alignItems: 'flex-end', justifyContent: 'stretch', padding: 8 }

const narrowPanel: CSSProperties = {
  position: 'absolute',
  bottom: 8,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'auto',
  minWidth: 0,
  padding: '6px 8px',
  gap: 6,
  background: 'rgba(16,16,28,0.92)',
}

/** The landing panel: start drawing, export the wall, or view it fullscreen. */
export function StartOverlay({ narrow, phase, phaseError, onStart, onFullscreen }: StartOverlayProps): ReactNode {
  const secondary: CSSProperties = {
    ...styles.button,
    flex: narrow ? undefined : 1,
    ...(narrow ? compactButton : {}),
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 7,
        display: 'flex',
        ...(narrow ? narrowBackdrop : wideBackdrop),
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          ...styles.panel,
          pointerEvents: 'auto',
          ...(narrow ? narrowPanel : {}),
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          minWidth: 280,
          textAlign: 'center',
        }}
      >
        {!narrow && <Heading />}
        <button
          style={{ ...styles.primaryButton, ...(narrow ? { padding: '6px 10px', fontSize: 12 } : {}) }}
          onClick={onStart}
        >
          ✏ {narrow ? 'DRAW' : 'START DRAWING'}
        </button>
        <div style={{ display: 'flex', gap: 8, width: narrow ? 'auto' : '100%' }}>
          <button style={secondary} onClick={downloadWallImage}>
            ⬇ {narrow ? 'img' : 'image'}
          </button>
          <button style={secondary} onClick={onFullscreen}>
            ⛶ {narrow ? 'full' : 'fullscreen'}
          </button>
        </div>
        <PaintResult phase={phase} phaseError={phaseError} />
      </div>
    </div>
  )
}

function Heading(): ReactNode {
  return (
    <>
      <span style={{ fontSize: 38 }}>🖍</span>
      <h2 style={{ margin: 0, color: '#fff', letterSpacing: 2 }}>GRAFFITI WALL</h2>
      <p style={{ margin: 0, color: '#8a8aa3', fontSize: 12, lineHeight: 1.5 }}>
        {CANVAS.w}×{CANVAS.h} shared wall · every pixel burns 1 MOOOXELS
      </p>
    </>
  )
}

function PaintResult({ phase, phaseError }: Pick<StartOverlayProps, 'phase' | 'phaseError'>): ReactNode {
  if (phase !== 'done' && phase !== 'error') return null

  return (
    <p style={{ margin: 0, fontSize: 12, color: phase === 'error' ? '#ff5577' : '#00ffa3' }}>
      {phase === 'done' ? '✓ your pixels are on the wall' : phaseError}
    </p>
  )
}
