import { ReactNode, useState } from 'react'

import { Command } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'
import { Check, X, AlertTriangle, ChevronDown } from 'react-feather'

import { ExpandableContent } from 'common/pure/ExpandableContent/ExpandableContent.pure'

import * as styledEl from './MultiConfirmationPendingContent.styled'

import { ConfirmationPendingContentShell } from '../ConfirmationPendingContentShell'

export interface MultiConfirmationPendingStep {
  id: string
  label: ReactNode
  description?: string | ReactNode
  status: MultiConfirmationPendingStepStatus
}

export type MultiConfirmationPendingStepStatus = 'upcoming' | 'active' | 'loading' | 'success' | 'error' | 'warning'

interface MultiConfirmationItemProps {
  step: MultiConfirmationPendingStep
}

interface MultiConfirmationPendingContentProps {
  title: ReactNode
  description: ReactNode
  modalMode?: boolean

  /**
   * Arbitrary multi-step progress.
   */
  steps: MultiConfirmationPendingStep[]

  /** Hide the back/close button if `onDismiss` is `undefined`. */
  onDismiss?: Command
}

export function MultiConfirmationPendingContent({
  title,
  description,
  modalMode,
  steps,
  onDismiss,
}: MultiConfirmationPendingContentProps): ReactNode {
  return (
    <ConfirmationPendingContentShell
      title={title}
      onDismiss={onDismiss}
      modalMode={modalMode}
      description={
        <>
          <span>{description}</span>
          <br />
          <Trans>Follow these steps:</Trans>
        </>
      }
    >
      <styledEl.StepsList>
        {steps.map((step) => (
          <MultiConfirmationItem key={step.id} step={step} />
        ))}
      </styledEl.StepsList>
    </ConfirmationPendingContentShell>
  )
}

const ICON_STROKE_WIDTH = 2.5

const ICONS_BY_STATUS = {
  upcoming: null,
  active: null,
  loading: null,
  success: <Check strokeWidth={ICON_STROKE_WIDTH} />,
  error: <X strokeWidth={ICON_STROKE_WIDTH} />,
  warning: <AlertTriangle strokeWidth={ICON_STROKE_WIDTH} />,
} as const satisfies Record<MultiConfirmationPendingStepStatus, ReactNode | null>

const EXPANDABLE_STATUSES = new Set(['success', 'error', 'warning'])
const ALWAYS_EXPANDED_STATUSES = new Set(['active', 'loading'])

function MultiConfirmationItem({ step: { label, description, status } }: MultiConfirmationItemProps): ReactNode {
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const canExpand = !!description && EXPANDABLE_STATUSES.has(status)
  const isExpanded = (canExpand && isUserExpanded) || ALWAYS_EXPANDED_STATUSES.has(status)

  const toggleIsUserExpanded = (): void => setIsUserExpanded((prev) => !prev)

  return (
    <styledEl.StepItem data-status={status}>
      <styledEl.StepsIconWrapper data-status={status}>{ICONS_BY_STATUS[status]}</styledEl.StepsIconWrapper>

      <styledEl.StepHeaderButton onClick={toggleIsUserExpanded} aria-expanded={isUserExpanded} disabled={!canExpand}>
        <styledEl.StepLabel>{label}</styledEl.StepLabel>

        {canExpand ? (
          <styledEl.StepExpandIcon>
            <ChevronDown aria-label={isUserExpanded ? 'Collapse' : 'Expand'} strokeWidth={ICON_STROKE_WIDTH} />
          </styledEl.StepExpandIcon>
        ) : null}
      </styledEl.StepHeaderButton>

      {description != null ? (
        <ExpandableContent expanded={isExpanded}>
          <styledEl.StepDetailsInner>
            {typeof description === 'string' ? <p>{description}</p> : description}
          </styledEl.StepDetailsInner>
        </ExpandableContent>
      ) : null}
    </styledEl.StepItem>
  )
}
