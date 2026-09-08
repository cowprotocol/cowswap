import { useSetAtom } from 'jotai'
import { ReactNode, useCallback, useMemo } from 'react'

import { getExplorerAddressLink } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { resetOrdersTableFiltersAtom, useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { OrderSteps } from 'modules/trade'

import { EoaTwapSuccessContent } from './EoaTwapSuccessContent.pure'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export interface EoaTwapSigningPendingContentProps {
  onDismiss(): void
}

export function EoaTwapSigningPendingContent({ onDismiss }: EoaTwapSigningPendingContentProps): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { chainId } = useWalletInfo()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const resetOrdersTableFilters = useSetAtom(resetOrdersTableFiltersAtom)
  const token = inputCurrencyAmount?.currency
  const symbol = token?.symbol

  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps({ signingStep, symbol, token }) : null
  }, [signingStep, symbol, token])

  const onViewOrders = useCallback(() => {
    // TODO: We could improve this by only resetting the filters if we know for sure the new order is not going to be visible:
    resetOrdersTableFilters()
    onDismiss()
    navigateToOrdersTableTab(OrderTabId.OPEN)
  }, [navigateToOrdersTableTab, onDismiss, resetOrdersTableFilters])

  if (!signingStep) return null

  if (signingStep.step === EoaTwapSigningSteps.Success) {
    // CoW Explorer does not support TWAP setup txs yet. Restore this when it does:
    // const explorerUrl =
    //   chainId && signingStep.setupTxHash ? `${getExplorerBaseUrl(chainId)}/tx/${signingStep.setupTxHash}` : undefined
    const explorerUrl =
      chainId && signingStep.proxyAddress ? getExplorerAddressLink(chainId, signingStep.proxyAddress) : undefined

    return <EoaTwapSuccessContent explorerUrl={explorerUrl} onNewTrade={onDismiss} onViewOrders={onViewOrders} />
  }

  if (!steps) return null

  return <OrderSteps steps={steps} />
}
