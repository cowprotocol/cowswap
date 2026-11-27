import { ReactNode } from 'react'

import { getExplorerTwapOrderLink } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderStep, OrderSteps } from 'modules/trade'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { EoaTwapSuccessContent } from './EoaTwapSuccessContent.pure'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'
import { EoaTwapCurrentStepButtonProps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export interface EoaTwapSigningPendingContentProps {
  steps: OrderStep[]
  buttonProps: EoaTwapCurrentStepButtonProps | null
  onViewOrders(): void
}

export function EoaTwapSigningPendingContent({
  steps,
  buttonProps,
  onViewOrders,
}: EoaTwapSigningPendingContentProps): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { chainId } = useWalletInfo()

  if (!signingStep) return null

  if (signingStep.step === EoaTwapSigningSteps.Success) {
    const explorerUrl =
      chainId && signingStep.eventId ? getExplorerTwapOrderLink(chainId, signingStep.eventId) : undefined

    return <EoaTwapSuccessContent explorerUrl={explorerUrl} onViewOrders={onViewOrders} />
  }

  return (
    <>
      <OrderSteps steps={steps} />

      {buttonProps && <TradeFormBlankButton {...buttonProps} onClick={() => alert('Not implemented yet')} />}
    </>
  )
}
