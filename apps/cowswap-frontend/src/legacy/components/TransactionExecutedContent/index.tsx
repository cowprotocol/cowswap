import { SupportedChainId } from '@cowprotocol/cow-sdk'

import cowMeditatingSmooth from 'legacy/assets/images/cow-meditating-smoooth.svg'
import { DisplayLink } from 'legacy/components/TransactionConfirmationModal/DisplayLink'
import { Order } from 'legacy/state/orders/actions'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'
import { parseOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export function TransactionExecutedContent({
  order,
  chainId,
  hash,
}: {
  order: Order
  chainId: SupportedChainId
  hash?: string
}) {
  const parsedOrder = parseOrder(order)
  const { formattedFilledAmount, formattedSwappedAmount } = getExecutedSummaryData(parsedOrder)
  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(parsedOrder)

  return (
    <styledEl.ExecutedWrapper>
      <img src={cowMeditatingSmooth} alt="Cow Smoooth ..." />

      <div>
        <div>
          Traded{' '}
          <styledEl.StyledTokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} /> for
          a total of{' '}
          <styledEl.StyledTokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
        </div>

        {!!surplusAmount && (
          <div>
            You received a surplus of <styledEl.StyledTokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />{' '}
            {showFiatValue && (
              <span>
                (<styledEl.StyledFiatAmount amount={surplusFiatValue} />)
              </span>
            )}{' '}
            on this trade!
          </div>
        )}

        <DisplayLink id={hash} chainId={chainId} />
      </div>
    </styledEl.ExecutedWrapper>
  )
}
