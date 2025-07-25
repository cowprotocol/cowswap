import { ReactNode } from 'react'

import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import type { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'
import type { SolverCompetition } from 'common/types/soverCompetition'

import { StyledTimelinePlusIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../../styles'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

const WinningSolverContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export function ReceivedContent({
  receivedAmount,
  receivedAmountUsd,
}: {
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null
}): ReactNode {
  return (
    <ConfirmDetailsItem
      label={
        <ReceiveAmountTitle>
          <b>Received</b>
        </ReceiveAmountTitle>
      }
    >
      <b>
        <TokenAmountDisplay currencyAmount={receivedAmount} displaySymbol usdValue={receivedAmountUsd} />
      </b>
    </ConfirmDetailsItem>
  )
}

export function ExecPriceContent({ rateInfoParams }: { rateInfoParams: RateInfoParams }): ReactNode {
  return (
    <ConfirmDetailsItem withTimelineDot label={<span>Exec. price</span>}>
      <span>
        <RateInfo noLabel rateInfoParams={rateInfoParams} />
      </span>
    </ConfirmDetailsItem>
  )
}

export function SolverContent({ winningSolver }: { winningSolver: SolverCompetition }): ReactNode {
  return (
    <ConfirmDetailsItem withTimelineDot label="Winning solver">
      <WinningSolverContainer>
        <b>{winningSolver.displayName || winningSolver.solver}</b>
        <img
          src={winningSolver.image || AMM_LOGOS[winningSolver.solver]?.src || AMM_LOGOS.default.src}
          alt={`${winningSolver.solver} logo`}
          width="16"
          height="16"
        />
      </WinningSolverContainer>
    </ConfirmDetailsItem>
  )
}

export function SurplusConfig({
  surplusAmount,
  surplusAmountUsd,
}: {
  surplusAmount: CurrencyAmount<Currency>
  surplusAmountUsd: CurrencyAmount<Token> | null
}): ReactNode {
  return (
    <ConfirmDetailsItem
      label={
        <ReceiveAmountTitle
          icon={
            <TimelineIconCircleWrapper>
              <StyledTimelinePlusIcon src={PlusIcon} />
            </TimelineIconCircleWrapper>
          }
        >
          <SuccessTextBold>Surplus received</SuccessTextBold>
        </ReceiveAmountTitle>
      }
    >
      <SuccessTextBold>
        <TokenAmountDisplay currencyAmount={surplusAmount} displaySymbol usdValue={surplusAmountUsd} hideTokenIcon>
          +
        </TokenAmountDisplay>
      </SuccessTextBold>
    </ConfirmDetailsItem>
  )
}
