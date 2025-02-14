import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TokensListsUpdater, UnsupportedTokensUpdater, WidgetTokensListsUpdater } from '@cowprotocol/tokens'
import { HwAccountIndexUpdater, useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'

import { addListAnalytics, removeListAnalytics } from 'modules/analytics'
import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { BalancesCombinedUpdater } from 'modules/combinedBalances/updater/BalancesCombinedUpdater'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import { OrdersNotificationsUpdater } from 'modules/orders'
import { EthFlowDeadlineUpdater } from 'modules/swap/state/EthFlow/updaters'
import { useOnTokenListAddingError } from 'modules/tokensList'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { UsdPricesUpdater } from 'modules/usdAmount'
import { CorrelatedTokensUpdater } from 'modules/volumeFee'
import { LpTokensWithBalancesUpdater, PoolsInfoUpdater, VampireAttackUpdater } from 'modules/yield/shared'

import { ProgressBarV2ExecutingOrdersUpdater } from 'common/hooks/orderProgressBarV2'
import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { AnnouncementsUpdater } from 'common/updaters/AnnouncementsUpdater'
import { FeatureFlagsUpdater } from 'common/updaters/FeatureFlagsUpdater'
import { FeesUpdater } from 'common/updaters/FeesUpdater'
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
  const { chainId, account } = useWalletInfo()
  const { tokenLists, appCode, customTokens, standaloneMode } = useInjectedWidgetParams()
  const onTokenListAddingError = useOnTokenListAddingError()
  const { isGeoBlockEnabled, isYieldEnabled } = useFeatureFlags()
  const tradeTypeInfo = useTradeTypeInfo()
  const isYieldWidget = tradeTypeInfo?.tradeType === TradeType.YIELD

  return (
    <>
      <FeatureFlagsUpdater />
      <WalletUpdater standaloneMode={standaloneMode} />
      <HwAccountIndexUpdater />
      <UserUpdater />
      <FinalizeTxUpdater />
      {/*<CancelReplaceTxUpdater />*/}
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      <FeesUpdater />
      <UnfillableOrdersUpdater />
      <OrdersFromApiUpdater />
      <GasUpdater />
      <GasPriceStrategyUpdater />
      <SentryUpdater />
      <UploadToIpfsUpdater />
      <EthFlowDeadlineUpdater />
      <SpotPricesUpdater />
      <InjectedWidgetUpdater />
      <CowEventsUpdater />
      <TotalSurplusUpdater />
      <UsdPricesUpdater />
      <OrdersNotificationsUpdater />
      <ProgressBarV2ExecutingOrdersUpdater />
      <SolversInfoUpdater />
      <AnnouncementsUpdater />

      <TokensListsUpdater
        chainId={chainId}
        isGeoBlockEnabled={isGeoBlockEnabled}
        enableLpTokensByDefault={isYieldWidget}
        isYieldEnabled={isYieldEnabled}
      />
      <WidgetTokensListsUpdater
        tokenLists={tokenLists}
        customTokens={customTokens}
        appCode={appCode}
        onTokenListAddingError={onTokenListAddingError}
        onAddList={(source) => addListAnalytics('Success', source)}
        onRemoveList={(source) => removeListAnalytics('Confirm', source)}
      />
      <UnsupportedTokensUpdater />
      <BalancesAndAllowancesUpdater chainId={chainId} account={account} />
      <LpBalancesAndAllowancesUpdater chainId={chainId} account={account} enablePolling={isYieldWidget} />
      <PoolsInfoUpdater />
      <LpTokensWithBalancesUpdater />
      <VampireAttackUpdater />
      <BalancesCombinedUpdater />
      <CorrelatedTokensUpdater />
    </>
  )
}
