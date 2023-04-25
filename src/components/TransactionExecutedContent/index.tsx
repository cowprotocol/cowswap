import { SupportedChainId } from '@cowprotocol/cow-sdk'
import cowMeditatingSmooth from 'assets/images/cow-meditating-smoooth.svg'
import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { Order } from 'state/orders/actions'
import { DisplayLink } from '../TransactionConfirmationModal'
import { useCoingeckoUsdValue } from 'hooks/useStablecoinPrice'
import { MIN_FIAT_SURPLUS_VALUE } from 'constants/index'
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
  const { formattedFilledAmount, formattedSwappedAmount, surplusAmount, surplusToken } = getExecutedSummaryData(order)

  const fiatValue = useCoingeckoUsdValue(surplusAmount)
  // I think its fine here to use Number because its always USD value
  const showFiatValue = Number(fiatValue?.toExact()) > MIN_FIAT_SURPLUS_VALUE

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
                (<styledEl.StyledFiatAmount amount={fiatValue} />)
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
