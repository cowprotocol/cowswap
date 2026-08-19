import { useAtom, useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { PAGE_TITLES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { PageTitle } from 'modules/application'
import { PriceChart, priceChartExpandedAtom, priceChartVisibleAtom } from 'modules/priceChart'
import {
  swapDerivedStateAtom,
  SwapUpdaters,
  SwapWidget,
  useSwapDerivedState,
  useSwapDerivedStateToFill,
} from 'modules/swap'
import { ChartWrapper, PageWrapper, PrimaryWrapper, TradeRouteRedirect } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

const COMPACT_TRADE_PAGE_MAX_WIDTH = '1270px'
const EXPANDED_TRADE_PAGE_MAX_WIDTH = '1800px'

export function SwapPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()
  const { chainId } = useWalletInfo()
  const swapDerivedStateToFill = useSwapDerivedStateToFill()

  if (!params.chainId) {
    return (
      <TradeRouteRedirect route={Routes.SWAP} inputCurrencyFallback={chainId ? WETH[chainId]?.symbol : undefined} />
    )
  }

  return (
    <HydrateAtom atom={swapDerivedStateAtom} state={swapDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.SWAP)} />

      <SwapUpdaters />
      <SwapPageContent />
    </HydrateAtom>
  )
}

function SwapPageContent(): ReactNode {
  const { inputCurrency, outputCurrency } = useSwapDerivedState()
  const isChartVisible = useAtomValue(priceChartVisibleAtom)
  const [isChartExpanded, setIsChartExpanded] = useAtom(priceChartExpandedAtom)
  const shouldShowChart = Boolean(isChartVisible && inputCurrency && outputCurrency)

  return (
    <PageWrapper
      isUnlocked
      maxWidth={isChartExpanded ? EXPANDED_TRADE_PAGE_MAX_WIDTH : COMPACT_TRADE_PAGE_MAX_WIDTH}
      hideOrdersTable={!shouldShowChart}
    >
      <PrimaryWrapper>
        <SwapWidget />
      </PrimaryWrapper>

      {shouldShowChart ? (
        <ChartWrapper $isExpanded={isChartExpanded} className="trade-orders-table">
          <PriceChart
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            sizeControl={{
              isExpanded: isChartExpanded,
              onToggle: () => setIsChartExpanded((value) => !value),
            }}
          />
        </ChartWrapper>
      ) : null}
    </PageWrapper>
  )
}
