import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { NewModal, NewModalProps } from 'common/pure/NewModal'

import { CountdownDigits } from './CountdownDigits'
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
    <NewModal {...rest} contentPadding="56px 16px 16px">
      <HeroGroup>
        <Hero>
          <TimerColumn>
            <CountdownDigits remainingMs={remainingMs} />
            <TimerLabel>
              {isExpired ? (
                <Trans>The signing window has closed. Cancel and try again with a fresh quote.</Trans>
              ) : (
                <Trans>To sign the transaction in your wallet</Trans>
              )}
            </TimerLabel>
          </TimerColumn>
          <MilkGlass fraction={durationMs > 0 ? remainingMs / durationMs : 0} />
        </Hero>

        <AmountsRow>
          <TokenLogo token={inputAmount?.currency} size={20} />
          <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
          <Trans>for at least</Trans>
          <TokenLogo token={outputAmount?.currency} size={20} />
          <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
        </AmountsRow>
      </HeroGroup>
    </NewModal>
  )
}

const HeroGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  border-radius: 21px;
  overflow: hidden;
`

const Hero = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 28px;
  width: 100%;
  min-height: 260px;
  padding: 24px 28px;
  background: var(${UI.COLOR_BLUE_300_PRIMARY});
  color: var(${UI.COLOR_TEXT});
`

const TimerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 204px;
`

const TimerLabel = styled.span`
  font-size: 13px;
  line-height: 18px;
  width: 100%;
`

const AmountsRow = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: 10px 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 13px;
  line-height: 18px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`
