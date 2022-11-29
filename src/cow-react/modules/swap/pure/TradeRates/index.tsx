import React from 'react'
import * as styledEl from './styled'
import { InfoIcon } from 'components/InfoIcon'
import { SUBSIDY_INFO_MESSAGE } from 'components/CowSubsidyModal/constants'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import TradeGp from 'state/swap/TradeGp'
import { RowDeadline } from '@cow/modules/swap/containers/Row/RowDeadline'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { TradeBasicDetails } from '@cow/modules/swap/containers/TradeBasicDetails'
import { genericPropsChecker } from '@cow/utils/genericPropsChecker'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

const SUBSIDY_INFO_MESSAGE_EXTENDED =
  SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'

export interface TradeRatesProps {
  trade: TradeGp | undefined
  isExpertMode: boolean
  allowedSlippage: Percent
  allowsOffchainSigning: boolean
  userAllowedSlippage: Percent | string
  isFeeGreater: boolean
  discount: number
  fee: CurrencyAmount<Currency> | null
  rateInfoParams: RateInfoParams
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const {
    isFeeGreater,
    fee,
    trade,
    isExpertMode,
    allowsOffchainSigning,
    userAllowedSlippage,
    discount,
    rateInfoParams,
  } = props
  const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee
  const showRowDeadline = !!trade

  return (
    <styledEl.Box>
      {showPrice && <styledEl.StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />}
      {/* SLIPPAGE & FEE */}
      {showTradeBasicDetails && (
        <TradeBasicDetails
          allowedSlippage={userAllowedSlippage}
          isExpertMode={isExpertMode}
          allowsOffchainSigning={allowsOffchainSigning}
          trade={trade}
          fee={fee}
        />
      )}
      {/* TRANSACTION DEADLINE */}
      {showRowDeadline && <RowDeadline />}
      {/* DISCOUNTS */}
      <styledEl.Row>
        <div>
          <span>Fees discount</span>
          <InfoIcon content={SUBSIDY_INFO_MESSAGE_EXTENDED} />
        </div>
        <div>
          <styledEl.Discount onClick={openCowSubsidyModal}>{discount}% discount</styledEl.Discount>
        </div>
      </styledEl.Row>
    </styledEl.Box>
  )
}, genericPropsChecker)
