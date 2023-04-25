import { SupportedChainId } from '@cowprotocol/cow-sdk'
import cowMeditatingSmooth from 'assets/images/cow-meditating-smoooth.svg'
import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { Order } from 'state/orders/actions'
import { DisplayLink } from '../TransactionConfirmationModal'
import * as styledEl from './styled'
import { useGetSurplusData } from '@cow/common/hooks/useGetSurplusFiatValue'

export function TransactionExecutedContent({
  order,
  chainId,
  hash,
}: {
  order: Order
  chainId: SupportedChainId
  hash?: string
}) {
  const { formattedFilledAmount, formattedSwappedAmount } = getExecutedSummaryData(order)
  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(order)

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
