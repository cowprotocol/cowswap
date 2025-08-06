import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { FiatWrapper, StyledFiatAmount, SummaryInnerRow } from '../styled'

interface SurplusRowProps {
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  surplusToken: Nullish<Currency>
  showFiatValue: boolean
  surplusFiatValue: Nullish<CurrencyAmount<Currency>>
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