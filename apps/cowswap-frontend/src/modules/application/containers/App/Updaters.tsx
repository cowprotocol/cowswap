import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { TokensListsUpdater, UnsupportedTokensUpdater } from '@cowprotocol/tokens'
import { useWalletInfo, WalletUpdater } from '@cowprotocol/wallet'

import { GasPriceStrategyUpdater } from 'legacy/state/gas/gas-price-strategy-updater'

import { UploadToIpfsUpdater } from 'modules/appData/updater/UploadToIpfsUpdater'
import { InjectedWidgetUpdater } from 'modules/injectedWidget'
import { EthFlowDeadlineUpdater, EthFlowSlippageUpdater } from 'modules/swap/state/EthFlow/updaters'
import { UsdPricesUpdater } from 'modules/usdAmount'

import { TotalSurplusUpdater } from 'common/state/totalSurplusState'
import { ApplicationUpdater } from 'common/updaters/ApplicationUpdater'
import { CancelReplaceTxUpdater } from 'common/updaters/CancelReplaceTxUpdater'
import { FeesUpdater } from 'common/updaters/FeesUpdater'
import { FinalizeTxUpdater } from 'common/updaters/FinalizeTxUpdater'
import { GasUpdater } from 'common/updaters/GasUpdater'
import { HwAccountIndexUpdater } from 'common/updaters/HwAccountIndexUpdater'
import { LogsUpdater } from 'common/updaters/LogsUpdater'
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
  const { chainId, account } = useWalletInfo()

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
      <TokensListsUpdater chainId={chainId} />
      <UnsupportedTokensUpdater />
      <BalancesAndAllowancesUpdater chainId={chainId} account={account} />
    </>
  )
}
