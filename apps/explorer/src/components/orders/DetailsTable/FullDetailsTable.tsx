import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { faFill } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DecodeAppData from 'components/AppData/DecodeAppData'
import { FilledProgress } from 'components/orders/FilledProgress'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { HelpTooltip } from 'components/Tooltip'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'

import { Order } from 'api/operator'

import { BaseDetailsTable } from './BaseDetailsTable'
import { LinkButton, Wrapper } from './styled'
import { tooltip } from './tooltips'

import { GasFeeDisplay } from '../GasFeeDisplay'
import { OrderHooksDetails } from '../OrderHooksDetails'

export interface FullDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  viewFills: Command
  isPriceInverted: boolean
  invertPrice: Command
}

// Complete order view with all possible information (current default view for non-bridge orders)
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function FullDetailsTable({
  chainId,
  order,
  showFillsButton,
  areTradesLoading,
  viewFills,
  isPriceInverted,
  invertPrice,
}: FullDetailsTableProps) {
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

  const fullModeFields = (
    <>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.priceLimit} /> Limit Price
          </span>
        </td>
        <td>
          <OrderPriceDisplay
            buyAmount={buyAmount}
            buyToken={buyToken}
            sellAmount={sellAmount}
            sellToken={sellToken}
            showInvertButton
            isPriceInverted={isPriceInverted}
            invertPrice={invertPrice}
          />
        </td>
      </tr>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.priceExecution} /> Execution price
          </span>
        </td>
        <td>
          {!filledAmount.isZero() ? (
            <OrderPriceDisplay
              buyAmount={executedBuyAmount}
              buyToken={buyToken}
              sellAmount={executedSellAmount}
              sellToken={sellToken}
              showInvertButton
              isPriceInverted={isPriceInverted}
              invertPrice={invertPrice}
            />
          ) : (
            '-'
          )}
        </td>
      </tr>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.filled} /> Filled
          </span>
        </td>
        <td>
          <Wrapper>
            <FilledProgress order={order} />
            {showFillsButton && (
              <LinkButton onClickOptional={viewFills} to={`/orders/${uid}/?${TAB_QUERY_PARAM_KEY}=fills`}>
                <FontAwesomeIcon icon={faFill} />
                View fills
              </LinkButton>
            )}
          </Wrapper>
        </td>
      </tr>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.surplus} /> Order surplus
          </span>
        </td>
        <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
      </tr>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.fees} /> Costs &amp; Fees
          </span>
        </td>
        <td>
          <GasFeeDisplay order={order} />
        </td>
      </tr>
      <OrderHooksDetails appData={appData} fullAppData={fullAppData ?? undefined}>
        {(content) => (
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={tooltip.hooks} /> Hooks
              </span>
            </td>
            <td>{content}</td>
          </tr>
        )}
      </OrderHooksDetails>
      <tr>
        <td>
          <span>
            <HelpTooltip tooltip={tooltip.appData} /> AppData
          </span>
        </td>
        <td>
          <DecodeAppData appData={appData} fullAppData={fullAppData ?? undefined} />
        </td>
      </tr>
    </>
  )

  return (
    <BaseDetailsTable
      chainId={chainId}
      order={order}
      showFillsButton={showFillsButton}
      areTradesLoading={areTradesLoading}
    >
      {fullModeFields}
    </BaseDetailsTable>
  )
}
