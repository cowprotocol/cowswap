import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { FiatAmount, TokenAmount, UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

const CoveredAmount = styled.span`
  text-decoration: line-through;
  opacity: 0.5;
`

const FreeText = styled.span`
  color: var(${UI.COLOR_GREEN});
`

interface TxCostRowProps {
  txCost: CurrencyAmount<Currency>
  txCostUsd: Nullish<CurrencyAmount<Currency>>
  isSponsored: boolean
  /** The part of `txCost` a sponsored order still leaves to the owner — `SolanaTxCost.ownerDeposit`. */
  ownerDeposit?: Nullish<CurrencyAmount<Currency>>
  ownerDepositUsd?: Nullish<CurrencyAmount<Currency>>
  withTimelineDot?: boolean
  isLast?: boolean
  /** Limit form detail-row typography (medium label, secondary value). */
  detailRowStyle?: boolean
  testId?: string
}

interface TxCostTooltipProps {
  isSponsored: boolean
  hasOwnerDeposit: boolean
}

/**
 * What the wallet pays Solana to put the order on-chain — never part of the costs the quote nets out
 * of the trade, so it stands apart from the fee rows and is denominated in SOL rather than in a
 * traded token.
 */
export function TxCostRow({
  txCost,
  txCostUsd,
  isSponsored,
  ownerDeposit,
  ownerDepositUsd,
  withTimelineDot = false,
  isLast = false,
  detailRowStyle = false,
  testId,
}: TxCostRowProps): ReactNode {
  const { t } = useLingui()

  const isFullyCovered = isSponsored && !ownerDeposit
  const shownAmount = isSponsored ? ownerDeposit : txCost
  const shownAmountUsd = isSponsored ? ownerDepositUsd : txCostUsd

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={shownAmount}
      fiatAmount={shownAmountUsd}
      tooltip={<TxCostTooltip isSponsored={isSponsored} hasOwnerDeposit={!!ownerDeposit} />}
      label={t`Tx cost`}
      isLast={isLast}
      detailRowStyle={detailRowStyle}
      testId={testId}
    >
      {isFullyCovered && (
        <>
          <CoveredAmount>
            <TokenAmount amount={txCost} tokenSymbol={txCost.currency} />
            {txCostUsd && (
              <>
                &nbsp;
                <FiatAmount amount={txCostUsd} withParentheses />
              </>
            )}
          </CoveredAmount>
          &nbsp;
          <FreeText>
            <Trans>FREE</Trans>
          </FreeText>
        </>
      )}
    </ReviewOrderModalAmountRow>
  )
}

function TxCostTooltip({ isSponsored, hasOwnerDeposit }: TxCostTooltipProps): ReactNode {
  if (!isSponsored) {
    return (
      <>
        <Trans>
          Solana charges this to put your order on-chain: the transaction fee, and a deposit for the accounts the order
          needs.
        </Trans>
        <br />
        <br />
        <Trans>
          You pay it from your SOL balance when you sign, so it comes on top of the amount you sell rather than out of
          your trade.
        </Trans>
      </>
    )
  }

  if (!hasOwnerDeposit) {
    return (
      <>
        <Trans>
          Putting this order on-chain costs SOL in Solana transaction fees and account deposits, and CoW Swap covers it
          for you.
        </Trans>
        <br />
        <br />
        <Trans>You need no SOL of your own to place this order.</Trans>
      </>
    )
  }

  return (
    <>
      <Trans>CoW Swap covers the Solana transaction fees and the deposits for the accounts your order needs.</Trans>
      <br />
      <br />
      <Trans>
        This deposit opens the wrapped SOL account the sale goes through. The account is yours, so you fund it from your
        SOL balance and get the deposit back when you close or unwrap it.
      </Trans>
    </>
  )
}
