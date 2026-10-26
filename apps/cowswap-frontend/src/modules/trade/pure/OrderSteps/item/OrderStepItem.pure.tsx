import { ReactNode, useState } from 'react'

import { Collapsible, Icon, IconType, UI } from '@cowprotocol/ui'

import { Check, ChevronDown, X } from 'react-feather'

import * as styledEl from './OrderStepItem.styled'
import { OrderStepStatus } from './OrderStepItem.types'

const ICON_STROKE_WIDTH = 2.5

const ICONS_BY_STATUS = {
  upcoming: null,
  active: null,
  loading: null,
  success: <Check strokeWidth={ICON_STROKE_WIDTH} />,
  error: <X strokeWidth={ICON_STROKE_WIDTH} />,
  warning: <Icon image={IconType.ALERT} size={14} padding="0" color={UI.COLOR_ALERT_TEXT} />,
} as const satisfies Record<OrderStepStatus, ReactNode | null>

const EXPANDABLE_STATUSES = new Set(['success'])
const ALWAYS_EXPANDED_STATUSES = new Set(['active', 'loading', 'warning', 'error'])

export interface OrderStep {
  id: string
  label: ReactNode
  description?: string | ReactNode
  descriptionLabel?: ReactNode
  status: OrderStepStatus
}

export interface OrderStepItemProps {
  step: OrderStep
}

export function OrderStepItem({
  step: { label, description, descriptionLabel, status },
}: OrderStepItemProps): ReactNode {
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const hasDetails = description != null || descriptionLabel != null
  const canExpand = hasDetails && EXPANDABLE_STATUSES.has(status)
  const isExpanded = (canExpand && isUserExpanded) || ALWAYS_EXPANDED_STATUSES.has(status)

  return (
    <styledEl.StepItem data-status={status}>
      <Collapsible.Root
        open={isExpanded}
        onOpenChange={(open) => {
          if (!canExpand) return
          setIsUserExpanded(open)
        }}
        disabled={!canExpand}
      >
        <styledEl.StepsIconWrapper data-status={status}>{ICONS_BY_STATUS[status]}</styledEl.StepsIconWrapper>

        <styledEl.StepHeaderButton>
          <styledEl.StepLabel>{label}</styledEl.StepLabel>

          {canExpand ? (
            <styledEl.StepExpandIcon>
              <ChevronDown aria-hidden strokeWidth={ICON_STROKE_WIDTH} />
            </styledEl.StepExpandIcon>
          ) : null}
        </styledEl.StepHeaderButton>

        {hasDetails ? (
          <Collapsible.Panel keepMounted>
            <styledEl.StepDetailsInner>
              {descriptionLabel != null ? (
                <styledEl.StepDescriptionLabel>{descriptionLabel}</styledEl.StepDescriptionLabel>
              ) : null}
              {description != null ? typeof description === 'string' ? <p>{description}</p> : description : null}
            </styledEl.StepDetailsInner>
          </Collapsible.Panel>
        ) : null}
      </Collapsible.Root>
    </styledEl.StepItem>
  )
}
