import type { ReactNode, RefCallback } from 'react'

import { Trans } from '@lingui/react/macro'

import { TokenLogo } from './TokenLogo.pure'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

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

/** Balance chip plus rotate / confirm buttons that follow the drawing frame. */
export function PlotOverlay({
  bindOverlay,
  showBalance,
  balanceLeft,
  showControls,
  onRotate,
  onConfirm,
}: PlotOverlayProps): ReactNode {
  const left = balanceLeft === null ? '…' : balanceLeft

  return (
    <styledEl.PlotOverlayRoot ref={bindOverlay}>
      {showBalance && (
        <styledEl.BalanceChip>
          <TokenLogo size={28} />
          <Trans>
            {TOKEN_SYMBOL} left {left}
          </Trans>
        </styledEl.BalanceChip>
      )}
      {showControls && (
        <styledEl.PlainOverlayButton onClick={onRotate}>
          <Trans>⟳ rotate</Trans>
        </styledEl.PlainOverlayButton>
      )}
      {showControls && (
        <styledEl.OverlayButton onClick={onConfirm}>
          <Trans>✓ draw here</Trans>
        </styledEl.OverlayButton>
      )}
    </styledEl.PlotOverlayRoot>
  )
}
