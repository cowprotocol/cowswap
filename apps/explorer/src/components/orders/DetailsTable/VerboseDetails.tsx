import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { AppDataItem } from './items/AppDataItem'
import { CostAndFeesItem } from './items/CostAndFeesItem'
import { ExecutionPriceItem } from './items/ExecutionPriceItem'
import { FilledItem } from './items/FilledItem'
import { HooksItem } from './items/HooksItem'
import { LimitPriceItem } from './items/LimitPriceItem'
import { OrderSurplusItem } from './items/OrderSurplusItem'
import { SolvedByItem } from './items/SolvedByItem'

import { Order } from '../../../api/operator'
import { OrderSolverInfo } from '../../../hooks/useOrderSolver'
import { OrderHooksDetails } from '../OrderHooksDetails'
import { OrderPriceDisplayProps } from '../OrderPriceDisplay'

interface VerboseDetailsProps {
  order: Order
  showSolverDetails: boolean
  solvedBy?: OrderSolverInfo
  isSolvedByLoading?: boolean
  isPriceInverted: boolean
  invertPrice: Command
  showFillsButton: boolean | undefined
  viewFills: Command
}

export function VerboseDetails({
  order,
  showSolverDetails,
  solvedBy,
  isSolvedByLoading,
  invertPrice,
  isPriceInverted,
  showFillsButton,
  viewFills,
}: VerboseDetailsProps): ReactNode {
  const {
    uid,
    buyAmount,
    sellAmount,
    executedBuyAmount,
    executedSellAmount,
    filledAmount,
    buyToken,
    sellToken,
    appData,
    fullAppData,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const orderPriceDisplayProps = {
    buyToken,
    sellToken,
    showInvertButton: true,
    isPriceInverted,
    invertPrice,
  } as const satisfies Partial<OrderPriceDisplayProps>

  return (
    <>
      <LimitPriceItem {...orderPriceDisplayProps} buyAmount={buyAmount} sellAmount={sellAmount} />

      <ExecutionPriceItem
        {...orderPriceDisplayProps}
        buyAmount={executedBuyAmount}
        sellAmount={executedSellAmount}
        filledAmount={filledAmount}
      />

      <FilledItem order={order} showFillsButton={showFillsButton} viewFills={viewFills} />

      <OrderSurplusItem order={order} />

      <CostAndFeesItem order={order} />

      {showSolverDetails && (
        <SolvedByItem
          uid={uid}
          isSolvedByLoading={isSolvedByLoading}
          solvedBy={solvedBy}
          showFillsButton={showFillsButton}
          viewFills={viewFills}
        />
      )}

      <OrderHooksDetails appData={appData} fullAppData={fullAppData ?? undefined}>
        {(content) => <HooksItem>{content}</HooksItem>}
      </OrderHooksDetails>

      <AppDataItem appData={appData} fullAppData={fullAppData ?? undefined} />
    </>
  )
}
