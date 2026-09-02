import { ReactNode, useMemo } from 'react'

import { Currency } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { OrderStep, OrderSteps } from 'modules/trade'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import * as styledEl from './EoaTwapSigningPendingContent.styled'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

export function EoaTwapSigningPendingContent(): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const token = inputCurrencyAmount?.currency
  const symbol = token?.symbol
  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps({ signingStep, symbol, token }) : undefined
  }, [signingStep, symbol, token])
  const demoSteps = useMemo(() => buildEoaTwapDemoOrderSteps(token), [token])

  if (!steps) {
    return null
  }

  return (
    <>
      <OrderSteps steps={steps} />
      {/* Demo-only: warning/error tracker states are not wired to the signing flow yet. */}
      <styledEl.DemoTracker>
        <styledEl.DemoTrackerLabel>{t`Demo states`}</styledEl.DemoTrackerLabel>
        <OrderSteps steps={demoSteps} />
      </styledEl.DemoTracker>
    </>
  )
}

function buildEoaTwapDemoOrderSteps(token: Currency | undefined): OrderStep[] {
  const symbol = token?.symbol
  const approveLabel = symbol ? t`Approve ${symbol}` : t`Approve`
  const approveDescription = t`Confirm the approval transaction in your connected wallet.`
  const approvalToken = token ? { token } : {}

  return [
    {
      id: 'demo-upcoming',
      label: t`Activating TWAP`,
      status: 'upcoming',
    },
    {
      id: 'demo-active',
      label: t`Set up TWAP`,
      description: t`Confirm this required setup signature in your connected wallet.`,
      status: 'active',
    },
    {
      id: 'demo-loading',
      label: t`Sign TWAP`,
      description: (
        <p>
          {t`Verifying approval`}
          <ThreeDots />
        </p>
      ),
      status: 'loading',
    },
    {
      id: 'demo-success',
      label: approveLabel,
      description: approveDescription,
      status: 'success',
      ...approvalToken,
    },
    {
      id: 'demo-warning',
      label: approveLabel,
      descriptionLabel: t`Transaction rejected`,
      description: approveDescription,
      status: 'warning',
      ...approvalToken,
    },
    {
      id: 'demo-error',
      label: t`Set up TWAP`,
      descriptionLabel: t`Setup signature failed`,
      description: t`The wallet request was rejected or expired. Try again to continue.`,
      status: 'error',
    },
  ]
}
