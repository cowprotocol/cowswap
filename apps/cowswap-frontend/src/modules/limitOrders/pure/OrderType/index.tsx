import { Menu } from '@reach/menu-button'

import IMAGE_CARET_DOWN from 'legacy/assets/cow-swap/carret-down.svg'
import { InfoIcon } from 'legacy/components/InfoIcon'

import { DetailsRow } from 'modules/limitOrders/pure/LimitOrdersDetails/styled'
import { PartiallyFillableOverrideDispatcherType } from 'modules/limitOrders/state/partiallyFillableOverride'

import * as styledEl from './styled'

export type OrderTypeProps = {
  isPartiallyFillable: boolean
  featurePartialFillsEnabled: boolean
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  className?: string
}

export function OrderType(props: OrderTypeProps) {
  const {
    isPartiallyFillable,
    className,
    partiallyFillableOverride: [override],
  } = props
  const textContent =
    override ?? isPartiallyFillable
      ? 'This order can be partially filled'
      : 'This order will either be filled completely or not filled.'

  return (
    <DetailsRow className={className}>
      <div>
        <span>
          <p>Order type</p>
        </span>{' '}
        <InfoIcon content={textContent} />
      </div>
      <OrderTypePicker {...props} />
    </DetailsRow>
  )
}

const LABELS = ['Partially fillable', 'Fill or kill']

function OrderTypePicker({
  isPartiallyFillable,
  featurePartialFillsEnabled,
  partiallyFillableOverride,
}: OrderTypeProps) {
  const [override, setOverride] = partiallyFillableOverride

  const showPartiallyFillable = override ?? isPartiallyFillable

  const [labelText] = showPartiallyFillable ? LABELS : [...LABELS].reverse()

  const onSelect = (label: string) => setOverride(label === LABELS[0])
  const disabled = !featurePartialFillsEnabled

  return (
    <Menu>
      {({ isExpanded }: { isExpanded: boolean }) => (
        <styledEl.Wrapper>
          <styledEl.StyledMenuButton disabled={disabled}>
            <styledEl.LabelText>{labelText}</styledEl.LabelText>
            {!disabled && (
              <styledEl.StyledSVG
                src={IMAGE_CARET_DOWN}
                description="dropdown icon"
                className={isExpanded ? 'expanded' : ''}
              />
            )}
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
