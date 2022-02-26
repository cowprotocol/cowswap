import { ClaimType } from 'state/claim/hooks'
import { calculatePercentage } from 'state/claim/hooks/utils'
import { TokenLogo, InvestAvailableBar, UserMessage } from 'pages/Claim/styled'
import { ClaimWithInvestmentData } from 'pages/Claim/types'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import { AMOUNT_PRECISION } from 'constants/index'
import ImportantIcon from 'assets/cow-swap/important.svg'
import SVG from 'react-inlinesvg'

export type Props = { claim: ClaimWithInvestmentData }

export function InvestSummaryRow(props: Props): JSX.Element | null {
  const { claim } = props

  const { isFree, type, price, investCurrency, vCowAmount, cost, investmentCost } = claim

  const symbol = isFree ? '' : (investCurrency?.symbol as string)

  const formattedCost = formatSmartLocaleAware(investmentCost, AMOUNT_PRECISION) || '0'
  const formattedCostMaxPrecision = investmentCost
    ? `${formatMax(investmentCost, investCurrency?.decimals)} ${symbol}`
    : ''

  const percentage = investmentCost && cost && calculatePercentage(investmentCost, cost)

  return (
    <tr>
      <td data-title="Type of Claim">
        {isFree ? (
          <>
            <CowProtocolLogo size={42} />
            <span>
              <b>{ClaimType[type]}</b>
            </span>
          </>
        ) : (
          <>
            <TokenLogo symbol={symbol} size={42} />
            <CowProtocolLogo size={42} />
            <span>
              <b>Buy vCOW</b>
              <i>with {symbol}</i>
            </span>
          </>
        )}
      </td>

      <td data-title="Amount">
        <i title={`${formatMax(vCowAmount, vCowAmount?.currency.decimals)} vCOW`}>
          {formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION) || '0'} vCOW
        </i>

        {!isFree && (
          <span>
            <b>Investment amount:</b>{' '}
            <i title={formattedCostMaxPrecision}>
              {formattedCost} {symbol}
            </i>
            <InvestAvailableBar percentage={Number(percentage?.toFixed(2))} />
            {percentage?.lessThan(ONE_HUNDRED_PERCENT) && (
              <UserMessage variant="info">
                <SVG src={ImportantIcon} description="Information" />
                <span>
                  Note: You will <b>not be able</b> to invest anymore after claiming.
                </span>
              </UserMessage>
            )}
          </span>
        )}
      </td>

      <td data-title="Details">
        {!isFree && (
          <span>
            <b>Price:</b>{' '}
            <i title={formatMax(price?.invert())}>
              {formatSmartLocaleAware(price?.invert()) || '0'} vCOW per {symbol}
            </i>
          </span>
        )}
        <span>
          <b>Cost:</b> <i title={formattedCostMaxPrecision}>{isFree ? 'Free!' : `${formattedCost} ${symbol}`}</i>
        </span>
        <span>
          <b>Vesting:</b>
          <i>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</i>
        </span>
      </td>
    </tr>
  )
}
