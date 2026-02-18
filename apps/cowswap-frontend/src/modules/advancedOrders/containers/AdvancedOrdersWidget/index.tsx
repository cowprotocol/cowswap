import { useAtomValue } from 'jotai'
import { ReactElement, ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { Field } from 'legacy/state/types'

import { useAdvancedOrdersActions } from 'modules/advancedOrders/hooks/useAdvancedOrdersActions'
import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders/hooks/useAdvancedOrdersDerivedState'
import { BottomBanners } from 'modules/advancedOrders/pure/BottomBanners/BottomBanners.pure'
import { advancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import {
  TradeWidget,
  TradeWidgetSlots,
  useTradePriceImpact,
  useGetReceiveAmountInfo,
  TradeWidgetParams,
} from 'modules/trade'
import { UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { useTradeQuote } from 'modules/tradeQuote'
import { TWAP_LEARN_MORE_LINK } from 'modules/twap/const'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useUpdateAdvancedOrdersRawState } from '../../hooks/useAdvancedOrdersRawState'
import { AdvancedOrdersSettings } from '../AdvancedOrdersSettings'

const TWAP_BULLETIN_LIST_CONTENT: MessageDescriptor[] = [
  msg`Get the Time-Weighted Average Price by splitting your large order into parts`,
  msg`Customize your order size, expiration, and number of parts`,
  msg`Receive surplus of your order`,
  msg`Reduce your slippage by breaking big orders into smaller ones`,
]

const UNLOCK_SCREEN: {
  buttonLink: string
  buttonText: MessageDescriptor
  orderType: MessageDescriptor
  subtitle: MessageDescriptor
  title: MessageDescriptor
} = {
  title: msg`Unlock the Power of TWAP Orders`,
  subtitle: msg`Begin with TWAP Today!`,
  orderType: msg`TWAP`,
  buttonText: msg`Unlock TWAP orders`,
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
  const { i18n } = useLingui()
  const { title, orderType, buttonText, buttonLink, subtitle } = UNLOCK_SCREEN
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
  const receiveAmountInfo = useGetReceiveAmountInfo()

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
        items={TWAP_BULLETIN_LIST_CONTENT.map((item) => ({
          content: i18n._(item),
        }))}
        buttonLink={buttonLink}
        title={i18n._(title)}
        subtitle={i18n._(subtitle)}
        orderType={i18n._(orderType)}
        buttonText={i18n._(buttonText)}
        handleUnlock={() => updateAdvancedOrdersState({ isUnlocked: true })}
      />
    ),
    outerContent: isUnlocked ? <BottomBanners /> : null,
  }

  const tradeWidgetParams: TradeWidgetParams = {
    recipient,
    compactView: true,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    disablePriceImpact,
    disableSuggestedSlippageApi: true,
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
