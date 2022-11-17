import React, { useMemo } from 'react'
import { X, Plus, Check } from 'react-feather'
import styled from 'styled-components/macro'
import { ExplorerLinkStyled, EthFlowStepperProps, SmartOrderStatus } from '..'
import { Step, StepProps } from '../Step'

const ErrorMessage = styled.span`
  color: #f25757;
`

type Step2Config = StepProps & { error?: string }

export function Step2({ order }: EthFlowStepperProps) {
  const { state, isExpired, orderId, rejectedReason } = order
  const isCreating = state === SmartOrderStatus.CREATING
  const isIndexing = state === SmartOrderStatus.CREATION_MINED
  const isOrderCreated = !(isCreating || isIndexing)

  const expiredBeforeCreate = isExpired && (isCreating || isIndexing)

  // Get config for Step 2
  const {
    label,
    state: stepState,
    icon,
    error,
  } = useMemo<Step2Config>(() => {
    if (expiredBeforeCreate) {
      return {
        label: 'Order Creation Failed',
        error: 'Expired before creation',
        state: 'error',
        icon: X,
      }
    }

    if (isCreating) {
      return {
        label: 'Create Order',
        state: 'not-started',
        icon: Plus,
      }
    }

    if (isIndexing) {
      return {
        label: 'Creating Order',
        state: 'pending',
        icon: Plus,
      }
    }

    if (rejectedReason) {
      return {
        label: 'Order Creation Failed',
        state: 'error',
        icon: X,
      }
    }

    return {
      label: 'Order Created',
      state: 'success',
      icon: Check,
    }
  }, [expiredBeforeCreate, isCreating, isIndexing, rejectedReason])

  const errorMessage = error || rejectedReason
  return (
    <Step state={stepState} icon={icon} label={label}>
      <>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
      </>
    </Step>
  )
}
