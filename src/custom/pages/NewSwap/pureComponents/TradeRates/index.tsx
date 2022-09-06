import React from 'react'
import * as styledEl from './styled'
import { InfoIcon } from 'components/InfoIcon'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { Price } from 'pages/Swap/components/Price'
import TradeGp from 'state/swap/TradeGp'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import { RowSlippage } from 'components/swap/TradeSummary/RowSlippage'
import { Percent } from '@uniswap/sdk-core'
import { genericPropsChecker } from 'pages/NewSwap/propsChecker'

const GASLESS_FEE_TOOLTIP_MSG =
  'On CoW Swap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

const SUBSIDY_INFO_MESSAGE_EXTENDED =
  SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'

export interface TradeRatesProps {
  isExpertMode: boolean
  allowedSlippage: Percent
  trade: TradeGp | undefined
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const { trade, isExpertMode, allowedSlippage } = props
  const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  return (
    <styledEl.Box>
      {trade && (
        <styledEl.Row>
          <Price trade={trade} />
        </styledEl.Row>
      )}
      {!isExpertMode && !allowedSlippage.equalTo(INITIAL_ALLOWED_SLIPPAGE_PERCENT) && (
        <styledEl.Row>
          <RowSlippage allowedSlippage={allowedSlippage} fontSize={12} fontWeight={400} rowHeight={24} />
        </styledEl.Row>
      )}
      <styledEl.Row>
        <div>
          <span>Fees (incl. gas costs)</span>
          <InfoIcon content={GASLESS_FEE_TOOLTIP_MSG} />
        </div>
        <div>
          <span>
            0.0007 USDC <styledEl.LightText>({'≈$ <0.01'})</styledEl.LightText>
          </span>
        </div>
      </styledEl.Row>
      <styledEl.Row>
        <div>
          <span>Fees discount</span>
          <InfoIcon content={SUBSIDY_INFO_MESSAGE_EXTENDED} />
        </div>
        <div>
          <styledEl.Discount onClick={openCowSubsidyModal}>0% discount</styledEl.Discount>
        </div>
      </styledEl.Row>
    </styledEl.Box>
  )
}, genericPropsChecker)
