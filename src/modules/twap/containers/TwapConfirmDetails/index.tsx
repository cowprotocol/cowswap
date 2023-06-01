import { useMemo } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'
import { ConfirmModalItem } from 'modules/twap/pure/ConfirmModaltem'

import { RateInfoParams } from 'common/pure/RateInfo'

import * as styledEl from './styled'

type Props = {
  rateInfoParams: RateInfoParams
  allowedSlippage: Percent
}

export function TwapConfirmDetails(props: Props) {
  const { rateInfoParams, allowedSlippage } = props

  const rateInfoWithSlippageAndFees = useMemo(() => {
    // Todo: calculate limit price
    return rateInfoParams
  }, [rateInfoParams])

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />

      {/* Slippage */}
      <ConfirmModalItem>
        <RowSlippage allowedSlippage={allowedSlippage} showSettingOnClick={false} />
      </ConfirmModalItem>

      {/* Limit Price */}
      <ConfirmModalItem>
        <styledEl.StyledRateInfo
          noFiat
          stylized={true}
          rateInfoParams={rateInfoWithSlippageAndFees}
          label="Limit price (incl. fee/lippage)"
        />
      </ConfirmModalItem>
    </styledEl.Wrapper>
  )
}
