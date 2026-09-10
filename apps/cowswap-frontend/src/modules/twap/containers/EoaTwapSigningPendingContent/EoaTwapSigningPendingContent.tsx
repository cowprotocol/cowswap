import { useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { getExplorerAddressLink } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId } from 'entities/routes/routes.atom'

import { resetOrdersTableFiltersAtom, useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { OrderStep, OrderSteps } from 'modules/trade'

import { EoaTwapSuccessContent } from './EoaTwapSuccessContent.pure'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
import { EoaTwapCurrentStepButtonProps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export interface EoaTwapSigningPendingContentProps {
  steps: OrderStep[]
  buttonProps: EoaTwapCurrentStepButtonProps | null
  onDismiss(): void
}

export function EoaTwapSigningPendingContent({
  steps,
  buttonProps,
  onDismiss,
}: EoaTwapSigningPendingContentProps): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { chainId } = useWalletInfo()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const resetOrdersTableFilters = useSetAtom(resetOrdersTableFiltersAtom)

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

  return (
    <>
      <OrderSteps steps={steps} />

      {buttonProps && (
        <ButtonPrimary onClick={() => alert('Not implemented yet')} disabled={buttonProps.isDisabled}>
          {buttonProps.label}
        </ButtonPrimary>
      )}
    </>
  )
}
