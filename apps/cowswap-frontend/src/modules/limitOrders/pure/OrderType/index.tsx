import { ReactNode } from 'react'

import IMAGE_CARET_DOWN from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { InfoTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { Menu } from '@reach/menu-button'

import { DetailsRow } from 'modules/limitOrders/pure/LimitOrdersDetails/styled'
import { PartiallyFillableOverrideDispatcherType } from 'modules/limitOrders/state/partiallyFillableOverride'

import * as styledEl from './styled'

export type OrderTypeProps = {
  isPartiallyFillable: boolean
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  className?: string
}

export function OrderType(props: OrderTypeProps): ReactNode {
  const {
    isPartiallyFillable,
    className,
    partiallyFillableOverride: [override],
  } = props
  const { t } = useLingui()
  const textContent =
    (override ?? isPartiallyFillable)
      ? t`This order can be partially filled`
      : t`This order will either be filled completely or not filled.`

  return (
    <DetailsRow className={className}>
      <RowFixed>
        <p>
          <Trans>Order type</Trans>
        </p>
        <InfoTooltip content={textContent} />
      </RowFixed>
      <OrderTypePicker {...props} />
    </DetailsRow>
  )
}

function OrderTypePicker({ isPartiallyFillable, partiallyFillableOverride }: OrderTypeProps): ReactNode {
  const { t } = useLingui()
  const LABELS = [t`Partially fillable`, t`Fill or kill`]
  const [override, setOverride] = partiallyFillableOverride
  const showPartiallyFillable = override ?? isPartiallyFillable
  const [labelText] = showPartiallyFillable ? LABELS : [...LABELS].reverse()

  const onSelect = (label: string): void => {
    setOverride(label === LABELS[0])
  }

  return (
    <Menu>
      {({ isExpanded }: { isExpanded: boolean }) => (
        <styledEl.Wrapper>
          <styledEl.StyledMenuButton>
            <styledEl.LabelText>{labelText}</styledEl.LabelText>
            <styledEl.StyledSVG
              src={IMAGE_CARET_DOWN}
              description={t`dropdown icon`}
              className={isExpanded ? 'expanded' : ''}
            />
          </styledEl.StyledMenuButton>

          <styledEl.StyledMenuList portal={false}>
            {LABELS.map((label) => (
              <styledEl.StyledMenuItem key={label} onSelect={() => onSelect(label)}>
                {label}
              </styledEl.StyledMenuItem>
            ))}
          </styledEl.StyledMenuList>
        </styledEl.Wrapper>
      )}
    </Menu>
  )
}
