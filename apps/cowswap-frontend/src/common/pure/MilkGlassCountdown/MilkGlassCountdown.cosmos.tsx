import { ReactNode, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { MilkGlassCountdown } from './MilkGlassCountdown.pure'

/** Cosmos-only stand-in for a canonical batch interval. */
const DEMO_BATCH_INTERVAL_SECONDS = 300

function midCountdownTargetEpochSec(): number {
  return Math.floor(Date.now() / 1000) + 224
}

const Shell = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  margin: 24px;
  background: var(${UI.COLOR_PAPER});
  border-radius: 21px;
  overflow: hidden;
`

/** Mirrors ProgressImageWrapper constraints used by the wait modal hero. */
const Hero = styled.div`
  --fallback-height: 246px;
  width: 100%;
  height: var(--fallback-height);
  min-height: var(--fallback-height);
  max-height: var(--fallback-height);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  contain: layout style paint;
  border-radius: 21px 21px 0 0;
  background: var(${UI.COLOR_BLUE_300_PRIMARY});
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
`

const Controls = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
`

const Footer = styled.div`
  padding: 12px 16px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT});
  background: var(${UI.COLOR_PAPER_DARKER});
`

function MidCountdownFixture({ width }: { width: number }): ReactNode {
  const [mountKey, setMountKey] = useState(0)
  const [targetEpochSec, setTargetEpochSec] = useState(midCountdownTargetEpochSec)

  return (
    <Shell $width={width}>
      <Controls>
        <button
          type="button"
          onClick={() => {
            setTargetEpochSec(midCountdownTargetEpochSec())
            setMountKey((key) => key + 1)
          }}
        >
          Remount (re-open modal)
        </button>
        <span>mountKey={mountKey}</span>
      </Controls>
      <Hero>
        <MilkGlassCountdown
          key={mountKey}
          targetEpochSec={targetEpochSec}
          durationMs={DEMO_BATCH_INTERVAL_SECONDS * 1000}
          label="Until your order enters the auction"
        />
      </Hero>
      <Footer>1 WETH for at most 790.9331 USDC</Footer>
    </Shell>
  )
}

const Fixtures = {
  'mid-countdown / side-by-side 560': () => <MidCountdownFixture width={560} />,
  'mid-countdown / stacked 375': () => <MidCountdownFixture width={375} />,
  'mid-countdown / stacked 320': () => <MidCountdownFixture width={320} />,
}

export default Fixtures
