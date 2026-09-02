import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { Loading } from 'legacy/components/FlashingLoading'

import { PageTitle } from 'modules/application'
import { useRwaDefaultCurrencyIds } from 'modules/rwa'
import { RwaWidget } from 'modules/rwaWidget'
import { swapDerivedStateAtom, SwapUpdaters, useSwapDerivedStateToFill } from 'modules/swap'
import { PageWrapper, PrimaryWrapper, TradeRouteRedirect } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

const TRADE_PAGE_MAX_WIDTH = '1800px'

export function RwaPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()
  const { chainId } = useWalletInfo()
  const swapDerivedStateToFill = useSwapDerivedStateToFill()
  const parsedRouteChainId = params.chainId ? Number(params.chainId) : undefined
  const routeChainId = isSupportedChainId(parsedRouteChainId) ? parsedRouteChainId : undefined
  const inputCurrencyId = params.inputCurrencyId === '_' ? undefined : params.inputCurrencyId
  const outputCurrencyId = params.outputCurrencyId
  const { currencyIds: defaults, isLoading: areDefaultsLoading } = useRwaDefaultCurrencyIds(routeChainId ?? chainId)
  const needsRedirect = !routeChainId || !inputCurrencyId || !outputCurrencyId

  if (needsRedirect && areDefaultsLoading) return <Loading />

  if (needsRedirect) {
    return (
      <TradeRouteRedirect
        route={Routes.RWA}
        defaultInputCurrencyId={defaults?.inputCurrencyId}
        defaultOutputCurrencyId={defaults?.outputCurrencyId}
        chainId={routeChainId}
        inputCurrencyId={inputCurrencyId}
        outputCurrencyId={outputCurrencyId}
      />
    )
  }

  return (
    <HydrateAtom atom={swapDerivedStateAtom} state={swapDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.RWA)} />
      <SwapUpdaters />
      <PageWrapper isUnlocked maxWidth={TRADE_PAGE_MAX_WIDTH} hideOrdersTable>
        <PrimaryWrapper>
          <RwaWidget />
        </PrimaryWrapper>
      </PageWrapper>
    </HydrateAtom>
  )
}
