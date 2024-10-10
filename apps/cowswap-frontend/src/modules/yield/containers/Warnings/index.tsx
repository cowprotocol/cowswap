import React from 'react'

import { useReceiveAmountInfo } from 'modules/trade'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'
import { useShouldZeroApprove } from 'modules/zeroApproval'

import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'

export function Warnings() {
  const receiveAmountInfo = useReceiveAmountInfo()
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount
  const shouldZeroApprove = useShouldZeroApprove(inputAmountWithSlippage)

  return (
    <>
      {shouldZeroApprove && <ZeroApprovalWarning currency={inputAmountWithSlippage?.currency} />}
      <HighFeeWarning />
    </>
  )
}
