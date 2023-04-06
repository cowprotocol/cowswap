import SVG from 'react-inlinesvg'
import { DetailsRow } from '@cow/modules/limitOrders/pure/LimitOrdersDetails/styled'
import { InfoIcon } from 'components/InfoIcon'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import IMAGE_CARET_DOWN from 'assets/cow-swap/carret-down.svg'
import { PartiallyFillableOverrideDispatcherType } from '@cow/modules/limitOrders/state/partiallyFillableOverride'

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
  const [labelText, dropDownText] = override ?? isPartiallyFillable ? LABELS : [...LABELS].reverse()

  const onSelect = () => setOverride(() => !(override ?? isPartiallyFillable))

  return (
    <Menu>
      {({ isExpanded }) => (
        <>
          <MenuButton>
            <span>{labelText}</span>
            <SVG src={IMAGE_CARET_DOWN} description="dropdown icon" className={isExpanded ? 'expanded' : ''} />
          </MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={onSelect}>{dropDownText}</MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  )
}
