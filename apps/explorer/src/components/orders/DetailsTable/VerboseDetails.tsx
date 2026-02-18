import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { faFill } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { DetailsTableTooltips } from './detailsTableTooltips'
import { LinkButton, SolverBadge, SolverBadgeFallback, SolverBadgeLogo, SolverBadgeName, Wrapper } from './styled'

import { Order } from '../../../api/operator'
import { TAB_QUERY_PARAM_KEY } from '../../../explorer/const'
import { OrderSolverInfo } from '../../../hooks/useOrderSolver'
import { DecodeAppData } from '../../AppData/DecodeAppData'
import { DetailRow } from '../../common/DetailRow'
import { FilledProgress } from '../FilledProgress'
import { GasFeeDisplay } from '../GasFeeDisplay'
import { OrderHooksDetails } from '../OrderHooksDetails'
import { OrderPriceDisplay } from '../OrderPriceDisplay'
import { OrderSurplusDisplay } from '../OrderSurplusDisplay'

interface VerboseDetailsProps {
  order: Order
  solvedBy?: OrderSolverInfo
  isSolvedByLoading?: boolean
  isPriceInverted: boolean
  invertPrice: Command
  showFillsButton: boolean | undefined
  viewFills: Command
}

function renderSolvedBy(solvedBy?: OrderSolverInfo): ReactNode {
  if (!solvedBy) return '-'

  return (
    <SolverBadge>
      {solvedBy.image ? (
        <SolverBadgeLogo src={solvedBy.image} alt={`${solvedBy.displayName} logo`} />
      ) : (
        <SolverBadgeFallback>{solvedBy.displayName.charAt(0).toUpperCase()}</SolverBadgeFallback>
      )}
      <SolverBadgeName>{solvedBy.displayName}</SolverBadgeName>
    </SolverBadge>
  )
}

export function VerboseDetails({
  order,
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
    surplusAmount,
    buyToken,
    sellToken,
    appData,
    fullAppData,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const priceDisplayContext = {
    buyToken,
    sellToken,
    showInvertButton: true,
    isPriceInverted,
    invertPrice,
  }
  return (
    <>
      <DetailRow label="Limit Price" tooltipText={DetailsTableTooltips.priceLimit}>
        <OrderPriceDisplay buyAmount={buyAmount} sellAmount={sellAmount} {...priceDisplayContext} />
      </DetailRow>
      <DetailRow label="Execution price" tooltipText={DetailsTableTooltips.priceExecution}>
        {!filledAmount.isZero() ? (
          <OrderPriceDisplay buyAmount={executedBuyAmount} sellAmount={executedSellAmount} {...priceDisplayContext} />
        ) : (
          '-'
        )}
      </DetailRow>
      <DetailRow label="Filled" tooltipText={DetailsTableTooltips.filled}>
        <Wrapper>
          <FilledProgress order={order} />
          {showFillsButton && (
            <LinkButton onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
              <FontAwesomeIcon icon={faFill} />
              View fills
            </LinkButton>
          )}
        </Wrapper>
      </DetailRow>
      <DetailRow label="Order surplus" tooltipText={DetailsTableTooltips.surplus}>
        {!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}
      </DetailRow>
      <DetailRow label="Costs & Fees" tooltipText={DetailsTableTooltips.fees}>
        <GasFeeDisplay order={order} />
      </DetailRow>
      <DetailRow label="Solved by" tooltipText={DetailsTableTooltips.solvedBy} isLoading={isSolvedByLoading}>
        {renderSolvedBy(solvedBy)}
      </DetailRow>
      <OrderHooksDetails appData={appData} fullAppData={fullAppData ?? undefined}>
        {(content) => (
          <DetailRow label="Hooks" tooltipText={DetailsTableTooltips.hooks}>
            {content}
          </DetailRow>
        )}
      </OrderHooksDetails>
      <DetailRow label="AppData" tooltipText={DetailsTableTooltips.appData}>
        <DecodeAppData appData={appData} fullAppData={fullAppData ?? undefined} />
      </DetailRow>
    </>
  )
}
