import { atom, useAtom } from 'jotai'
import { useMemo } from 'react'

import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'

import { useReceiveAmountInfo } from 'modules/trade'

import { useSafeEffect, useSafeMemo } from 'common/hooks/useSafeMemo'

const feeWarningAcceptedAtom = atom(false)
const DEFAULT_FEE_STATE: [boolean, undefined] = [false, undefined]

/**
 * useHighFeeWarning
 * @description checks whether fee vs trade inputAmount = high fee warning
 * @description returns params related to high fee and a cb for checking/unchecking fee acceptance
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHighFeeWarning() {
  const receiveAmountInfo = useReceiveAmountInfo()

  const [feeWarningAccepted, setFeeWarningAccepted] = useAtom(feeWarningAcceptedAtom)

  // only considers inputAmount vs fee (fee is in input token)
  const [isHighFee, feePercentage] = useMemo(() => {
    if (!receiveAmountInfo) return DEFAULT_FEE_STATE

    const {
      isSell,
      beforeNetworkCosts,
      afterNetworkCosts,
      costs: { networkFee, partnerFee },
      quotePrice,
    } = receiveAmountInfo

    const outputAmountWithoutFee = isSell ? beforeNetworkCosts.buyAmount : afterNetworkCosts.buyAmount

    const inputAmountAfterFees = isSell ? beforeNetworkCosts.sellAmount : afterNetworkCosts.sellAmount

    const feeAsCurrency = isSell ? quotePrice.quote(networkFee.amountInSellCurrency) : networkFee.amountInSellCurrency

    const volumeFeeAmount = partnerFee.amount

    const totalFeeAmount = volumeFeeAmount ? feeAsCurrency.add(volumeFeeAmount) : feeAsCurrency
    const targetAmount = isSell ? outputAmountWithoutFee : inputAmountAfterFees

    if (targetAmount.equalTo(0)) return DEFAULT_FEE_STATE

    const feePercentage = totalFeeAmount.divide(targetAmount).multiply(100).asFraction

    return [feePercentage.greaterThan(FEE_SIZE_THRESHOLD), feePercentage]
  }, [receiveAmountInfo])

  // reset the state when users change swap params
  useSafeEffect(() => {
    setFeeWarningAccepted(false)
  }, [
    receiveAmountInfo?.beforeNetworkCosts.sellAmount.currency,
    receiveAmountInfo?.beforeNetworkCosts.buyAmount.currency,
    receiveAmountInfo?.isSell,
  ])

  return useSafeMemo(
    () => ({
      isHighFee,
      feePercentage,
      // we only care/check about feeWarning being accepted if the fee is actually high..
      feeWarningAccepted: _computeFeeWarningAcceptedState({ feeWarningAccepted, isHighFee }),
      setFeeWarningAccepted,
    }),
    [isHighFee, feePercentage, feeWarningAccepted, setFeeWarningAccepted],
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _computeFeeWarningAcceptedState({
  feeWarningAccepted,
  isHighFee,
}: {
  feeWarningAccepted: boolean
  isHighFee: boolean
}) {
  if (feeWarningAccepted) return true
  else {
    // is the fee high? that's only when we care
    if (isHighFee) {
      return feeWarningAccepted
    } else {
      return true
    }
  }
}
