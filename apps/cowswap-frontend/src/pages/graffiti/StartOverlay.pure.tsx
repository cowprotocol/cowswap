import { useState, type FormEvent, type ReactNode } from 'react'

import { TWITTER_LINK } from '@cowprotocol/common-const'

import { Trans, useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { parseClaimCode } from './claimCode.utils'
import { ClaimResultView } from './ClaimScreens.pure'
import { downloadWallImage } from './graffiti.service'
import { HeroPanel } from './HeroPanel.pure'
import { CANVAS } from './raster.utils'
import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { ClaimFlow } from './useClaimFlow'
import type { PaintPhase } from './usePaintFlow'

const TWITTER_HANDLE = '@CoWSwap'

export interface StartOverlayProps {
  phase: PaintPhase
  phaseError: string | null
  /** Cells of the last draw the wall accepted. */
  paintedCount: number
  connected: boolean
  /** Wall-token balance of the connected wallet, null while it is unknown. */
  balance: number | null
  onStart: () => void
  onConnect: () => void
  /** Whether the browser can show the wall fullscreen; iOS Safari cannot. */
  canFullscreen: boolean
  onFullscreen: () => void
  /** Fullscreen, centred on what was just painted. */
  onShowResult: () => void
  /** Leave the post-commit panel. */
  onDismiss: () => void
  /** The claim a scanned link opened, null on the plain wall. */
  claim: ClaimFlow | null
  /** Connected Solana account, where a claim sends its tokens. */
  account: string | undefined
  network: string
}

interface PaintedViewProps {
  paintedCount: number
  onShowResult: () => void
  onDismiss: () => void
}

interface StartActionProps {
  connected: boolean
  balance: number | null
  onStart: () => void
  onConnect: () => void
  onGetTokens: () => void
}

type StartView = 'welcome' | 'claim'

const Hint = styled(styledEl.PanelText).attrs({ $tone: 'muted' })`
  font-size: 12px;
  text-align: center;
`

const HintAction = styled.button`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: ${styledEl.wallColors.neonAlt};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const Result = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${styledEl.wallColors.danger};
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

const CodeForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  width: 100%;
`

const CodeLabel = styled.label`
  font-size: 13px;
  line-height: 1.6;
  color: ${styledEl.wallColors.text};
`

const TwitterLink = styled(styledEl.PanelLink)`
  font-weight: 700;
`

/** The landing panel: start drawing, export the wall, or view it fullscreen. */
export function StartOverlay({
  phase,
  phaseError,
  paintedCount,
  connected,
  balance,
  onStart,
  onConnect,
  canFullscreen,
  onFullscreen,
  onShowResult,
  onDismiss,
  claim,
  account,
  network,
}: StartOverlayProps): ReactNode {
  const navigate = useNavigate()
  const [view, setView] = useState<StartView>('welcome')
  const width = CANVAS.w
  const height = CANVAS.h

  if (claim) {
    return (
      <styledEl.OverlayLayer>
        <styledEl.StartPanel>
          {connected && <BalanceBadge balance={balance} />}
          <ClaimResultView
            claim={claim}
            connected={connected}
            account={account}
            network={network}
            onConnect={onConnect}
            onBack={() => {
              setView('welcome')
              navigate(Routes.GRAFFITI)
            }}
          />
        </styledEl.StartPanel>
      </styledEl.OverlayLayer>
    )
  }

  if (view === 'claim') {
    return (
      <styledEl.OverlayLayer>
        <styledEl.StartPanel>
          <ClaimView onBack={() => setView('welcome')} />
        </styledEl.StartPanel>
      </styledEl.OverlayLayer>
    )
  }

  if (phase === 'done') {
    return (
      <styledEl.OverlayLayer>
        <styledEl.StartPanel>
          <BalanceBadge balance={balance} />
          <PaintedView paintedCount={paintedCount} onShowResult={onShowResult} onDismiss={onDismiss} />
        </styledEl.StartPanel>
      </styledEl.OverlayLayer>
    )
  }

  return (
    <styledEl.OverlayLayer>
      <styledEl.StartPanel>
        {connected && <BalanceBadge balance={balance} />}
        <HeroPanel fillHeight>
          <styledEl.WallHeading>GRAFFITI WALL</styledEl.WallHeading>
          <styledEl.PanelText>
            <Trans>
              A {width}×{height} pixel wall shared by everyone, painted live on Solana. Pick your frame, draw whatever
              you like, and burn 1 {TOKEN_SYMBOL} per pixel to put it on the wall for good.
            </Trans>
          </styledEl.PanelText>

          <StartAction
            connected={connected}
            balance={balance}
            onStart={onStart}
            onConnect={onConnect}
            onGetTokens={() => setView('claim')}
          />

          <ClaimButton onClick={() => setView('claim')}>
            <Trans>🎁 Claim {TOKEN_SYMBOL} tokens</Trans>
          </ClaimButton>

          <styledEl.PanelActions>
            <styledEl.Button onClick={() => void downloadWallImage()}>
              <Trans>⬇ download wall</Trans>
            </styledEl.Button>
            {canFullscreen && (
              <styledEl.Button onClick={onFullscreen}>
                <Trans>⛶ view wall</Trans>
              </styledEl.Button>
            )}
          </styledEl.PanelActions>

          {phase === 'error' && <Result>{phaseError}</Result>}
        </HeroPanel>
      </styledEl.StartPanel>
    </styledEl.OverlayLayer>
  )
}

/** What the wallet holds, read out of the way of the panel's actions. */
function BalanceBadge({ balance }: { balance: number | null }): ReactNode {
  if (balance === null) return null

  return (
    <styledEl.PanelBadge>
      <Trans>
        {TOKEN_SYMBOL} balance: {balance}
      </Trans>
    </styledEl.PanelBadge>
  )
}

/** How to come by wall tokens, and the box that redeems a code for them. */
function ClaimView({ onBack }: { onBack: () => void }): ReactNode {
  const { t } = useLingui()
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')
  const code = parseClaimCode(codeInput)

  const openClaim = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!code) return

    navigate(`${Routes.GRAFFITI_CLAIM}?code=${encodeURIComponent(code)}`)
  }

  return (
    <HeroPanel hideHero>
      <styledEl.WallHeading>
        <Trans>GET {TOKEN_SYMBOL}</Trans>
      </styledEl.WallHeading>
      <styledEl.Muted>
        <Trans>Free tokens, one per pixel you paint</Trans>
      </styledEl.Muted>

      <CodeForm onSubmit={openClaim}>
        <CodeLabel htmlFor="graffiti-claim-code">
          <Trans>🎟 Got a claim code? Redeem it here.</Trans>
        </CodeLabel>
        <styledEl.TextInput
          id="graffiti-claim-code"
          value={codeInput}
          onChange={(event) => setCodeInput(event.target.value)}
          placeholder={t`code or scanned link`}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <styledEl.PrimaryButton type="submit" disabled={!code}>
          <Trans>CLAIM {TOKEN_SYMBOL}</Trans>
        </styledEl.PrimaryButton>
      </CodeForm>

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
            and send us a love message. We will share some with you.
          </Trans>
        </li>
      </ClaimSteps>

      <styledEl.PanelActions>
        <styledEl.Button onClick={onBack}>
          <Trans>← back</Trans>
        </styledEl.Button>
      </styledEl.PanelActions>
    </HeroPanel>
  )
}

