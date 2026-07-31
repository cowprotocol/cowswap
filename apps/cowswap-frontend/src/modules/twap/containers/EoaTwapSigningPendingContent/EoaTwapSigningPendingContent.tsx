import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'

import { MultiConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

interface EoaTwapSigningPendingContentProps {
  onDismiss: Command
}

export function EoaTwapSigningPendingContent({ onDismiss }: EoaTwapSigningPendingContentProps): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps(signingStep) : undefined
  }, [signingStep])

  if (!steps) {
    return null
  }

  const title = (
    <span>
      <Trans>Placing TWAP</Trans>
      {inputCurrencyAmount && outputCurrencyAmount ? (
        <>
          {': '}
          <TokenAmount amount={inputCurrencyAmount} tokenSymbol={inputCurrencyAmount.currency} />
          {' → '}
          <TokenSymbol token={outputCurrencyAmount.currency} />
        </>
      ) : null}
    </span>
  )

  return (
    <MultiConfirmationPendingContent
      title={title}
      description={t`Confirm each step in your wallet`}
      steps={steps}
      onDismiss={!!signingStep?.lockDismiss ? undefined : onDismiss}
    />
  )
}
