import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TokensListsUpdater, UnsupportedTokensUpdater, WidgetTokensListsUpdater } from '@cowprotocol/tokens'
import { useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { CowEventsUpdater, InjectedWidgetUpdater, useInjectedWidgetParams } from 'modules/injectedWidget'
import { FinalizeTxUpdater } from 'modules/onchainTransactions'
import { OrdersNotificationsUpdater } from 'modules/orders'
import { EthFlowDeadlineUpdater, EthFlowSlippageUpdater } from 'modules/swap/state/EthFlow/updaters'
import { useOnTokenListAddingError } from 'modules/tokensList'
import { UsdPricesUpdater } from 'modules/usdAmount'

import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { ApplicationUpdater } from 'common/updaters/ApplicationUpdater'
import { CancelReplaceTxUpdater } from 'common/updaters/CancelReplaceTxUpdater'
import { FeesUpdater } from 'common/updaters/FeesUpdater'
import { GasUpdater } from 'common/updaters/GasUpdater'
import { HwAccountIndexUpdater } from 'common/updaters/HwAccountIndexUpdater'
import {
  CancelledOrdersUpdater,
  ExpiredOrdersUpdater,
  GpOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
} from 'common/updaters/orders'
import { SpotPricesUpdater } from 'common/updaters/orders/SpotPricesUpdater'
import { SentryUpdater } from 'common/updaters/SentryUpdater'
import { UserUpdater } from 'common/updaters/UserUpdater'

export function Updaters() {
  const { chainId, account } = useWalletInfo()
  const { tokenLists, appCode, customTokens } = useInjectedWidgetParams()
  const onTokenListAddingError = useOnTokenListAddingError()
  const { isGeoBlockEnabled } = useFeatureFlags()

  return (
    <>
      <WalletUpdater />
      <HwAccountIndexUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <FinalizeTxUpdater />
      <CancelReplaceTxUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      <FeesUpdater />
      <UnfillableOrdersUpdater />
      <GpOrdersUpdater />
      <GasUpdater />
      <GasPriceStrategyUpdater />
      <SentryUpdater />
      <UploadToIpfsUpdater />
      <EthFlowSlippageUpdater />
      <EthFlowDeadlineUpdater />
      <SpotPricesUpdater />
      <InjectedWidgetUpdater />
      <CowEventsUpdater />
      <TotalSurplusUpdater />
      <UsdPricesUpdater />
      <OrdersNotificationsUpdater />

      <TokensListsUpdater chainId={chainId} isGeoBlockEnabled={isGeoBlockEnabled} />
      <WidgetTokensListsUpdater
        tokenLists={tokenLists}
        customTokens={customTokens}
        appCode={appCode}
        onTokenListAddingError={onTokenListAddingError}
      />
      <UnsupportedTokensUpdater />
      <BalancesAndAllowancesUpdater chainId={chainId} account={account} />
    </>
  )
}
