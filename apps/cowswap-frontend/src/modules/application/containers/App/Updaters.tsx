import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { MultiCallUpdater } from '@cowprotocol/multicall'
import { TokensListsTagsUpdater, TokensListsUpdater, UnsupportedTokensUpdater } from '@cowprotocol/tokens'
import { HwAccountIndexUpdater, useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { CowSdkUpdater } from 'cowSdk'
import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { BridgeOrdersCleanUpdater } from 'entities/bridgeOrders'
import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { ThemeConfigUpdater } from 'theme/ThemeConfigUpdater'
import { TradingSdkUpdater } from 'tradingSdk/TradingSdkUpdater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { CommonPriorityBalancesAndAllowancesUpdater } from 'modules/balancesAndAllowances'
import { PendingBridgeOrdersUpdater } from 'modules/bridge'
import { BalancesCombinedUpdater } from 'modules/combinedBalances/updater/BalancesCombinedUpdater'
import { InFlightOrderFinalizeUpdater } from 'modules/ethFlow'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import { OrderProgressEventsUpdater, ProgressBarExecutingOrdersUpdater } from 'modules/orderProgressBar'
import { OrdersNotificationsUpdater } from 'modules/orders'
import { useSourceChainId } from 'modules/tokensList'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { UsdPricesUpdater } from 'modules/usdAmount'
import { CorrelatedTokensUpdater } from 'modules/volumeFee'
import { LpTokensWithBalancesUpdater, PoolsInfoUpdater, VampireAttackUpdater } from 'modules/yield/shared'

import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { AnnouncementsUpdater } from 'common/updaters/AnnouncementsUpdater'
import { BridgingEnabledUpdater } from 'common/updaters/BridgingEnabledUpdater'
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
  const { isGeoBlockEnabled, isYieldEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isYieldWidget = tradeTypeInfo?.tradeType === TradeType.YIELD
  const { chainId: sourceChainId, source: sourceChainSource } = useSourceChainId()
  const bridgeNetworkInfo = useBridgeSupportedNetworks()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account

  return (
    <>
      <CowSdkUpdater />
      <ThemeConfigUpdater />
      <ThemeFromUrlUpdater />
      <ConnectionStatusUpdater />
      <TradingSdkUpdater />
      {/*Set custom chainId only when it differs from the wallet chainId*/}
      {/*MultiCallUpdater will use wallet network by default if custom chainId is not provided*/}
      <MultiCallUpdater chainId={sourceChainSource === 'wallet' ? undefined : sourceChainId} />
      <FeatureFlagsUpdater />
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
      <UploadToIpfsUpdater />
      <InFlightOrderFinalizeUpdater />
      <SpotPricesUpdater />
      <InjectedWidgetUpdater />
      <CowEventsUpdater />
      <TotalSurplusUpdater />
      <UsdPricesUpdater />
      <OrdersNotificationsUpdater />
      <ProgressBarExecutingOrdersUpdater />
      <OrderProgressEventsUpdater />
      <SolversInfoUpdater />
      <AnnouncementsUpdater />
      <BridgingEnabledUpdater />
      <FaviconAnimationUpdater />

      <TokensListsUpdater
        chainId={sourceChainId}
        isGeoBlockEnabled={isGeoBlockEnabled}
        enableLpTokensByDefault={isYieldWidget}
        isYieldEnabled={isYieldEnabled}
        bridgeNetworkInfo={bridgeNetworkInfo?.data}
      />
      <TokensListsTagsUpdater />

      <WidgetTokensUpdater />

      <UnsupportedTokensUpdater />
      <CommonPriorityBalancesAndAllowancesUpdater />
      <LpBalancesAndAllowancesUpdater chainId={sourceChainId} account={balancesAccount} enablePolling={isYieldWidget} />
      <PoolsInfoUpdater />
      <LpTokensWithBalancesUpdater />
      <VampireAttackUpdater />
      <BalancesCombinedUpdater />
      <CorrelatedTokensUpdater />
      <BridgeOrdersCleanUpdater />
      <PendingBridgeOrdersUpdater />
      <LastTimePriceUpdateResetUpdater />
    </>
  )
}