/** Where a commit lands: what went up, what is left, and a way to go look at it. */
function PaintedView({ paintedCount, onShowResult, onDismiss }: PaintedViewProps): ReactNode {
  return (
    <HeroPanel fillHeight>
      <styledEl.WallHeading>
        <Trans>ON THE WALL 🎉</Trans>
      </styledEl.WallHeading>
      <styledEl.CostValue>
        {paintedCount}{' '}
        <styledEl.UnitLabel>
          <Trans>pixels</Trans>
        </styledEl.UnitLabel>
      </styledEl.CostValue>
      <styledEl.PanelText>
        <Trans>
          painted, and {paintedCount} {TOKEN_SYMBOL} burned for good. Everyone looking at the wall right now can see
          them.
        </Trans>
      </styledEl.PanelText>

      <styledEl.PrimaryButton onClick={onShowResult}>
        <Trans>⛶ SEE YOUR MASTERPIECE</Trans>
      </styledEl.PrimaryButton>

      <styledEl.PanelActions>
        <styledEl.Button onClick={onDismiss}>
          <Trans>✏ paint more</Trans>
        </styledEl.Button>
        <styledEl.Button onClick={() => void downloadWallImage()}>
          <Trans>⬇ download wall</Trans>
        </styledEl.Button>
      </styledEl.PanelActions>
    </HeroPanel>
  )
}

/**
 * The wall's primary button, which is only ever `start drawing` once a wallet
 * that can pay for pixels is connected: painting burns a token per cell, so an
 * empty wallet reaches the commit step and can go no further.
 */
function StartAction({ connected, balance, onStart, onConnect, onGetTokens }: StartActionProps): ReactNode {
  if (!connected) {
    return (
      <>
        <styledEl.PrimaryButton onClick={onConnect}>
          <Trans>CONNECT SOLANA WALLET</Trans>
        </styledEl.PrimaryButton>
        <Hint>
          <Trans>Connect first: painting burns {TOKEN_SYMBOL} from your wallet.</Trans>
        </Hint>
      </>
    )
  }

  if (balance === 0) {
    return (
      <>
        <styledEl.PrimaryButton disabled>
          <Trans>NO {TOKEN_SYMBOL} IN YOUR WALLET</Trans>
        </styledEl.PrimaryButton>
        <Hint>
          <Trans>
            Every pixel burns 1 {TOKEN_SYMBOL}, and your wallet holds none.{' '}
            <HintAction type="button" onClick={onGetTokens}>
              Get some
            </HintAction>{' '}
            to start drawing.
          </Trans>
        </Hint>
      </>
    )
  }

  return (
    <styledEl.PrimaryButton onClick={onStart}>
      <Trans>✏ START DRAWING</Trans>
    </styledEl.PrimaryButton>
  )
}
