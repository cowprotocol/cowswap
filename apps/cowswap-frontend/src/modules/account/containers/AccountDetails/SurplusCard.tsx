import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  ExternalLink,
  FiatAmount,
  HelpTooltip,
  Media,
  QuestionTooltipIconWrapper,
  TokenAmount,
  UI,
} from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { useUsdAmount } from 'modules/usdAmount'

import { useTotalSurplus } from 'common/state/totalSurplusState'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { InfoCard } from './styled'

const DEFAULT_START_DATE = 'March 2023'
const ARBITRUM_ONE_START_DATE = 'May 2024'
const BASE_START_DATE = 'December 2024'
const POLYGON_START_DATE = 'June 2025'
const AVALANCHE_START_DATE = 'June 2025'

const START_DATE: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: DEFAULT_START_DATE,
  [SupportedChainId.GNOSIS_CHAIN]: DEFAULT_START_DATE,
  [SupportedChainId.ARBITRUM_ONE]: ARBITRUM_ONE_START_DATE,
  [SupportedChainId.BASE]: BASE_START_DATE,
  [SupportedChainId.SEPOLIA]: DEFAULT_START_DATE,
  [SupportedChainId.POLYGON]: POLYGON_START_DATE,
  [SupportedChainId.AVALANCHE]: AVALANCHE_START_DATE,
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const showSurplusAmount = surplusAmount && surplusAmount.greaterThan(0)
  const surplusUsdAmount = useUsdAmount(showSurplusAmount ? surplusAmount : undefined).value
  const native = useNativeCurrency()
  const nativeSymbol = native.symbol || 'ETH'
  const startDate = START_DATE[native.chainId as SupportedChainId]

  const Wrapper = styled.div`
    margin: 12px auto 24px;
    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: 1fr;
    grid-template-rows: max-content;
    gap: 24px;
    box-sizing: border-box;
    padding: 0;
    color: inherit;

    ${Media.upToSmall()} {
      display: flex;
      flex-flow: column wrap;
      padding: 0;
    }

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
      color: inherit;
    }

    ${InfoCard} > div {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      color: inherit;

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
      color: inherit;
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
      color: inherit;
    }

    ${InfoCard} > div > span > i {
      opacity: 0.6;
      transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

      &:hover {
        opacity: 1;
      }
    }

    ${InfoCard} > div > span > p {
      color: inherit;
    }

    ${InfoCard} > div > span > b {
      font-size: 28px;
      font-weight: bold;
      color: var(${UI.COLOR_SUCCESS});
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
      color: ${({ theme }) => transparentize(theme.text, 0.5)};
      margin: 3px auto 0;
    }

    ${QuestionTooltipIconWrapper} {
      opacity: 0.5;
      transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

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
              <HelpTooltip
                text={`The total surplus CoW Swap has generated for you in ${nativeSymbol} across all your trades since ${startDate}.`}
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
          <ExternalLink href={'https://cow.fi/learn/announcing-cow-swap-surplus-notifications'}>
            Learn about surplus on CoW Swap ↗
          </ExternalLink>
        </div>
      </InfoCard>
    </Wrapper>
  )
}
