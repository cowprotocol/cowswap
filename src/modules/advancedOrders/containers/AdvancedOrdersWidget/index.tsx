import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'

import { useAdvancedOrdersActions } from 'modules/advancedOrders/hooks/useAdvancedOrdersActions'
import {
  useAdvancedOrdersDerivedState,
  useFillAdvancedOrdersDerivedState,
} from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { updateAdvancedOrdersAtom } from 'modules/advancedOrders/state/advancedOrdersAtom'
import { useSetupTradeState, useTradePriceImpact, TradeWidget, TradeWidgetSlots } from 'modules/trade'
import { useDisableNativeTokenSelling } from 'modules/trade/hooks/useDisableNativeTokenSelling'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { useTradeQuote, useSetTradeQuoteParams } from 'modules/tradeQuote'
import { partsStateAtom } from 'modules/twap/state/partsStateAtom'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

export const TWAP_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: 'Get the Time-Weighted Average Price by splitting your large order into parts' },
  { content: 'Customize your order size, expiration, and number of parts' },
  { content: 'Always receive 100% of your order surplus' },
  { content: 'Reduce your slippage by breaking big orders into smaller ones' },
]

const UNLOCK_SCREEN = {
  title: 'Unlock the Power of Advanced Orders',
  subtitle: 'Begin with TWAP Today!',
  orderType: 'TWAP',
  buttonText: 'Unlock TWAP orders (BETA)',
  // TODO: add actual link before deploy to PROD
  buttonLink: '',
}

export function AdvancedOrdersWidget({ children }: { children: JSX.Element }) {
  useSetupTradeState()
  useFillAdvancedOrdersDerivedState()
  useDisableNativeTokenSelling()

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
  const { inputPartAmount } = useAtomValue(partsStateAtom)
  const priceImpact = useTradePriceImpact()

  const updateAdvancedOrdersState = useUpdateAtom(updateAdvancedOrdersAtom)

  useSetTradeQuoteParams(inputPartAmount)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    receiveAmountInfo: null,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: orderKind === OrderKind.BUY,
    receiveAmountInfo: null,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
  }

  // TODO
  const slots: TradeWidgetSlots = {
    settingsWidget: <div></div>,
    bottomContent: children,
    lockScreen: isUnlocked ? undefined : (
      <UnlockWidgetScreen
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

  const params = {
    recipient,
    compactView: false,
    showRecipient: false,
    isTradePriceUpdating,
    priceImpact,
    isExpertMode: false, // TODO: bind value
  }

  return (
    <TradeWidget
      id="advanced-orders-page"
      disableOutput={true}
      slots={slots}
      actions={actions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
    />
  )
}
