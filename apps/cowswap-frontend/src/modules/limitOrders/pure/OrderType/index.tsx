import IMAGE_CARET_DOWN from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { InfoTooltip, RowFixed } from '@cowprotocol/ui'

import { Menu } from '@reach/menu-button'

import { DetailsRow } from 'modules/limitOrders/pure/LimitOrdersDetails/styled'
import { PartiallyFillableOverrideDispatcherType } from 'modules/limitOrders/state/partiallyFillableOverride'

import * as styledEl from './styled'

export type OrderTypeProps = {
  isPartiallyFillable: boolean
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderType(props: OrderTypeProps) {
  const {
    isPartiallyFillable,
    className,
    partiallyFillableOverride: [override],
  } = props
  const textContent =
    (override ?? isPartiallyFillable)
      ? 'This order can be partially filled'
      : 'This order will either be filled completely or not filled.'

  return (
    <DetailsRow className={className}>
      <RowFixed>
        <p>Order type</p>
        <InfoTooltip content={textContent} />
      </RowFixed>
      <OrderTypePicker {...props} />
    </DetailsRow>
  )
}

const LABELS = ['Partially fillable', 'Fill or kill']

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function OrderTypePicker({ isPartiallyFillable, partiallyFillableOverride }: OrderTypeProps) {
  const [override, setOverride] = partiallyFillableOverride

  const showPartiallyFillable = override ?? isPartiallyFillable

  const [labelText] = showPartiallyFillable ? LABELS : [...LABELS].reverse()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const onSelect = (label: string) => setOverride(label === LABELS[0])

  return (
    <Menu>
      {({ isExpanded }: { isExpanded: boolean }) => (
        <styledEl.Wrapper>
          <styledEl.StyledMenuButton>
            <styledEl.LabelText>{labelText}</styledEl.LabelText>
            <styledEl.StyledSVG
              src={IMAGE_CARET_DOWN}
              description="dropdown icon"
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
