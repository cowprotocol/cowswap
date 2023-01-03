import { MulticallUpdater } from 'lib/state/multicall'
import ApplicationUpdater from 'state/application/updater'
import LogsUpdater from 'state/logs/updater'
import UserUpdater from 'state/user/updater'
import GnosisSafeUpdater from 'state/gnosisSafe/updater'
import RadialGradientByChainUpdater from 'theme/RadialGradientByChainUpdater'
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
import { GasPriceStrategyUpdater } from 'state/gas/gas-price-strategy-updater'
import { EthFlowSlippageUpdater, EthFlowDeadlineUpdater } from '@cow/modules/swap/state/EthFlow/updaters'
import { TokensListUpdater } from '@cow/modules/tokensList/TokensListUpdater'
import { TradeType, useTradeTypeInfo } from '@cow/modules/trade'

export function Updaters() {
  const info = useTradeTypeInfo()
  return (
    <>
      <RadialGradientByChainUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <EnhancedTransactionUpdater />
      <MulticallUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <ExpiredOrdersUpdater />
      {info?.tradeType === TradeType.SWAP && <FeesUpdater />}
      <UnfillableOrdersUpdater />
      <GpOrdersUpdater />
      <GasUpdater />
      <LogsUpdater />
      <SentryUpdater />
      <UploadToIpfsUpdater />
      <GnosisSafeUpdater />
      <GasPriceStrategyUpdater />
      <EthFlowSlippageUpdater />
      <EthFlowDeadlineUpdater />
      <TokensListUpdater />
    </>
  )
}
