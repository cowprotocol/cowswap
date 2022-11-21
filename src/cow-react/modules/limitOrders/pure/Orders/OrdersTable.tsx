import { Order, OrderStatus } from 'state/orders/actions'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import * as styledEl from './OrdersTable.styled'
import React, { useEffect, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { InvertRateControl, RateInfo } from '../../pure/RateInfo'
import { ActiveRateDisplay } from '../../hooks/useActiveRateDisplay'
import { SupportedChainId } from 'constants/chains'

export interface OrdersTableProps {
  chainId: SupportedChainId | undefined
  orders: Order[]
}

const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.REFUNDED]: 'Expired',
  [OrderStatus.REFUNDING]: 'Expired',
  [OrderStatus.REJECTED]: 'Expired',
}

const pageSize = 10

export function OrdersTable({ chainId, orders }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isRateInversed, setIsRateInversed] = useState(false)

  const step = currentPage * pageSize
  const ordersPage = orders.slice(step - pageSize, step)

  useEffect(() => {
    setCurrentPage(1)
  }, [orders])

  return (
    <>
      <styledEl.TableBox>
        <styledEl.Header>
          <div>
            <Trans>Sell</Trans>
          </div>
          <div>
            <Trans>Receive</Trans>
          </div>
          <div>
            <span>
              <Trans>Limit price</Trans>
            </span>
            <InvertRateControl onClick={() => setIsRateInversed(!isRateInversed)} />
          </div>
          <div>
            <Trans>Status</Trans>
          </div>
        </styledEl.Header>
        <styledEl.Rows>
          {ordersPage.map((order) => {
            const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
            const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
            const activeRate = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())
            const activeRateDisplay: ActiveRateDisplay = {
              chainId,
              activeRate,
              inputCurrencyAmount: sellAmount,
              outputCurrencyAmount: buyAmount,
              activeRateFiatAmount: null,
              inversedActiveRateFiatAmount: null,
            }

            return (
              <styledEl.Row key={order.id}>
                <div>
                  <styledEl.CurrencyAmountItem amount={sellAmount} />
                </div>
                <div>
                  <styledEl.CurrencyAmountItem amount={buyAmount} />
                </div>
                <div>
                  <styledEl.RateValue>
                    <RateInfo noLabel={true} isInversed={isRateInversed} activeRateDisplay={activeRateDisplay} />
                  </styledEl.RateValue>
                </div>
                <div>
                  <styledEl.StatusItem cancelling={!!order.isCancelling} status={order.status}>
                    {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
                  </styledEl.StatusItem>
                </div>
              </styledEl.Row>
            )
          })}
        </styledEl.Rows>
      </styledEl.TableBox>
      <OrdersTablePagination
        pageSize={pageSize}
        totalCount={orders.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}
