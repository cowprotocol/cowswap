import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { BalancesAndAllowances } from 'modules/tokens'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EstimatedExecutionPrice } from '../../containers/OrderRow/EstimatedExecutionPrice'
import { getOrderParams } from '../../utils/getOrderParams'

interface WarningEstimatedPriceProps {
  chainId: SupportedChainId
  balancesAndAllowances: BalancesAndAllowances
  order: ParsedOrder
  isTwapTable?: boolean
  isChild?: boolean
  isInverted: boolean
  childOrders?: ParsedOrder[]
  withAllowanceWarning?: boolean
  approveOrderToken(token: Token): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WarningEstimatedPrice(props: WarningEstimatedPriceProps) {
  const { order, isInverted, withAllowanceWarning, approveOrderToken } = props
  const warningChildWithParams = findWarningChildWithParams(props)

  if (!warningChildWithParams?.params) return null

  return (
    <EstimatedExecutionPrice
      amount={undefined}
      tokenSymbol={undefined}
      isInverted={isInverted}
      isUnfillable={true}
      canShowWarning={true}
      warningText={
        warningChildWithParams.params.hasEnoughAllowance === false
          ? 'Insufficient allowance'
          : warningChildWithParams.params.hasEnoughBalance === false
            ? 'Insufficient balance'
            : 'Unfillable'
      }
      onApprove={
        warningChildWithParams.params.hasEnoughAllowance === false
          ? () => approveOrderToken(warningChildWithParams.order.inputToken)
          : withAllowanceWarning
            ? () => approveOrderToken(order.inputToken)
            : undefined
      }
    />
  )
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
const findWarningChildWithParams = ({
  isChild,
  childOrders,
  isTwapTable,
  chainId,
  balancesAndAllowances,
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: WarningEstimatedPriceProps) => {
  if (!isTwapTable || isChild || !childOrders) return null

  for (const childOrder of childOrders) {
    if (
      childOrder.status !== OrderStatus.FULFILLED &&
      (childOrder.status === OrderStatus.SCHEDULED || childOrder.status === OrderStatus.PENDING)
    ) {
      const childParams = getOrderParams(chainId, balancesAndAllowances, childOrder)
      if (childParams?.hasEnoughBalance === false || childParams?.hasEnoughAllowance === false) {
        return { order: childOrder, params: childParams }
      }
    }
  }
  return null
}
