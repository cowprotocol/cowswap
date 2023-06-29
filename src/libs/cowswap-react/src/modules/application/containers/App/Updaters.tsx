import ApplicationUpdater from 'legacy/state/application/updater'
import EnhancedTransactionUpdater from 'legacy/state/enhancedTransactions/updater'
import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'
import GasUpdater from 'legacy/state/gas/updater'
import ListsUpdater from 'legacy/state/lists/updater'
import LogsUpdater from 'legacy/state/logs/updater'
import {
  GpOrdersUpdater,
  CancelledOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
  ExpiredOrdersUpdater,
} from 'legacy/state/orders/updaters'
import { SpotPricesUpdater } from 'legacy/state/orders/updaters/SpotPricesUpdater'
import FeesUpdater from 'legacy/state/price/updater'
import SentryUpdater from 'legacy/state/sentry/updater'
import UserUpdater from 'legacy/state/user/updater'

import { UploadToIpfsUpdater, AppDataUpdater } from 'modules/appData'
import { InjectedWidgetUpdater } from 'modules/injectedWidget'
import { EthFlowSlippageUpdater, EthFlowDeadlineUpdater } from 'modules/swap/state/EthFlow/updaters'
import { TokensListUpdater } from 'modules/tokensList/updaters/TokensListUpdater'
import { WalletUpdater } from 'modules/wallet'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'
import { MulticallUpdater } from 'lib/state/multicall'

export function Updaters() {
  return (
    <>
      <WalletUpdater />
      <TokensListUpdater />
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <EnhancedTransactionUpdater />
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
      <AppDataUpdater />
      <EthFlowSlippageUpdater />
      <EthFlowDeadlineUpdater />
      <SpotPricesUpdater />
      <ThemeFromUrlUpdater />
      <InjectedWidgetUpdater />
    </>
  )
}
