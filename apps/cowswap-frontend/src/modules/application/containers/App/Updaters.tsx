import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { MultiCallUpdater } from '@cowprotocol/multicall'
import { TokensListsTagsUpdater, TokensListsUpdater, UnsupportedTokensUpdater } from '@cowprotocol/tokens'
import { HwAccountIndexUpdater, useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'
import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { ThemeConfigUpdater } from 'theme/ThemeConfigUpdater'
import { TradingSdkUpdater } from 'tradingSdk/TradingSdkUpdater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { CommonPriorityBalancesAndAllowancesUpdater } from 'modules/balancesAndAllowances'
import { BalancesCombinedUpdater } from 'modules/combinedBalances/updater/BalancesCombinedUpdater'
import { InFlightOrderFinalizeUpdater } from 'modules/ethFlow'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import { ProgressBarExecutingOrdersUpdater } from 'modules/orderProgressBar'
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
  UnfillableOrdersUpdater,
} from 'common/updaters/orders'
import { SpotPricesUpdater } from 'common/updaters/orders/SpotPricesUpdater'
import { SentryUpdater } from 'common/updaters/SentryUpdater'
import { SolversInfoUpdater } from 'common/updaters/SolversInfoUpdater'
import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'
import { UserUpdater } from 'common/updaters/UserUpdater'
import { WidgetTokensUpdater } from 'common/updaters/WidgetTokensUpdater'

export function Updaters(): ReactNode {
  const { account } = useWalletInfo()
  const { standaloneMode } = useInjectedWidgetParams()
  const { isGeoBlockEnabled, isYieldEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isYieldWidget = tradeTypeInfo?.tradeType === TradeType.YIELD
  const sourceChainId = useSourceChainId()
  const bridgeNetworkInfo = useBridgeSupportedNetworks()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account

  return (
    <>
      <ThemeConfigUpdater />
      <ThemeFromUrlUpdater />
      <ConnectionStatusUpdater />
      <TradingSdkUpdater />
      <MultiCallUpdater chainId={sourceChainId} />
      <FeatureFlagsUpdater />
      <WalletUpdater standaloneMode={standaloneMode} />
      <HwAccountIndexUpdater />
      <UserUpdater />
      <FinalizeTxUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      <UnfillableOrdersUpdater />
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
      <SolversInfoUpdater />
      <AnnouncementsUpdater />
      <BridgingEnabledUpdater />

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
    </>
  )
}
