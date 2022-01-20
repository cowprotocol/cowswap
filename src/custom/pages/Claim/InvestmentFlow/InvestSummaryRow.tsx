import { ClaimType } from 'state/claim/hooks'
import { calculatePercentage } from 'state/claim/hooks/utils'
import { TokenLogo } from 'pages/Claim/styled'
import { ClaimWithInvestmentData } from 'pages/Claim/types'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

export type Props = { claim: ClaimWithInvestmentData }

export function InvestSummaryRow(props: Props): JSX.Element | null {
  const { claim } = props

  const { isFree, type, price, currencyAmount, vCowAmount, cost, investmentCost } = claim

  const symbol = isFree ? '' : (currencyAmount?.currency?.symbol as string)

  const formattedCost =
    formatSmart(investmentCost, AMOUNT_PRECISION, { thousandSeparator: true, isLocaleAware: true }) || '0'
  const percentage = investmentCost && cost && calculatePercentage(investmentCost, cost)

  return (
    <tr>
      <td>
        {isFree ? (
          <b>{ClaimType[type]}</b>
        ) : (
          <>
            <TokenLogo symbol={symbol} size={32} />
            <CowProtocolLogo size={32} />
            <span>
              <b>Buy vCOW</b>
              <i>with {symbol}</i>
            </span>
          </>
        )}
      </td>

      <td>
        {!isFree && (
          <span>
            <b>Investment amount:</b>{' '}
            <i>
              {formattedCost} {symbol} ({percentage}% of available investing opportunity)
            </i>
          </span>
        )}
        <span>
          <b>Amount to receive:</b>
          <i>{formatSmart(vCowAmount) || '0'} vCOW</i>
        </span>
      </td>

      <td>
        {!isFree && (
          <span>
            <b>Price:</b>{' '}
            <i>
              {formatSmart(price) || '0'} vCoW per {symbol}
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
