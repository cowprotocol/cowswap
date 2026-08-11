import { ReactNode, useState } from 'react'

import { AlertTriangle, Check, ChevronDown, X } from 'react-feather'

import { ExpandableContent } from 'common/pure/ExpandableContent/ExpandableContent.pure'

import * as styledEl from './OrderStepItem.styled'

const ICON_STROKE_WIDTH = 2.5

const ICONS_BY_STATUS = {
  upcoming: null,
  active: null,
  loading: null,
  success: <Check strokeWidth={ICON_STROKE_WIDTH} />,
  error: <X strokeWidth={ICON_STROKE_WIDTH} />,
  warning: <AlertTriangle strokeWidth={ICON_STROKE_WIDTH} />,
} as const satisfies Record<OrderStepStatus, ReactNode | null>

const EXPANDABLE_STATUSES = new Set(['success', 'error', 'warning'])
const ALWAYS_EXPANDED_STATUSES = new Set(['active', 'loading'])

export interface OrderStep {
  id: string
  label: ReactNode
  description?: string | ReactNode
  status: OrderStepStatus
}

export interface OrderStepItemProps {
  step: OrderStep
}

export type OrderStepStatus = 'upcoming' | 'active' | 'loading' | 'success' | 'error' | 'warning'

export function OrderStepItem({ step: { label, description, status } }: OrderStepItemProps): ReactNode {
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
