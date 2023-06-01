import { Percent } from '@uniswap/sdk-core'

import { RowSlippage } from 'modules/swap/containers/Row/RowSlippage'

import { RateInfoParams } from 'common/pure/RateInfo'

import * as styledEl from './styled'

type Props = {
  rateInfoParams: RateInfoParams
  allowedSlippage: Percent
}

export function TwapConfirmDetails(props: Props) {
  const { rateInfoParams, allowedSlippage } = props

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />

      {/* Slippage */}
      <RowSlippage allowedSlippage={allowedSlippage} showSettingOnClick={false} />
    </styledEl.Wrapper>
  )
}
