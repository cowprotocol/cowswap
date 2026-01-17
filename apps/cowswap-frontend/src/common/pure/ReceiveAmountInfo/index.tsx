/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import React, { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

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

function hasValidFee(amount: CurrencyAmount<Currency> | undefined, bps: number | undefined): boolean {
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
    beforeAllFees,
  } = receiveAmountInfo
  const { amountAfterFees, networkFeeAmount } = getOrderTypeReceiveAmounts(receiveAmountInfo)
  const { subsidy } = subsidyAndBalance
  const { discount } = subsidy

  const protocolFeeAmount = protocolFee?.amount
  const protocolFeeBps = protocolFee?.bps

  const hasPartnerFee = hasValidFee(partnerFeeAmount, partnerFeeBps)
  const hasProtocolFee = hasValidFee(protocolFeeAmount, protocolFeeBps)
  const hasAnyFee = hasPartnerFee || hasProtocolFee
  const hasNetworkFee = !isFractionFalsy(networkFeeAmount)

  const isEoaNotEthFlow = allowsOffchainSigning && !isEoaEthFlow

  const beforeAllFeesAmount = isSell ? beforeAllFees.buyAmount : beforeAllFees.sellAmount

  return (
    <styledEl.Box>
      <div>
        <span>
          <Trans>Before costs</Trans>
        </span>
        <span>
          <TokenAmount amount={beforeAllFeesAmount} tokenSymbol={beforeAllFeesAmount.currency} defaultValue="0" />
        </span>
      </div>

      {hasProtocolFee && <FeeItem title={t`Protocol fee`} isSell={isSell} feeAmount={protocolFeeAmount} />}

      {hasPartnerFee && <FeeItem title={t`Partner fee`} isSell={isSell} feeAmount={partnerFeeAmount} />}

      {hasNetworkFee && (
        <NetworkFeeItem discount={discount} networkFeeAmount={networkFeeAmount} isSell={isSell} hasFee={hasAnyFee} />
      )}

      {!hasAnyFee && !isEoaNotEthFlow && <FeeItem title={t`Fee`} isSell={isSell} feeAmount={undefined} />}

      {bridgeFee && (
        <FeeItem title={t`Bridge costs`} isSell={isSell} feeAmount={bridgeFee?.amountInDestinationCurrency} />
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
