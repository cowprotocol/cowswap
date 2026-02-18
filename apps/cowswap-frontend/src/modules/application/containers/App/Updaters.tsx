import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import {
  RestrictedTokensListUpdater,
  TokensListsTagsUpdater,
  TokensListsUpdater,
  UnsupportedTokensUpdater,
} from '@cowprotocol/tokens'
import { HwAccountIndexUpdater, useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { CowSdkUpdater } from 'cowSdk'
import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { BridgeOrdersCleanUpdater } from 'entities/bridgeOrders'
import { BridgeProvidersUpdater, useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { CorrelatedTokensUpdater } from 'entities/correlatedTokens'
import { ThemeConfigUpdater } from 'theme/ThemeConfigUpdater'
import { TradingSdkUpdater } from 'tradingSdk/TradingSdkUpdater'

import { CommonPriorityBalancesAndAllowancesUpdater } from 'modules/balancesAndAllowances'
import { BalancesDevtools } from 'modules/balancesAndAllowances/updaters/BalancesDevtools'
import { PendingBridgeOrdersUpdater, BridgingEnabledUpdater } from 'modules/bridge'
import { BalancesCombinedUpdater } from 'modules/combinedBalances/updater/BalancesCombinedUpdater'
import { InFlightOrderFinalizeUpdater } from 'modules/ethFlow'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import {
  OrderProgressEventsUpdater,
  OrderProgressStateUpdater,
  ProgressBarExecutingOrdersUpdater,
} from 'modules/orderProgressBar'
import { OrdersNotificationsUpdater } from 'modules/orders'
import { GeoDataUpdater } from 'modules/rwa'
import { BlockedListSourcesUpdater, RecentTokensStorageUpdater, useSourceChainId } from 'modules/tokensList'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { UsdPricesUpdater } from 'modules/usdAmount'
import { LpTokensWithBalancesUpdater, PoolsInfoUpdater, VampireAttackUpdater } from 'modules/yield/shared'

import { SurplusInvalidationListenerUpdater } from 'common/state/totalSurplusState'
import { AnnouncementsUpdater } from 'common/updaters/AnnouncementsUpdater'
import { ConnectionStatusUpdater } from 'common/updaters/ConnectionStatusUpdater'
import { FeatureFlagsUpdater } from 'common/updaters/FeatureFlagsUpdater'
import { GasUpdater } from 'common/updaters/GasUpdater'
import { LpBalancesAndAllowancesUpdater } from 'common/updaters/LpBalancesAndAllowancesUpdater'
import {
  CancelledOrdersUpdater,
  ExpiredOrdersUpdater,
  OrdersFromApiUpdater,
  PendingOrdersUpdater,
} from 'common/updaters/orders'
import { SpotPricesUpdater } from 'common/updaters/orders/SpotPricesUpdater'
import { LastTimePriceUpdateResetUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'
import { SentryUpdater } from 'common/updaters/SentryUpdater'
import { SolversInfoUpdater } from 'common/updaters/SolversInfoUpdater'
import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'
import { UserUpdater } from 'common/updaters/UserUpdater'
import { WidgetTokensUpdater } from 'common/updaters/WidgetTokensUpdater'

import { FaviconAnimationUpdater } from './FaviconAnimationUpdater'

export function Updaters(): ReactNode {
  const { account } = useWalletInfo()
  const { standaloneMode } = useInjectedWidgetParams()
  const { isGeoBlockEnabled, isYieldEnabled, isRwaGeoblockEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isYieldWidget = tradeTypeInfo?.tradeType === TradeType.YIELD
  const { chainId: sourceChainId } = useSourceChainId()
  const bridgeNetworkInfo = useBridgeSupportedNetworks()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account

  return (
    <>
      <CowSdkUpdater />
      <FeatureFlagsUpdater />
      <BridgeProvidersUpdater />
      <ThemeConfigUpdater />
      <ThemeFromUrlUpdater />
      <ConnectionStatusUpdater />
      <TradingSdkUpdater />
      {/*Set custom chainId only when it differs from the wallet chainId*/}
      <WalletUpdater standaloneMode={standaloneMode} />
      <HwAccountIndexUpdater />
      <UserUpdater />
      <FinalizeTxUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      <OrdersFromApiUpdater />
      <GasUpdater />
      <SentryUpdater />
      <InFlightOrderFinalizeUpdater />
      <SpotPricesUpdater />
      <InjectedWidgetUpdater />
      <CowEventsUpdater />
      <UsdPricesUpdater />
      <OrdersNotificationsUpdater />
      <OrderProgressStateUpdater />
      <ProgressBarExecutingOrdersUpdater />
      <OrderProgressEventsUpdater />
      <SolversInfoUpdater />
      <AnnouncementsUpdater />
      <SurplusInvalidationListenerUpdater />
      <BridgingEnabledUpdater />
      <FaviconAnimationUpdater />

      <TokensListsUpdater
        chainId={sourceChainId}
        isGeoBlockEnabled={isGeoBlockEnabled}
        enableLpTokensByDefault={isYieldWidget}
        isYieldEnabled={isYieldEnabled}
        bridgeNetworkInfo={bridgeNetworkInfo?.data}
      />
      <RestrictedTokensListUpdater isRwaGeoblockEnabled={!!isRwaGeoblockEnabled} />
      <BlockedListSourcesUpdater />
      <RecentTokensStorageUpdater />
      <GeoDataUpdater />
      <TokensListsTagsUpdater />

      <WidgetTokensUpdater />

      <UnsupportedTokensUpdater />
      <CommonPriorityBalancesAndAllowancesUpdater />
      <LpBalancesAndAllowancesUpdater chainId={sourceChainId} account={balancesAccount} enablePolling={isYieldWidget} />
      <PoolsInfoUpdater />
      <LpTokensWithBalancesUpdater />
      <VampireAttackUpdater />
      <BalancesCombinedUpdater />
      <BalancesDevtools />
      <CorrelatedTokensUpdater />
      <BridgeOrdersCleanUpdater />
      <PendingBridgeOrdersUpdater />
      <LastTimePriceUpdateResetUpdater />
    </>
  )
}
