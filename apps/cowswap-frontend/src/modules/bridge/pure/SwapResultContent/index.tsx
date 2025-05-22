import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import { isTruthy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import type { SolverCompetition } from 'modules/orderProgressBar'
import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { StyledTimelinePlusIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../styles'
import { WinningSolverContainer } from '../SwapStopDetails/styled'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

interface SwapResultContentProps {
  winningSolver: SolverCompetition
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null
  surplusAmount: CurrencyAmount<Currency>
  surplusAmountUsd: CurrencyAmount<Token> | null
}

export function SwapResultContentContent({
  winningSolver,
  receivedAmount,
  receivedAmountUsd,
  surplusAmount,
  surplusAmountUsd,
}: SwapResultContentProps) {
  const contents = [
    {
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
    },
    {
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
    },
    surplusAmount.greaterThan(0)
      ? {
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
              +{' '}
              <TokenAmountDisplay
                currencyAmount={surplusAmount}
                displaySymbol
                usdValue={surplusAmountUsd}
                hideTokenIcon={true}
              />
            </SuccessTextBold>
          ),
        }
      : null,
  ]

  return (
    <>
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }) => (
        <ConfirmDetailsItem withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
    </>
  )
}
