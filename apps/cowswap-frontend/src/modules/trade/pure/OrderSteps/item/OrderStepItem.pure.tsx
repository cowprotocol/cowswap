import { ReactNode, useState } from 'react'

import { Currency } from '@cowprotocol/currency'
import { Icon, IconType, UI } from '@cowprotocol/ui'

import { Check, ChevronDown, X } from 'react-feather'

import { ExpandableContent } from 'common/pure/ExpandableContent/ExpandableContent.pure'

import * as styledEl from './OrderStepItem.styled'
import { OrderStepStatus } from './OrderStepItem.types'

import { OrderStepTokenInfo } from '../token-info/OrderStepTokenInfo.pure'

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
  token?: Currency
  status: OrderStepStatus
}

export interface OrderStepItemProps {
  step: OrderStep
}

export function OrderStepItem({
  step: { label, description, descriptionLabel, token, status },
}: OrderStepItemProps): ReactNode {
  const [isUserExpanded, setIsUserExpanded] = useState(false)
  const hasDetails = description != null || descriptionLabel != null || token != null
  const canExpand = hasDetails && EXPANDABLE_STATUSES.has(status)
  const isExpanded = (canExpand && isUserExpanded) || ALWAYS_EXPANDED_STATUSES.has(status)

  const toggleIsUserExpanded = (): void => setIsUserExpanded((prev) => !prev)

  return (
    <styledEl.StepItem data-status={status}>
      <styledEl.StepsIconWrapper data-status={status}>{ICONS_BY_STATUS[status]}</styledEl.StepsIconWrapper>

      <styledEl.StepHeaderButton
        type="button"
        onClick={toggleIsUserExpanded}
        aria-expanded={canExpand ? isUserExpanded : undefined}
        disabled={!canExpand}
      >
        <styledEl.StepLabel>{label}</styledEl.StepLabel>

        {canExpand ? (
          <styledEl.StepExpandIcon>
            <ChevronDown aria-hidden strokeWidth={ICON_STROKE_WIDTH} />
          </styledEl.StepExpandIcon>
        ) : null}
      </styledEl.StepHeaderButton>

      {hasDetails ? (
        <ExpandableContent expanded={isExpanded}>
          <styledEl.StepDetailsInner>
            {descriptionLabel != null ? (
              <styledEl.StepDescriptionLabel>{descriptionLabel}</styledEl.StepDescriptionLabel>
            ) : null}
            {description != null ? typeof description === 'string' ? <p>{description}</p> : description : null}
            {token ? <OrderStepTokenInfo token={token} /> : null}
          </styledEl.StepDetailsInner>
        </ExpandableContent>
      ) : null}
    </styledEl.StepItem>
  )
}
