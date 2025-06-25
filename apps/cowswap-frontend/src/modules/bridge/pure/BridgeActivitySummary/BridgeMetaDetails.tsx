import { ReactNode } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { FiatWrapper } from './styled'

import { SwapAndBridgeContext } from '../../types'
import { RecipientDisplay } from '../RecipientDisplay'

interface BridgeMetaDetailsProps {
  context: SwapAndBridgeContext
}

export function BridgeMetaDetails({ context }: BridgeMetaDetailsProps): ReactNode {
  const {
    swapResultContext: { surplusAmount, surplusAmountUsd },
    overview: { sourceAmounts, targetCurrency },
    quoteBridgeContext,
  } = context

  const sourceToken = sourceAmounts.buyAmount.currency // intermediate token after swap

  return (
    <>
      {surplusAmount?.greaterThan(0) && (
        <SummaryRow>
          <b>Surplus</b>
          <i>
            <TokenAmount amount={surplusAmount} tokenSymbol={sourceToken} />
            {surplusAmountUsd && (
              <FiatWrapper>
                (<FiatAmount amount={surplusAmountUsd} />)
              </FiatWrapper>
            )}
          </i>
        </SummaryRow>
      )}

      {/*TODO: add bridging execution time, we don't such a value for now*/}

      <SummaryRow>
        <b>Recipient</b>
        <i>
          {quoteBridgeContext?.recipient ? (
            <RecipientDisplay recipient={quoteBridgeContext.recipient} chainId={targetCurrency.chainId} logoSize={16} />
          ) : (
            <ShimmerWrapper />
          )}
        </i>
      </SummaryRow>
    </>
  )
}
