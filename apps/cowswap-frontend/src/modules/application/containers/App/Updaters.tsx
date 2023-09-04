import { WalletUpdater, HwAccountIndexUpdater } from '@cowswap/wallet'

import ApplicationUpdater from 'legacy/state/application/updater'
import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'
import GasUpdater from 'legacy/state/gas/updater'
import ListsUpdater from 'legacy/state/lists/updater'
import LogsUpdater from 'legacy/state/logs/updater'
import { MulticallUpdater } from 'legacy/state/multicall'
import {
  CancelledOrdersUpdater,
  ExpiredOrdersUpdater,
  GpOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
} from 'legacy/state/orders/updaters'
import { SpotPricesUpdater } from 'legacy/state/orders/updaters/SpotPricesUpdater'
import FeesUpdater from 'legacy/state/price/updater'
import UserUpdater from 'legacy/state/user/updater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { InjectedWidgetUpdater } from 'modules/injectedWidget'
import { EthFlowDeadlineUpdater, EthFlowSlippageUpdater } from 'modules/swap/state/EthFlow/updaters'
import { TokensListUpdater } from 'modules/tokensList/updaters/TokensListUpdater'
import { UsdPricesUpdater } from 'modules/usdAmount'

import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { CancelReplaceTxUpdater } from 'common/updaters/CancelReplaceTxUpdater'
import { FinalizeTxUpdater } from 'common/updaters/FinalizeTxUpdater'
import { SentryUpdater } from 'common/updaters/SentryUpdater'
import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

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
