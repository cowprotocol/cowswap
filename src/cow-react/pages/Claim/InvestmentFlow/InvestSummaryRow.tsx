import { ClaimType } from 'state/claim/hooks'
import { calculatePercentage } from 'state/claim/hooks/utils'
import { TokenLogo, InvestAvailableBar, UserMessage } from '@cow/pages/Claim/styled'
import { ClaimWithInvestmentData } from '@cow/pages/Claim/types'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import ImportantIcon from 'assets/cow-swap/important.svg'
import SVG from 'react-inlinesvg'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

export type Props = { claim: ClaimWithInvestmentData }

export function InvestSummaryRow(props: Props): JSX.Element | null {
  const { claim } = props

  const { isFree, type, price, currencyAmount, vCowAmount, cost, investmentCost } = claim

  const symbol = isFree ? '' : (currencyAmount?.currency?.symbol as string)

  const formattedCost = <TokenAmount amount={investmentCost} defaultValue="0" tokenSymbol={investmentCost?.currency} />

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
        <i>
          <TokenAmount amount={vCowAmount} defaultValue="0" tokenSymbol={vCowAmount?.currency} />
        </i>

        {!isFree && (
          <span>
            <b>Investment amount:</b> <i>{formattedCost}</i>
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
            <i>
              {/*TODO: check quoteCurrency*/}
              <TokenAmount amount={price} defaultValue="0" tokenSymbol={price?.quoteCurrency} /> per {symbol}
            </i>
          </span>
        )}
        <span>
          <b>Cost:</b> <i>{isFree ? 'Free!' : formattedCost}</i>
        </span>
        <span>
          <b>Vesting:</b>
          <i>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</i>
        </span>
      </td>
    </tr>
  )
}
