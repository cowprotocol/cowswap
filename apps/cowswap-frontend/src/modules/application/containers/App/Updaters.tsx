import { useCowAnalytics } from '@cowprotocol/analytics'
import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { MultiCallUpdater } from '@cowprotocol/multicall'
import {
  TokensListsTagsUpdater,
  TokensListsUpdater,
  UnsupportedTokensUpdater,
  WidgetTokensListsUpdater,
} from '@cowprotocol/tokens'
import { HwAccountIndexUpdater, useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { TradingSdkUpdater } from 'tradingSdk/TradingSdkUpdater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { useBridgeSupportedNetworks } from 'modules/bridge'
import { BalancesCombinedUpdater } from 'modules/combinedBalances/updater/BalancesCombinedUpdater'
import { InFlightOrderFinalizeUpdater } from 'modules/ethFlow'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import { ProgressBarExecutingOrdersUpdater } from 'modules/orderProgressBarMixed/orderProgressBar'
import { OrdersNotificationsUpdater } from 'modules/orders'
import { useOnTokenListAddingError, useSourceChainId } from 'modules/tokensList'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { UsdPricesUpdater } from 'modules/usdAmount'
import { CorrelatedTokensUpdater } from 'modules/volumeFee'
import { LpTokensWithBalancesUpdater, PoolsInfoUpdater, VampireAttackUpdater } from 'modules/yield/shared'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { AnnouncementsUpdater } from 'common/updaters/AnnouncementsUpdater'
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
import { UserUpdater } from 'common/updaters/UserUpdater'

export function Updaters() {
  const { account } = useWalletInfo()
  const { tokenLists, appCode, customTokens, standaloneMode } = useInjectedWidgetParams()
  const onTokenListAddingError = useOnTokenListAddingError()
  const { isGeoBlockEnabled, isYieldEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isYieldWidget = tradeTypeInfo?.tradeType === TradeType.YIELD
  const cowAnalytics = useCowAnalytics()
  const sourceChainId = useSourceChainId()
  const bridgeNetworkInfo = useBridgeSupportedNetworks()

  return (
    <>
      <TradingSdkUpdater />
      <MultiCallUpdater chainId={sourceChainId} />
      <FeatureFlagsUpdater />
      <WalletUpdater standaloneMode={standaloneMode} />
      <HwAccountIndexUpdater />
      <UserUpdater />
      <FinalizeTxUpdater />
      {/*<CancelReplaceTxUpdater />*/}
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

      <TokensListsUpdater
        chainId={sourceChainId}
        isGeoBlockEnabled={isGeoBlockEnabled}
        enableLpTokensByDefault={isYieldWidget}
        isYieldEnabled={isYieldEnabled}
        bridgeNetworkInfo={bridgeNetworkInfo?.data}
      />
      <TokensListsTagsUpdater />
      <WidgetTokensListsUpdater
        tokenLists={tokenLists}
        customTokens={customTokens}
        appCode={appCode}
        onTokenListAddingError={onTokenListAddingError}
        onAddList={(source) => {
          cowAnalytics.sendEvent({
            category: CowSwapAnalyticsCategory.LIST,
            action: 'Add List Success',
            label: source,
          })
        }}
        onRemoveList={(source) => {
          cowAnalytics.sendEvent({
            category: CowSwapAnalyticsCategory.LIST,
            action: 'Remove List',
            label: source,
          })
        }}
      />
      <UnsupportedTokensUpdater />
      <BalancesAndAllowancesUpdater chainId={sourceChainId} account={account} />
      <LpBalancesAndAllowancesUpdater chainId={sourceChainId} account={account} enablePolling={isYieldWidget} />
      <PoolsInfoUpdater />
      <LpTokensWithBalancesUpdater />
      <VampireAttackUpdater />
      <BalancesCombinedUpdater />
      <CorrelatedTokensUpdater />
    </>
  )
}
