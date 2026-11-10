import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import styled, { css } from 'styled-components/macro'

import { API_BASE } from './graffiti.service'
import { CANVAS } from './raster.utils'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { PaintPhase } from './usePaintFlow'

export interface StartOverlayProps {
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

const Actions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;

  > * {
    flex: 1;
  }

  ${styledEl.onNarrow(css`
    width: auto;
  `)}
`

const Result = styled.p<{ $failed: boolean }>`
  margin: 0;
  font-size: 12px;
  color: ${({ $failed }) => ($failed ? styledEl.wallColors.danger : styledEl.wallColors.neon)};
`

/** The landing panel: start drawing, export the wall, or view it fullscreen. */
export function StartOverlay({ phase, phaseError, onStart, onFullscreen }: StartOverlayProps): ReactNode {
  const settled = phase === 'done' || phase === 'error'
  const width = CANVAS.w
  const height = CANVAS.h

  return (
    <styledEl.OverlayLayer>
      <styledEl.StartPanel>
        <styledEl.WideOnly>
          <styledEl.BigEmoji $size={38}>🖍</styledEl.BigEmoji>
          <styledEl.WallHeading>GRAFFITI WALL</styledEl.WallHeading>
          <styledEl.Muted>
            <Trans>
              {width}×{height} shared wall · every pixel burns 1 {TOKEN_SYMBOL}
            </Trans>
          </styledEl.Muted>
        </styledEl.WideOnly>

        <styledEl.PrimaryButton onClick={onStart}>
          <Trans>✏ START DRAWING</Trans>
        </styledEl.PrimaryButton>

        <Actions>
          <styledEl.Button onClick={downloadWallImage}>
            <Trans>⬇ image</Trans>
          </styledEl.Button>
          <styledEl.Button onClick={onFullscreen}>
            <Trans>⛶ fullscreen</Trans>
          </styledEl.Button>
        </Actions>

        {settled && (
          <Result $failed={phase === 'error'}>
            {phase === 'done' ? <Trans>✓ your pixels are on the wall</Trans> : phaseError}
          </Result>
        )}
      </styledEl.StartPanel>
    </styledEl.OverlayLayer>
  )
}
