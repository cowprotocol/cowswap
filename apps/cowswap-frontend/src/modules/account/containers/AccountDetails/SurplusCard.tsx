import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import QuestionHelper, { QuestionWrapper } from 'legacy/components/QuestionHelper'

import { useUsdAmount } from 'modules/usdAmount'

import { UI } from 'common/constants/theme'
import { useTotalSurplus } from 'common/state/totalSurplusState'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { InfoCard } from './styled'

export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const showSurplusAmount = surplusAmount && surplusAmount.greaterThan(0)
  const surplusUsdAmount = useUsdAmount(showSurplusAmount ? surplusAmount : undefined).value
  const nativeSymbol = useNativeCurrency()?.symbol || 'ETH'

  const Wrapper = styled.div`
    margin: 12px auto 24px;
    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: 1fr;
    gap: 24px;
    box-sizing: border-box;
    padding: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: flex;
      flex-flow: column wrap;
      padding: 0;
    `}

    ${InfoCard} {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: ${({ theme }) => theme.gradient2};
      border-radius: 16px;
      padding: 20px 26px 26px;
      min-height: 190px;
      width: 100%;
      max-width: 100%;
      margin: 0;
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
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
    }

    ${InfoCard} > div > span > i,
    ${InfoCard} > div > a,
    ${InfoCard} > div > span > p {
      display: flex;
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 1.1;
      width: 100%;
      text-align: center;
      justify-content: center;
      align-items: center;
      color: ${({ theme }) => transparentize(0.3, theme.text1)};
    }

    ${InfoCard} > div > span > p {
      color: var(${UI.COLOR_TEXT1});
    }

    ${InfoCard} > div > span > b {
      font-size: 28px;
      font-weight: bold;
      color: ${({ theme }) => theme.success};
      width: 100%;
      text-align: center;
      margin: 12px auto 0;
      word-break: break-all;
    }

    ${InfoCard} > div > a {
      margin: 20px auto 0;
    }

    ${InfoCard} > div > small {
      font-size: 15px;
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
            <i>
              Your total surplus{' '}
              <QuestionHelper
                text={`The total surplus CoW Swap has generated for you in ${nativeSymbol} across all your trades since March 2023`}
              />
            </i>
          </span>
          <span>
            {isLoading ? (
              <p>Loading...</p>
            ) : showSurplusAmount ? (
              <b>
                +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
              </b>
            ) : (
              <p>No surplus for the given time period</p>
            )}
          </span>
          <small>{surplusUsdAmount && <FiatAmount amount={surplusUsdAmount} accurate={false} />}</small>
        </div>
        <div>
          <ExternalLink href={'https://blog.cow.fi/announcing-cow-swap-surplus-notifications-f679c77702ea'}>
            Learn about surplus on CoW Swap ↗
          </ExternalLink>
        </div>
      </InfoCard>
    </Wrapper>
  )
}
