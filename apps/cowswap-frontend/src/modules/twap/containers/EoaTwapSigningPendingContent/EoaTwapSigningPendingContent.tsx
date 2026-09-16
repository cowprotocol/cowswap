import { useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { getExplorerTwapOrderLink } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId } from 'entities/routes/routes.atom'

import { resetOrdersTableFiltersAtom, useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { OrderStep, OrderSteps, useSetOrdersTableDrawerOpen } from 'modules/trade'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

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
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const onViewOrders = useCallback(() => {
    // TODO: We could improve this by only resetting the filters if we know for sure the new order is not going to be visible:
    resetOrdersTableFilters()
    onDismiss()
    navigateToOrdersTableTab(OrderTabId.OPEN)

    if (isUpToLarge) {
      setOrdersTableDrawerOpen(true)
    }
  }, [isUpToLarge, navigateToOrdersTableTab, onDismiss, resetOrdersTableFilters, setOrdersTableDrawerOpen])

  if (!signingStep) return null

  if (signingStep.step === EoaTwapSigningSteps.Success) {
    const explorerUrl =
      chainId && signingStep.eventId ? getExplorerTwapOrderLink(chainId, signingStep.eventId) : undefined

    return <EoaTwapSuccessContent explorerUrl={explorerUrl} onNewTrade={onDismiss} onViewOrders={onViewOrders} />
  }

  return (
    <>
      <OrderSteps steps={steps} />

      {buttonProps && <TradeFormBlankButton {...buttonProps} onClick={() => alert('Not implemented yet')} />}
    </>
  )
}
