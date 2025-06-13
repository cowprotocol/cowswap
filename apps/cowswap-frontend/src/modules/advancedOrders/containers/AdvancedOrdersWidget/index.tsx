import { useAtomValue } from 'jotai'
import { ReactElement, ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { useAdvancedOrdersActions } from 'modules/advancedOrders/hooks/useAdvancedOrdersActions'
import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { advancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { TradeWidget, TradeWidgetSlots, useReceiveAmountInfo, useTradePriceImpact } from 'modules/trade'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { useTradeQuote } from 'modules/tradeQuote'
import { TWAP_LEARN_MORE_LINK } from 'modules/twap/const'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useUpdateAdvancedOrdersRawState } from '../../hooks/useAdvancedOrdersRawState'
import { AdvancedOrdersSettings } from '../AdvancedOrdersSettings'

const TWAP_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: 'Get the Time-Weighted Average Price by splitting your large order into parts' },
  { content: 'Customize your order size, expiration, and number of parts' },
  { content: 'Receive surplus of your order' },
  { content: 'Reduce your slippage by breaking big orders into smaller ones' },
]

const UNLOCK_SCREEN = {
  title: 'Unlock the Power of TWAP Orders',
  subtitle: 'Begin with TWAP Today!',
  orderType: 'TWAP',
  buttonText: 'Unlock TWAP orders (BETA)',
  // TODO: add actual link before deploy to PROD
  buttonLink: TWAP_LEARN_MORE_LINK,
}

export type AdvancedOrdersWidgetParams = {
  disablePriceImpact: boolean
}

export type AdvancedOrdersWidgetProps = {
  updaters?: ReactNode
  params: AdvancedOrdersWidgetParams
  mapCurrencyInfo?: (info: CurrencyInfo) => CurrencyInfo
  confirmContent: ReactElement
  children(warnings: ReactNode): ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AdvancedOrdersWidget({
  children,
  updaters,
  params,
  confirmContent,
  mapCurrencyInfo,
}: AdvancedOrdersWidgetProps) {
  const { disablePriceImpact } = params

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
    orderKind,
    isUnlocked,
  } = useAdvancedOrdersDerivedState()
  const actions = useAdvancedOrdersActions()
  const { isLoading: isTradePriceUpdating } = useTradeQuote()
  const { showRecipient } = useAtomValue(advancedOrdersSettingsAtom)
  const priceImpact = useTradePriceImpact()
  const receiveAmountInfo = useReceiveAmountInfo()

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const isSell = isSellOrder(orderKind)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: isSell,
    receiveAmountInfo: null,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: !isSell,
    receiveAmountInfo,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
  }

  const slots: TradeWidgetSlots = {
    settingsWidget: <AdvancedOrdersSettings />,
    bottomContent(warnings) {
      return children(warnings)
    },
    updaters,
    lockScreen: isUnlocked ? undefined : (
      <UnlockWidgetScreen
        id="advanced-orders"
        items={TWAP_BULLET_LIST_CONTENT}
        buttonLink={UNLOCK_SCREEN.buttonLink}
        title={UNLOCK_SCREEN.title}
        subtitle={UNLOCK_SCREEN.subtitle}
        orderType={UNLOCK_SCREEN.orderType}
        buttonText={UNLOCK_SCREEN.buttonText}
        handleUnlock={() => updateAdvancedOrdersState({ isUnlocked: true })}
      />
    ),
  }

  const tradeWidgetParams = {
    recipient,
    compactView: true,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    disablePriceImpact,
  }

  return (
    <TradeWidget
      id="advanced-orders-page"
      disableOutput={true}
      slots={slots}
      actions={actions}
      params={tradeWidgetParams}
      inputCurrencyInfo={mapCurrencyInfo ? mapCurrencyInfo(inputCurrencyInfo) : inputCurrencyInfo}
      outputCurrencyInfo={mapCurrencyInfo ? mapCurrencyInfo(outputCurrencyInfo) : outputCurrencyInfo}
      confirmModal={confirmContent}
    />
  )
}
