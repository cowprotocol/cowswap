import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import iconArrowSrc from 'assets/icon/arrow.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { NewModal, NewModalProps } from 'common/pure/NewModal'

import { MilkGlass } from './MilkGlass'
import { useRemainingMs } from './useRemainingMs'

export type SolanaSigningCountdownProps = NewModalProps & {
  /** Epoch ms when the transaction's blockhash is expected to die. */
  expiresAt: number
  /** Full signing window in ms, for the milk level. */
  durationMs: number
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
}

export function SolanaSigningCountdown(props: SolanaSigningCountdownProps): ReactNode {
  const { expiresAt, durationMs, inputAmount, outputAmount, ...rest } = props

  const remainingMs = useRemainingMs(expiresAt)
  const isExpired = remainingMs === 0

  return (
    <NewModal {...rest}>
      <CountdownPanel>
        <TimerColumn>
          <TimerValue>{formatRemaining(remainingMs)}</TimerValue>
          <TimerLabel>
            {isExpired ? (
              <Trans>The signing window has closed. Cancel and try again with a fresh quote.</Trans>
            ) : (
              <Trans>To sign the transaction in your wallet</Trans>
            )}
          </TimerLabel>
        </TimerColumn>
        <MilkGlass fraction={durationMs > 0 ? remainingMs / durationMs : 0} />
      </CountdownPanel>

      <AmountsRow>
        <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
        <ArrowRight src={iconArrowSrc} />
        <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
      </AmountsRow>
    </NewModal>
  )
}

function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const CountdownPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  margin-top: 56px;
  padding: 40px 32px;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background: var(${UI.COLOR_BLUE_300_PRIMARY});
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
`

const TimerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
`

const TimerValue = styled.strong`
  font-size: 56px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`

const TimerLabel = styled.span`
  font-size: 15px;
  line-height: 1.4;
`

const AmountsRow = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin: 24px 0;
`

const ArrowRight = styled(SVG)`
  --size: 12px;
  width: var(--size);
  height: var(--size);

  > path {
    fill: currentColor;
  }
`
