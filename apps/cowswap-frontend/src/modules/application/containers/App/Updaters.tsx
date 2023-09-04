import { WalletUpdater, HwAccountIndexUpdater } from '@cowswap/wallet'

import ApplicationUpdater from 'legacy/state/application/updater'
import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'
import GasUpdater from 'legacy/state/gas/updater'
import ListsUpdater from 'legacy/state/lists/updater'
import LogsUpdater from 'legacy/state/logs/updater'
import { MulticallUpdater } from 'legacy/state/multicall'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { InjectedWidgetUpdater } from 'modules/injectedWidget'
import { EthFlowDeadlineUpdater, EthFlowSlippageUpdater } from 'modules/swap/state/EthFlow/updaters'
import { TokensListUpdater } from 'modules/tokensList/updaters/TokensListUpdater'
import { UsdPricesUpdater } from 'modules/usdAmount'

import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { CancelReplaceTxUpdater } from 'common/updaters/CancelReplaceTxUpdater'
import { FeesUpdater } from 'common/updaters/FeesUpdater'
import { FinalizeTxUpdater } from 'common/updaters/FinalizeTxUpdater'
import {
  CancelledOrdersUpdater,
  ExpiredOrdersUpdater,
  GpOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
} from 'common/updaters/orders'
import { SpotPricesUpdater } from 'common/updaters/orders/SpotPricesUpdater'
import { SentryUpdater } from 'common/updaters/SentryUpdater'
import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'
import { UserUpdater } from 'common/updaters/UserUpdater'

export function Updaters() {
  return (
    <>
      <WalletUpdater />
      <HwAccountIndexUpdater />
      <TokensListUpdater />
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <FinalizeTxUpdater />
      <CancelReplaceTxUpdater />
      <MulticallUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      <FeesUpdater />
      <UnfillableOrdersUpdater />
      <GpOrdersUpdater />
      <GasUpdater />
      <GasPriceStrategyUpdater />
      <LogsUpdater />
      <SentryUpdater />
      <UploadToIpfsUpdater />
      <EthFlowSlippageUpdater />
      <EthFlowDeadlineUpdater />
      <SpotPricesUpdater />
      <ThemeFromUrlUpdater />
      <InjectedWidgetUpdater />
      <TotalSurplusUpdater />
      <UsdPricesUpdater />
    </>
  )
}
