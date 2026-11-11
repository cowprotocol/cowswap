import { useState, type ReactNode } from 'react'

import graffitiCowsImage from '@cowprotocol/assets/cow-swap/graffiti-cows.png'
import { TWITTER_LINK } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'
import styled, { css } from 'styled-components/macro'

import { API_BASE } from './graffiti.service'
import { CANVAS } from './raster.utils'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { PaintPhase } from './usePaintFlow'

const TWITTER_HANDLE = '@CoWSwap'

export interface StartOverlayProps {
  phase: PaintPhase
  phaseError: string | null
  onStart: () => void
  onFullscreen: () => void
}

type StartView = 'welcome' | 'claim'

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

/** Mural on the left, everything else on the right; the mural drops out on a phone. */
const Split = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  ${styledEl.onNarrow(css`
    display: contents;
  `)}
`

const HeroSide = styled.div`
  flex: 0 0 auto;

  ${styledEl.onNarrow(css`
    display: none;
  `)}
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 320px;
  text-align: left;

  ${styledEl.onNarrow(css`
    display: contents;
    text-align: center;
  `)}
`

const Hero = styled.img`
  width: 300px;
  max-width: 100%;
  display: block;
  border-radius: 12px;
  border: 1px solid ${styledEl.wallColors.border};
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.45);
`

const Lede = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${styledEl.wallColors.text};
`

const ClaimButton = styled(styledEl.Button)`
  width: 100%;
  border-color: rgba(0, 208, 255, 0.4);
  color: ${styledEl.wallColors.neonAlt};

  &:hover:not(:disabled) {
    border-color: ${styledEl.wallColors.neonAlt};
    background: rgba(0, 208, 255, 0.08);
  }
`

const ClaimSteps = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: ${styledEl.wallColors.text};
`

const TwitterLink = styled.a`
  color: ${styledEl.wallColors.neonAlt};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

/** The landing panel: start drawing, export the wall, or view it fullscreen. */
export function StartOverlay({ phase, phaseError, onStart, onFullscreen }: StartOverlayProps): ReactNode {
  const [view, setView] = useState<StartView>('welcome')
  const settled = phase === 'done' || phase === 'error'
  const width = CANVAS.w
  const height = CANVAS.h

  return (
    <styledEl.OverlayLayer>
      <styledEl.StartPanel>
        {view === 'claim' ? (
          <Split>
            <HeroSide>
              <Hero src={graffitiCowsImage} alt="" />
            </HeroSide>
            <Column>
              <styledEl.WallHeading>
                <Trans>GET {TOKEN_SYMBOL}</Trans>
              </styledEl.WallHeading>
              <styledEl.Muted>
                <Trans>Free tokens, one per pixel you paint</Trans>
              </styledEl.Muted>

              <ClaimSteps>
                <li>
                  <Trans>
                    🐮 At Solana Breakpoint? Find us at the CoW Protocol booth and ask for the {TOKEN_SYMBOL} airdrop.
                  </Trans>
                </li>
                <li>
                  <Trans>
                    🐦 Not at Breakpoint? Follow{' '}
                    <TwitterLink href={TWITTER_LINK} target="_blank" rel="noopener noreferrer">
                      {TWITTER_HANDLE}
                    </TwitterLink>{' '}
                    and tag us — we will share some with you.
                  </Trans>
                </li>
              </ClaimSteps>

              <Actions>
                <styledEl.Button onClick={() => setView('welcome')}>
                  <Trans>← back</Trans>
                </styledEl.Button>
              </Actions>
            </Column>
          </Split>
        ) : (
          <Split>
            <HeroSide>
              <Hero src={graffitiCowsImage} alt="" />
            </HeroSide>
            <Column>
              <styledEl.WideOnly>
                <styledEl.WallHeading>GRAFFITI WALL</styledEl.WallHeading>
                <Lede>
                  <Trans>
                    A {width}×{height} pixel wall shared by everyone, painted live on Solana. Pick your frame, draw
                    whatever you like, and burn 1 {TOKEN_SYMBOL} per pixel to put it on the wall for good.
                  </Trans>
                </Lede>
              </styledEl.WideOnly>

              <styledEl.PrimaryButton onClick={onStart}>
                <Trans>✏ START DRAWING</Trans>
              </styledEl.PrimaryButton>

              <ClaimButton onClick={() => setView('claim')}>
                <Trans>🎁 Claim {TOKEN_SYMBOL} tokens</Trans>
              </ClaimButton>

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
            </Column>
          </Split>
        )}
      </styledEl.StartPanel>
    </styledEl.OverlayLayer>
  )
}
