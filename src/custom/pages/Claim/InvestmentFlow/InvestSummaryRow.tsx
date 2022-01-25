import { ClaimType } from 'state/claim/hooks'
import { calculatePercentage } from 'state/claim/hooks/utils'
import { TokenLogo, InvestAvailableBar } from 'pages/Claim/styled'
import { ClaimWithInvestmentData } from 'pages/Claim/types'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatSmartLocaleAware } from 'utils/format'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import { AMOUNT_PRECISION } from 'constants/index'

export type Props = { claim: ClaimWithInvestmentData }

export function InvestSummaryRow(props: Props): JSX.Element | null {
  const { claim } = props

  const { isFree, type, price, currencyAmount, vCowAmount, cost, investmentCost } = claim

  const symbol = isFree ? '' : (currencyAmount?.currency?.symbol as string)

  const formattedCost = formatSmartLocaleAware(investmentCost, AMOUNT_PRECISION) || '0'

  const percentage = investmentCost && cost && calculatePercentage(investmentCost, cost)

  return (
    <tr>
      <td>
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

      <td>
        <i>{formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION) || '0'} vCOW</i>

        {!isFree && (
          <span>
            <b>Investment amount:</b>{' '}
            <i>
              {formattedCost} {symbol}
            </i>
            <InvestAvailableBar percentage={Number(percentage?.toFixed(2))} />
            {percentage?.lessThan(ONE_HUNDRED_PERCENT) && (
              <small>
                Note: You will <b>not be able</b> to invest anymore after claiming.
              </small>
            )}
          </span>
        )}
      </td>

      <td>
        {!isFree && (
          <span>
            <b>Price:</b>{' '}
            <i>
              {formatSmartLocaleAware(price) || '0'} vCOW per {symbol}
            </i>
          </span>
        )}
        <span>
          <b>Cost:</b> <i>{isFree ? 'Free!' : `${formattedCost} ${symbol}`}</i>
        </span>
        <span>
          <b>Vesting:</b>
          <i>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</i>
        </span>
      </td>
    </tr>
  )
}
