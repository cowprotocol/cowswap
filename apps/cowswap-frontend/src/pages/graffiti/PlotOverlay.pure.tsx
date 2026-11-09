import type { ReactNode, RefCallback } from 'react'

import { glowStyle, styles } from './wall.styled'

export interface PlotOverlayProps {
  /** Positioned by the render loop, just above the frame. */
  bindOverlay: RefCallback<HTMLDivElement>
  showBalance: boolean
  /** Tokens left after the current draft, or null while the balance loads. */
  balanceLeft: number | null
  showControls: boolean
  onRotate: () => void
  onConfirm: () => void
}

const chipStyle = { ...glowStyle, padding: '7px 15px', fontSize: 14, fontFamily: 'inherit' }

/** Balance chip plus rotate / confirm buttons that follow the drawing frame. */
export function PlotOverlay({
  bindOverlay,
  showBalance,
  balanceLeft,
  showControls,
  onRotate,
  onConfirm,
}: PlotOverlayProps): ReactNode {
  return (
    <div
      ref={bindOverlay}
      style={{
        position: 'absolute',
        zIndex: 6,
        pointerEvents: 'none',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {showBalance && <div style={chipStyle}>MOOOXELS left {balanceLeft === null ? '…' : balanceLeft}</div>}
      {showControls && (
        <button
          style={{ ...styles.button, pointerEvents: 'auto', borderRadius: 999, borderColor: '#2a2a40' }}
          onClick={onRotate}
        >
          ⟳ rotate
        </button>
      )}
      {showControls && (
        <button style={{ ...styles.button, ...glowStyle, pointerEvents: 'auto' }} onClick={onConfirm}>
          ✓ draw here
        </button>
      )}
    </div>
  )
}
