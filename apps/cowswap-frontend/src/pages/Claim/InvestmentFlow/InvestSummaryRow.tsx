import ImportantIcon from '@cowprotocol/assets/cow-swap/important.svg'
import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import { ClaimType } from 'legacy/state/claim/hooks/types'
import { calculatePercentage } from 'legacy/state/claim/hooks/utils'
import { ClaimWithInvestmentData } from 'legacy/state/claim/types'

import { TokenLogo, InvestAvailableBar, UserMessage } from 'pages/Claim/styled'

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
