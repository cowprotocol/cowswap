import React, { useCallback } from 'react'
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
  const { label, statusIconState, icon, error } = useCallback<() => Step2Config>(() => {
    if (expiredBeforeCreate) {
      return {
        label: 'Order Creation Failed',
        errorMessage: 'Expired before creation',
        statusIconState: 'error',
        icon: X,
      }
    }

    if (isCreating) {
      return {
        label: 'Create Order',
        statusIconState: 'not-started',
        icon: Plus,
      }
    }

    if (isIndexing) {
      return {
        label: 'Creating Order',
        statusIconState: 'pending',
        icon: Plus,
      }
    }

    if (rejectedReason) {
      return {
        label: 'Order Creation Failed',
        statusIconState: 'error',
        icon: X,
      }
    }

    return {
      label: 'Order Created',
      statusIconState: 'success',
      icon: Check,
    }
  }, [expiredBeforeCreate, isCreating, isIndexing, rejectedReason])()

  const errorMessage = error || rejectedReason
  const details = (
    <>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {isOrderCreated && <ExplorerLinkStyled type="transaction" label="View details" id={orderId} />}
    </>
  )
  return <Step statusIconState={statusIconState} details={details} icon={icon} label={label} />
}
