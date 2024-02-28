import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { FiatAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowDeadline } from 'modules/swap/containers/Row/RowDeadline'
import { TradeBasicDetails } from 'modules/swap/containers/TradeBasicDetails'
import { useUsdAmount } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { RateInfoParams } from 'common/pure/RateInfo'
import { TradeDetailsAccordion } from 'common/pure/TradeDetailsAccordion'

import * as styledEl from './styled'

// const SUBSIDY_INFO_MESSAGE_EXTENDED =
//   SUBSIDY_INFO_MESSAGE + '. Click on the discount button on the right for more info.'

export interface TradeRatesProps {
  trade: TradeGp | undefined
  allowedSlippage: Percent
  allowsOffchainSigning: boolean
  userAllowedSlippage: Percent | string
  isFeeGreater: boolean
  discount: number
  fee: CurrencyAmount<Currency> | null
  rateInfoParams: RateInfoParams
  priceLabel?: string
  isReviewSwap?: boolean
  children?: JSX.Element
}

export const TradeRates = React.memo(function (props: TradeRatesProps) {
  const {
    isFeeGreater,
    fee,
    trade,
    allowsOffchainSigning,
    userAllowedSlippage,
    // discount,
    rateInfoParams,
    isReviewSwap = false,
    children,
  } = props
  // const openCowSubsidyModal = useOpenModal(ApplicationModal.COW_SUBSIDY)

  const showPrice = !!trade
  const showTradeBasicDetails = (isFeeGreater || trade) && fee
  const showRowDeadline = !!trade

  const feeFiatValue = useUsdAmount(fee).value
  const partnerFeeFiatValue = useUsdAmount(trade?.partnerFeeAmount).value

  const feeFiatTotal = useSafeMemo(() => {
    return partnerFeeFiatValue && feeFiatValue ? partnerFeeFiatValue.add(feeFiatValue) : feeFiatValue
  }, [partnerFeeFiatValue, feeFiatValue])

  if (!trade?.inputAmount && !trade?.outputAmount) return null

  return (
    <TradeDetailsAccordion
      rateInfo={showPrice && <styledEl.StyledRateInfo noLabel={true} stylized={true} rateInfoParams={rateInfoParams} />}
      feeSummary={showTradeBasicDetails && <FiatAmount amount={feeFiatTotal} />}
    >
      <styledEl.Box>
        {showTradeBasicDetails && (
          <TradeBasicDetails
            allowedSlippage={userAllowedSlippage}
            allowsOffchainSigning={allowsOffchainSigning}
            trade={trade}
            fee={fee}
            isReviewSwap={isReviewSwap}
          />
        )}
        {showRowDeadline && <RowDeadline />}
        {children}
      </styledEl.Box>
    </TradeDetailsAccordion>
  )
}, genericPropsChecker)
