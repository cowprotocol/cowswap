import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { getExplorerTwapOrderLink } from '@cowprotocol/common-utils'
import { Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useRevealOrderInOrdersTable } from 'modules/ordersTable'
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
  const revealOrderInOrdersTable = useRevealOrderInOrdersTable()
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const onViewOrders = useCallback(async () => {
    const orderId = signingStep?.eventId

    onDismiss()

    if (isUpToLarge) {
      setOrdersTableDrawerOpen(true)
    }

    if (orderId) {
      await revealOrderInOrdersTable(orderId, OrderTabId.OPEN)
    }
  }, [isUpToLarge, onDismiss, revealOrderInOrdersTable, setOrdersTableDrawerOpen, signingStep?.eventId])

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
