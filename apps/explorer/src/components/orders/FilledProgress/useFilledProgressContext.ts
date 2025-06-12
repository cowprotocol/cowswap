import { isSellOrder } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Order } from '../../../api/operator'
import { safeTokenName } from '../../../utils'

import type BigNumber from 'bignumber.js'

interface FilledProgressVariants {
  mainToken: Nullish<TokenErc20>
  mainAddress: string
  swappedToken: Nullish<TokenErc20>
  swappedAddress: string
  action: string
  // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
  // Buy orders need to add the fee, to the sellToken too (swappedAmount in this case)
  filledAmountWithFee: BigNumber
  swappedAmountWithFee: BigNumber
  surplusToken: Nullish<TokenErc20>
}

export interface FilledProgressContext extends FilledProgressVariants {
  touched: boolean
  mainSymbol: string
  swappedSymbol: string
  formattedPercentage: string
  surplus: { amount: BigNumber; percentage: BigNumber }
}

export function useFilledProgressContext(order: Order): FilledProgressContext {
  const { filledPercentage, surplusAmount, surplusPercentage } = order

  const variants = getFilledProgressVariants(order)
  const { mainToken, mainAddress, swappedToken, swappedAddress } = variants
  const touched = filledPercentage.gt(0)

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)
  const formattedPercentage = filledPercentage.times(100).toString()

  const surplus = { amount: surplusAmount, percentage: surplusPercentage }

  return {
    ...variants,
    touched,
    mainSymbol,
    swappedSymbol,
    formattedPercentage,
    surplus,
  }
}

function getFilledProgressVariants(order: Order): FilledProgressVariants {
  const {
    executedFeeAmount,
    filledAmount,
    kind,
    executedBuyAmount,
    executedSellAmount,
    buyToken,
    sellToken,
    buyTokenAddress,
    sellTokenAddress,
  } = order

  if (isSellOrder(kind)) {
    return {
      mainToken: sellToken,
      mainAddress: sellTokenAddress,
      swappedToken: buyToken,
      swappedAddress: buyTokenAddress,
      action: 'sold',
      filledAmountWithFee: filledAmount.plus(executedFeeAmount),
      swappedAmountWithFee: executedBuyAmount,
      surplusToken: buyToken,
    }
  }

  return {
    mainToken: buyToken,
    mainAddress: buyTokenAddress,
    swappedToken: sellToken,
    swappedAddress: sellTokenAddress,
    action: 'bought',
    filledAmountWithFee: filledAmount,
    swappedAmountWithFee: executedSellAmount.plus(executedFeeAmount),
    surplusToken: sellToken,
  }
}
