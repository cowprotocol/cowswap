import { useAtomValue } from 'jotai'
import { ReactNode, Suspense, useEffect } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useLocation, useParams } from 'react-router'

import { Loading } from 'legacy/components/FlashingLoading'
import { OrderStatus } from 'legacy/state/orders/actions'

import {
  advancedOrdersAtom,
  advancedOrdersDerivedStateAtom,
  AdvancedOrdersWidget,
  SetupAdvancedOrderAmountsFromUrlUpdater,
  useAdvancedOrdersDerivedStateToFill,
} from 'modules/advancedOrders'
import { PageTitle } from 'modules/application'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { limitOrdersSettingsAtom } from 'modules/limitOrders'
import { OrdersTableWidget, TabOrderTypes } from 'modules/ordersTable'
import * as styledEl from 'modules/trade'
import { getDefaultTradeRawState, parameterizeTradeRoute } from 'modules/trade'
import {
  SetupFallbackHandlerWarning,
  TwapConfirmModal,
  TwapFormWidget,
  TwapUpdaters,
  useAllEmulatedOrders,
  useIsFallbackHandlerRequired,
  useMapTwapCurrencyInfo,
  useTwapFormState,
  useTwapSlippage,
  TwapFormState,
} from 'modules/twap'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'
import { HydrateAtom } from 'common/state/HydrateAtom'

const ADVANCED_ORDERS_MAX_WIDTH = '1800px'

export function AdvancedOrdersPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()
  const { isUnlocked } = useAtomValue(advancedOrdersAtom)
  const { ordersTableOnLeft } = useAtomValue(limitOrdersSettingsAtom)

  const allEmulatedOrders = useAllEmulatedOrders()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const twapFormValidation = useTwapFormState()
  const twapSlippage = useTwapSlippage()
  const mapTwapCurrencyInfo = useMapTwapCurrencyInfo()
  const { hideOrdersTable } = useInjectedWidgetParams()

  const disablePriceImpact = twapFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL
  const advancedWidgetParams = { disablePriceImpact }
  const pendingOrders = allEmulatedOrders.filter((order) => order.status === OrderStatus.PENDING)

  const advancedOrdersDerivedStateToFill = useAdvancedOrdersDerivedStateToFill(twapSlippage)

  if (!params.chainId) {
    return <AdvancedOrdersPageRedirect />
  }

  return (
    <HydrateAtom atom={advancedOrdersDerivedStateAtom} state={advancedOrdersDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.ADVANCED)} />
      <SetupAdvancedOrderAmountsFromUrlUpdater />
      <styledEl.PageWrapper
        isUnlocked={isUnlocked}
        maxWidth={ADVANCED_ORDERS_MAX_WIDTH}
        secondaryOnLeft={ordersTableOnLeft}
        hideOrdersTable={hideOrdersTable}
      >
        <styledEl.PrimaryWrapper>
          {isFallbackHandlerRequired && pendingOrders.length > 0 && <SetupFallbackHandlerWarning />}
          <AdvancedOrdersWidget
            updaters={<TwapUpdaters />}
            confirmContent={<TwapConfirmModal />}
            params={advancedWidgetParams}
            mapCurrencyInfo={mapTwapCurrencyInfo}
          >
            {(tradeWarnings) => (
              <>
                {/*TODO: conditionally display a widget for current advanced order type*/}
                <TwapFormWidget tradeWarnings={tradeWarnings} />
              </>
            )}
          </AdvancedOrdersWidget>
        </styledEl.PrimaryWrapper>

        {!hideOrdersTable && (
          <styledEl.SecondaryWrapper className="trade-orders-table">
            <Suspense fallback={<Loading />}>
              <OrdersTableWidget
                displayOrdersOnlyForSafeApp
                orderType={TabOrderTypes.ADVANCED}
                orders={allEmulatedOrders}
              />
            </Suspense>
          </styledEl.SecondaryWrapper>
        )}
      </styledEl.PageWrapper>
    </HydrateAtom>
  )
}

function AdvancedOrdersPageRedirect(): ReactNode {
  const { chainId } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const defaultState = getDefaultTradeRawState(chainId)
    const searchParams = new URLSearchParams(location.search)
    const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || undefined
    const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

    searchParams.delete('inputCurrency')
    searchParams.delete('outputCurrency')
    searchParams.delete('chain')

    const pathname = parameterizeTradeRoute(
      {
        chainId: String(chainId),
        inputCurrencyId,
        outputCurrencyId,
        inputCurrencyAmount: undefined,
        outputCurrencyAmount: undefined,
        orderKind: undefined,
      },
      Routes.ADVANCED_ORDERS,
    )

    navigate({ pathname, search: searchParams.toString() }, { replace: true })
  }, [chainId, location.search, navigate])

  return null
}
