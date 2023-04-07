import { DetailsRow } from '@cow/modules/limitOrders/pure/LimitOrdersDetails/styled'
import { InfoIcon } from 'components/InfoIcon'
import IMAGE_CARET_DOWN from 'assets/cow-swap/carret-down.svg'
import { PartiallyFillableOverrideDispatcherType } from '@cow/modules/limitOrders/state/partiallyFillableOverride'
import * as styledEl from './styled'
import { Menu } from '@reach/menu-button'

export type OrderTypeProps = {
  isPartiallyFillable: boolean
  partiallyFillableOverride: PartiallyFillableOverrideDispatcherType
  className?: string
}

export function OrderType(props: OrderTypeProps) {
  const { isPartiallyFillable, className } = props
  const textContent = isPartiallyFillable
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

function OrderTypePicker({ isPartiallyFillable, partiallyFillableOverride }: OrderTypeProps) {
  const [override, setOverride] = partiallyFillableOverride

  const showPartiallyFillable = override ?? isPartiallyFillable

  const [labelText, dropDownText] = showPartiallyFillable ? LABELS : [...LABELS].reverse()

  const onSelect = () => setOverride(!showPartiallyFillable)

  return (
    <Menu>
      {({ isExpanded }: { isExpanded: any }) => (
        <>
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
              <styledEl.StyledMenuHeader>Select order type</styledEl.StyledMenuHeader>
              <styledEl.StyledMenuItem onSelect={onSelect}>{dropDownText}</styledEl.StyledMenuItem>
            </styledEl.StyledMenuList>
          </styledEl.Wrapper>
        </>
      )}
    </Menu>
  )
}
