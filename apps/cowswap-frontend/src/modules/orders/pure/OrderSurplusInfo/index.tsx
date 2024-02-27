import * as styledEl from './styled'

import { SurplusData } from '../../../../common/hooks/useGetSurplusFiatValue'

interface ExecutedSummaryProps {
  surplusData: SurplusData
}

export function OrderSurplusInfo({ surplusData }: ExecutedSummaryProps) {
  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = surplusData

  return (
    <>
      {!!surplusAmount && (
        <styledEl.SurplusWrapper>
          <span>Order surplus: </span>
          <styledEl.SurplusAmount>
            <styledEl.StyledTokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
            {showFiatValue && (
              <styledEl.FiatWrapper>
                (<styledEl.StyledFiatAmount amount={surplusFiatValue} />)
              </styledEl.FiatWrapper>
            )}
          </styledEl.SurplusAmount>
        </styledEl.SurplusWrapper>
      )}
    </>
  )
}
