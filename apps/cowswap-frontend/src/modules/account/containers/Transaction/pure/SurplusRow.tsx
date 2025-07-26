import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { FiatWrapper, StyledFiatAmount, SummaryInnerRow } from '../styled'

interface SurplusRowProps {
  surplusAmount: CurrencyAmount<unknown> | undefined
  surplusToken: unknown
  showFiatValue: boolean
  surplusFiatValue: unknown
}

export function SurplusRow({
  surplusAmount,
  surplusToken,
  showFiatValue,
  surplusFiatValue,
}: SurplusRowProps): ReactNode {
  if (!surplusAmount?.greaterThan(0)) return null

  return (
    <SummaryInnerRow>
      <b>Surplus</b>
      <i>
        <TokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
        {showFiatValue && (
          <FiatWrapper>
            (<StyledFiatAmount amount={surplusFiatValue} />)
          </FiatWrapper>
        )}
      </i>
    </SummaryInnerRow>
  )
}