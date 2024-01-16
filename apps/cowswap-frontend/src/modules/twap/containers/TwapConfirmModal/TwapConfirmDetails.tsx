import React from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { isAddress } from 'ethers/lib/utils'
import styled from 'styled-components/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReviewOrderModalAmountRow } from 'modules/trade/pure/ReviewOrderModalAmountRow'

import { PartsState } from '../../state/partsStateAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'

const Wrapper = styled.div`
  padding: 10px;
  font-size: 13px;

  > b {
    display: block;
    margin: 0 0 3px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 0 10px;
    `}
  }
`

export type TwapConfirmDetailsProps = {
  startTime: number | undefined
  partDuration: number | undefined
  totalDuration: number | undefined
  partsState: PartsState
}

export const TwapConfirmDetails = React.memo(function TwapConfirmDetails(props: TwapConfirmDetailsProps) {
  const { partDuration, totalDuration, partsState } = props
  const { numberOfPartsValue, inputPartAmount, inputFiatAmount, outputFiatAmount, outputPartAmount } = partsState

  const partsSuffix = ` part (1/${numberOfPartsValue})`
  const amountLabelSuffix = ' amount per' + partsSuffix

  const partDurationDisplay = partDuration ? deadlinePartsDisplay(partDuration, true) : ''
  const totalDurationDisplay = totalDuration ? deadlinePartsDisplay(totalDuration, true) : ''

  const { account } = useWalletInfo()
  const { recipient } = useAdvancedOrdersDerivedState()

  return (
    <Wrapper>
      <b>TWAP order split in {numberOfPartsValue} equal parts</b>

      {/* Sell amount per part */}
      <ReviewOrderModalAmountRow
        amount={inputPartAmount}
        fiatAmount={inputFiatAmount}
        tooltip="This is the amount that will be sold in each part of the TWAP order."
        label={'Sell' + amountLabelSuffix}
      />

      {/* Buy amount per part */}
      <ReviewOrderModalAmountRow
        amount={outputPartAmount}
        fiatAmount={outputFiatAmount}
        tooltip="This is the estimated amount you will receive for each part of the TWAP order."
        label={'Buy' + amountLabelSuffix}
        isAmountAccurate={false}
      />

      {/* Start time */}
      <ConfirmDetailsItem
        tooltip="The first part of your TWAP order will become active as soon as you confirm the order below."
        label={'Start time first' + partsSuffix}
        withArrow={false}
      >
        Now
      </ConfirmDetailsItem>

      {/* Part duration */}
      <ConfirmDetailsItem
        tooltip="The time each part of your TWAP order will remain active."
        label="Part duration"
        withArrow={false}
      >
        {partDurationDisplay}
      </ConfirmDetailsItem>

      {/* Total duration */}
      <ConfirmDetailsItem
        tooltip="The time before your total TWAP order ends."
        label="Total duration"
        withArrow={false}
      >
        {totalDurationDisplay}
      </ConfirmDetailsItem>

      {/* Recipient */}
      {recipient && recipient !== account && (
        <ConfirmDetailsItem
          withArrow={false}
          label="Recipient"
          tooltip="The tokens received from this order will automatically be sent to this address. No need to do a second transaction!"
        >
          <div>
            <span title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</span>
          </div>
        </ConfirmDetailsItem>
      )}
    </Wrapper>
  )
})
