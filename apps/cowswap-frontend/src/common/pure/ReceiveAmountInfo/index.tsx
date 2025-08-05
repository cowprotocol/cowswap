import React, { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'

import { getOrderTypeReceiveAmounts, useIsEoaEthFlow } from 'modules/trade'
import { ReceiveAmountInfo } from 'modules/trade/types'

import { FeeItem } from './FeeItem'
import { NetworkFeeItem } from './NetworkFeeItem'
import * as styledEl from './styled'

export interface ReceiveAmountInfoTooltipProps {
  receiveAmountInfo: ReceiveAmountInfo
  subsidyAndBalance: BalanceAndSubsidy
  allowsOffchainSigning: boolean
}

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps): ReactNode {
  const isEoaEthFlow = useIsEoaEthFlow()

  const { receiveAmountInfo, subsidyAndBalance, allowsOffchainSigning } = props
  const {
    isSell,
    costs: {
      partnerFee: { amount: partnerFeeAmount },
      bridgeFee,
    },
  } = receiveAmountInfo
  const { amountAfterFees, amountBeforeFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const hasPartnerFee = !isFractionFalsy(partnerFeeAmount)
  const hasNetworkFee = !isFractionFalsy(networkFeeAmount)
  const hasFee = hasNetworkFee || hasPartnerFee

  const isEoaNotEthFlow = allowsOffchainSigning && !isEoaEthFlow

  return (
    <styledEl.Box>
      <div>
        <span>
          <Trans>Before costs</Trans>
        </span>
        <span>
          <TokenAmount amount={amountBeforeFees} tokenSymbol={amountBeforeFees?.currency} defaultValue="0" />
        </span>
      </div>

      <NetworkFeeItem discount={discount} networkFeeAmount={networkFeeAmount} isSell={isSell} hasFee={hasFee} />

      {(isEoaNotEthFlow || hasPartnerFee) && <FeeItem title="Fee" isSell={isSell} feeAmount={partnerFeeAmount} />}

      {bridgeFee && (
        <FeeItem title="Bridge costs" isSell={isSell} feeAmount={bridgeFee?.amountInIntermediateCurrency} />
      )}

      {!isFractionFalsy(amountAfterFees) && (
        <styledEl.TotalAmount>
          <span>
            <Trans>{!isSell ? 'From' : 'To'}</Trans>
          </span>
          <span>
            <TokenAmount amount={amountAfterFees} tokenSymbol={amountAfterFees.currency} defaultValue="0" />
          </span>
        </styledEl.TotalAmount>
      )}
    </styledEl.Box>
  )
}
