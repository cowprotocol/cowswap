import React, { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

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

function hasValidFee(amount: React.ComponentProps<typeof FeeItem>['feeAmount'], bps: number | undefined): boolean {
  return !!amount && !!bps && !amount.equalTo(0)
}

export function ReceiveAmountInfoTooltip(props: ReceiveAmountInfoTooltipProps): ReactNode {
  const isEoaEthFlow = useIsEoaEthFlow()

  const { receiveAmountInfo, subsidyAndBalance, allowsOffchainSigning } = props
  const {
    isSell,
    costs: {
      partnerFee: { amount: partnerFeeAmount, bps: partnerFeeBps },
      protocolFee,
      bridgeFee,
    },
  } = receiveAmountInfo
  const { amountAfterFees, amountBeforeFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const protocolFeeAmount = protocolFee?.amount
  const protocolFeeBps = protocolFee?.bps

  const hasPartnerFee = hasValidFee(partnerFeeAmount, partnerFeeBps)
  const hasProtocolFee = hasValidFee(protocolFeeAmount, protocolFeeBps)
  const hasAnyFee = hasPartnerFee || hasProtocolFee
  const hasNetworkFee = !isFractionFalsy(networkFeeAmount)
  const hasFee = hasNetworkFee || hasAnyFee

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

      {hasProtocolFee && <FeeItem title={t`Protocol fee`} isSell={isSell} feeAmount={protocolFeeAmount} />}

      {hasPartnerFee && <FeeItem title={t`Fee`} isSell={isSell} feeAmount={partnerFeeAmount} />}

      {!hasAnyFee && !isEoaNotEthFlow && <FeeItem title={t`Fee`} isSell={isSell} feeAmount={undefined} />}

      {bridgeFee && (
        <FeeItem title={t`Bridge costs`} isSell={isSell} feeAmount={bridgeFee?.amountInIntermediateCurrency} />
      )}

      {!isFractionFalsy(amountAfterFees) && (
        <styledEl.TotalAmount>
          <span>{!isSell ? t`From` : t`To`}</span>
          <span>
            <TokenAmount amount={amountAfterFees} tokenSymbol={amountAfterFees.currency} defaultValue="0" />
          </span>
        </styledEl.TotalAmount>
      )}
    </styledEl.Box>
  )
}
