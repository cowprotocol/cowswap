import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProviderType } from '@cowprotocol/sdk-bridging'

import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'
import { AmountItem } from 'components/orders/DetailsTable/items/AmountItem'
import { ExecutionTimeItem } from 'components/orders/DetailsTable/items/ExecutionTimeItem'
import { ExpirationTimeItem } from 'components/orders/DetailsTable/items/ExpirationTimeItem'
import { FromItem } from 'components/orders/DetailsTable/items/FromItem'
import { StatusItem } from 'components/orders/DetailsTable/items/StatusItem'
import { SubmissionTimeItem } from 'components/orders/DetailsTable/items/SubmissionTimeItem'
import { ToItem } from 'components/orders/DetailsTable/items/ToItem'
import { TypeItem } from 'components/orders/DetailsTable/items/TypeItem'

import { Order } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { OrderIdItem } from './items/OrderIdItem'
import { TxHashItem } from './items/TxHashItem'
import { WarningRow } from './styled'

import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

export interface BaseDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  bridgeProviderType?: BridgeProviderType
  children?: React.ReactNode
}

/**
 * Foundation component with core order information that every order detail view needs
 */
export function BaseDetailsTable({
  chainId,
  order,
  showFillsButton,
  areTradesLoading,
  bridgeProviderType,
  children,
}: BaseDetailsTableProps): React.ReactNode | null {
  const cowAnalytics = useCowAnalytics()
  const {
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    executionDate,
    expirationDate,
    status,
    partiallyFilled,
    buyToken,
    sellToken,
    bridgeProviderId,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const onCopy = (label: string): void => {
    cowAnalytics.sendEvent({
      category: ExplorerCategory.ORDER_DETAILS,
      action: 'Copy',
      label,
    })
  }

  const isSigning = status === 'signing'
  const isBridging = !!bridgeProviderId

  return (
    <SimpleTable
      columnViewMobile
      body={
        <>
          {isSigning && (
            <WarningRow>
              <td colSpan={2}>
                <UnsignedOrderWarning />
              </td>
            </WarningRow>
          )}
          <OrderIdItem chainId={chainId} order={order} onCopy={onCopy} bridgeProviderId={bridgeProviderId} />
          <FromItem
            chainId={chainId}
            isSigning={isSigning}
            isBridgingOrder={isBridging}
            onCopy={onCopy}
            owner={owner}
          />
          <ToItem
            chainId={chainId}
            receiver={receiver}
            isBridgingOrder={isBridging}
            bridgeProviderType={bridgeProviderType}
            onCopy={onCopy}
          />
          {(!partiallyFillable || txHash) && areTradesLoading ? (
            <Spinner />
          ) : (
            <TxHashItem chainId={chainId} txHash={txHash} onCopy={onCopy} isLoading={areTradesLoading} />
          )}
          <StatusItem status={status} partiallyFilled={partiallyFilled} />
          <SubmissionTimeItem creationDate={creationDate} showIcon />
          {executionDate && !showFillsButton && <ExecutionTimeItem executionDate={executionDate} showIcon />}
          <ExpirationTimeItem expirationDate={expirationDate} showIcon />
          <TypeItem kind={kind} uiOrderType={getUiOrderType(order)} partiallyFillable={partiallyFillable} />
          <AmountItem order={order} />
          {children}
        </>
      }
    />
  )
}
