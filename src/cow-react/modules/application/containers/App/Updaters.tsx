import { MulticallUpdater } from 'lib/state/multicall'
import ApplicationUpdater from 'state/application/updater'
import ListsUpdater from 'state/lists/updater'
import LogsUpdater from 'state/logs/updater'
import UserUpdater from 'state/user/updater'
import EnhancedTransactionUpdater from 'state/enhancedTransactions/updater'
import FeesUpdater from 'state/price/updater'
import GasUpdater from 'state/gas/updater'
import SentryUpdater from 'state/sentry/updater'
import {
  GpOrdersUpdater,
  CancelledOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
  ExpiredOrdersUpdater,
} from 'state/orders/updaters'

import { UploadToIpfsUpdater } from 'state/appData/updater'
import { EthFlowSlippageUpdater, EthFlowDeadlineUpdater } from '@cow/modules/swap/state/EthFlow/updaters'
import { TokensListUpdater } from '@cow/modules/tokensList/updaters/TokensListUpdater'
import { AppDataUpdater } from 'state/appData/AppDataInfoUpdater'
import { WalletUpdater } from '@cow/modules/wallet'
import { GasPriceStrategyUpdater } from 'state/gas/gas-price-strategy-updater'
import { SpotPricesUpdater } from 'state/orders/updaters/SpotPricesUpdater'

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
    </>
  )
}
