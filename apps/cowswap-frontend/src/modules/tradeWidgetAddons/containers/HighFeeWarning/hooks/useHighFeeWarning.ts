import { atom, useAtom } from 'jotai'
import { SetStateAction, useMemo } from 'react'

import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'
import { Fraction } from '@uniswap/sdk-core'

import { useGetReceiveAmountInfo } from 'modules/trade'

import { useSafeEffect, useSafeMemo } from 'common/hooks/useSafeMemo'

const feeWarningAcceptedAtom = atom(false)
const DEFAULT_FEE_STATE: [boolean, undefined] = [false, undefined]

type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result

interface UseHighFeeWarningReturn {
  isHighFee: boolean
  feePercentage: Fraction | undefined
  isHighBridgeFee: boolean | undefined
  bridgeFeePercentage: Fraction | undefined
  feeWarningAccepted: boolean
  setFeeWarningAccepted: SetAtom<[SetStateAction<boolean>], void>
}

/**
 * useHighFeeWarning
 * @description checks whether fee vs trade inputAmount = high fee warning
 * @description returns params related to high fee and a cb for checking/unchecking fee acceptance
 */
export function useHighFeeWarning(): UseHighFeeWarningReturn {
  const receiveAmountInfo = useGetReceiveAmountInfo()

  const [feeWarningAccepted, setFeeWarningAccepted] = useAtom(feeWarningAcceptedAtom)

  // only considers inputAmount vs fee (fee is in input token)
  const [isHighFee, feePercentage, isHighBridgeFee, bridgeFeePercentage] = useMemo(() => {
    if (!receiveAmountInfo) return DEFAULT_FEE_STATE

    const {
      isSell,
      beforeNetworkCosts,
      afterNetworkCosts,
      costs: { networkFee, partnerFee, bridgeFee },
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

    const bridgeFeePercentage = bridgeFee?.amountInDestinationCurrency.divide(targetAmount).multiply(100).asFraction

    const isHighBridgeFee = Boolean(bridgeFeePercentage?.greaterThan(FEE_SIZE_THRESHOLD))

    return [feePercentage.greaterThan(FEE_SIZE_THRESHOLD), feePercentage, isHighBridgeFee, bridgeFeePercentage]
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
      isHighBridgeFee,
      bridgeFeePercentage,
      // we only care/check about feeWarning being accepted if the fee is actually high..
      feeWarningAccepted: _computeFeeWarningAcceptedState({ feeWarningAccepted, isHighFee }),
      setFeeWarningAccepted,
    }),
    [isHighFee, feePercentage, feeWarningAccepted, setFeeWarningAccepted],
  )
}

function _computeFeeWarningAcceptedState({
  feeWarningAccepted,
  isHighFee,
}: {
  feeWarningAccepted: boolean
  isHighFee: boolean
}): boolean {
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
