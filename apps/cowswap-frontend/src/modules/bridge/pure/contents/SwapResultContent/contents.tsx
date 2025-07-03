import { ReactNode } from 'react'

import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import { buildPriceFromCurrencyAmounts } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import type { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { ReceiveAmountTitle } from 'modules/trade'

import type { SolverCompetition } from 'common/types/soverCompetition'

import { StyledTimelinePlusIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../../styles'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

interface ContentConfig {
  withTimelineDot?: boolean
  label: ReactNode
  content: ReactNode
}

const WinningSolverContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export function getReceivedContent(
  receivedAmount: CurrencyAmount<Currency>,
  receivedAmountUsd: CurrencyAmount<Token> | null,
): ContentConfig {
  return {
    label: (
      <ReceiveAmountTitle>
        <b>Received</b>
      </ReceiveAmountTitle>
    ),
    content: (
      <b>
        <TokenAmountDisplay currencyAmount={receivedAmount} displaySymbol usdValue={receivedAmountUsd} />
      </b>
    ),
  }
}

export function getExecPriceContent(
  sellAmount: CurrencyAmount<Currency>,
  receivedAmount: CurrencyAmount<Currency>,
): ContentConfig {
  const price = buildPriceFromCurrencyAmounts(sellAmount, receivedAmount)

  return {
    withTimelineDot: true,
    label: <span>Exec. price</span>,
    content: (
      <>
        1 {<TokenSymbol token={sellAmount.currency} />} ={' '}
        <TokenAmount amount={price} tokenSymbol={receivedAmount.currency} />
      </>
    ),
  }
}

export function getSolverContent(winningSolver: SolverCompetition): ContentConfig {
  return {
    withTimelineDot: true,
    label: 'Winning solver',
    content: (
      <WinningSolverContainer>
        <b>{winningSolver.displayName || winningSolver.solver}</b>
        <img
          src={winningSolver.image || AMM_LOGOS[winningSolver.solver]?.src || AMM_LOGOS.default.src}
          alt={`${winningSolver.solver} logo`}
          width="16"
          height="16"
        />
      </WinningSolverContainer>
    ),
  }
}

export function getSurplusConfig(
  surplusAmount: CurrencyAmount<Currency>,
  surplusAmountUsd: CurrencyAmount<Token> | null,
): ContentConfig {
  return {
    label: (
      <ReceiveAmountTitle
        icon={
          <TimelineIconCircleWrapper>
            <StyledTimelinePlusIcon src={PlusIcon} />
          </TimelineIconCircleWrapper>
        }
      >
        <SuccessTextBold>Surplus received</SuccessTextBold>
      </ReceiveAmountTitle>
    ),
    content: (
      <SuccessTextBold>
        <TokenAmountDisplay
          currencyAmount={surplusAmount}
          displaySymbol
          usdValue={surplusAmountUsd}
          hideTokenIcon={true}
        >
          +
        </TokenAmountDisplay>
      </SuccessTextBold>
    ),
  }
}
