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
  withTimelineDot?: boolean
  isLast?: boolean
  /** Limit form detail-row typography (medium label, secondary value). */
  detailRowStyle?: boolean
  testId?: string
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
  withTimelineDot = false,
  isLast = false,
  detailRowStyle = false,
  testId,
}: TxCostRowProps): ReactNode {
  const { t } = useLingui()

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      amount={isSponsored ? undefined : txCost}
      fiatAmount={isSponsored ? undefined : txCostUsd}
      tooltip={
        isSponsored ? (
          <>
            <Trans>
              Putting this order on-chain costs SOL in Solana transaction fees and account deposits, and CoW Swap covers
              it for you.
            </Trans>
            <br />
            <br />
            <Trans>You need no SOL of your own to place this order.</Trans>
          </>
        ) : (
          <>
            <Trans>
              Solana charges this to put your order on-chain: the transaction fee, and a deposit for the accounts the
              order needs.
            </Trans>
            <br />
            <br />
            <Trans>
              You pay it from your SOL balance when you sign, so it comes on top of the amount you sell rather than out
              of your trade.
            </Trans>
          </>
        )
      }
      label={t`Tx cost`}
      isLast={isLast}
      detailRowStyle={detailRowStyle}
      testId={testId}
    >
      {isSponsored && (
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
