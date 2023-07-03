import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import QuestionHelper, { QuestionWrapper } from 'legacy/components/QuestionHelper'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { ExternalLink } from 'legacy/theme'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'
import { useTotalSurplus } from 'common/state/totalSurplusState'

import { InfoCard } from './styled'

export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const surplusUsdAmount = useHigherUSDValue(surplusAmount)

  const Wrapper = styled.div`
    margin: 0 auto 10px;
    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: repeat(2, 50%);
    gap: 10px;

    ${InfoCard} {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: ${({ theme }) => theme.gradient2};
      border-radius: 16px;
      padding: 26px;
      min-height: 210px;
      width: 100%:
      max-width: 100%;
    }

    ${InfoCard} > div {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;

      &:first-child {
        margin: 20px auto 0;
      }

      &:last-child {
        margin: auto 0 0;
      }
    }

    ${InfoCard} > div > span {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ${InfoCard} > div > span > i,
    ${InfoCard} > div > a {
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 1.1;
      width: 100%;
      text-align: center;
      color: ${({ theme }) => transparentize(0.3, theme.text1)};
    }

    ${InfoCard} > div > span > b {
      font-size: 28px;
      font-weight: bold;
      color: ${({ theme }) => theme.success};
      width: 100%;
      text-align: center;
      margin: 20px auto 0;
      word-break: break-all;
    }

    ${InfoCard} > div > a {
      margin: 20px auto 0;
    }

    ${InfoCard} > div > small {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.1;
      color: ${({ theme }) => transparentize(0.5, theme.text1)};
      margin: 3px auto 0;
    }

    ${QuestionWrapper} {
      opacity: 0.5;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
      }
    }
  `

  return (
    <Wrapper>
      <InfoCard>
        <div>
          <span>
            <i>Your total surplus</i> <QuestionHelper text={'TODO: insert tooltip'} />
          </span>
          <span>
            {isLoading
              ? 'Loading...'
              : surplusAmount && (
                  <b>
                    +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
                  </b>
                )}
            {!surplusAmount && 'No surplus for the given time period'}
          </span>
          <small>{surplusUsdAmount && <FiatAmount amount={surplusUsdAmount} accurate={false} />}</small>
        </div>
        <div>
          {/* TODO: add correct link */}
          <ExternalLink href={'https://swap.cow.fi'}>Learn about surplus on CoW Swap ↗</ExternalLink>
        </div>
      </InfoCard>
    </Wrapper>
  )
}
