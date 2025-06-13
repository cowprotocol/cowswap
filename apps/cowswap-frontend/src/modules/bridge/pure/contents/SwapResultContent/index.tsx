import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import { isTruthy } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { StyledTimelinePlusIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../../styles'
import { SwapResultContext } from '../../../types'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

const WinningSolverContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

interface SwapResultContentProps {
  context: SwapResultContext
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SwapResultContentContent({
  context: { winningSolver, receivedAmount, receivedAmountUsd, surplusAmount, surplusAmountUsd },
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
      {contents.filter(isTruthy).map(({ withTimelineDot, label, content }, index) => (
        <ConfirmDetailsItem key={index} withTimelineDot={withTimelineDot} label={label}>
          {content}
        </ConfirmDetailsItem>
      ))}
    </>
  )
}
