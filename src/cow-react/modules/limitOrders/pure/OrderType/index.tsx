import styled from 'styled-components/macro'

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

  const showPartiallyFillable = override ?? isPartiallyFillable

  const [labelText, dropDownText] = showPartiallyFillable ? LABELS : [...LABELS].reverse()

  const onSelect = () => setOverride(!showPartiallyFillable)

  return (
    <Menu>
      {({ isExpanded }) => (
        <>
          <StyledMenuButton>
            <span>{labelText}</span>
            <SVG src={IMAGE_CARET_DOWN} description="dropdown icon" className={isExpanded ? 'expanded' : ''} />
          </StyledMenuButton>
          <StyledMenuList portal={true}>
            <StyledMenuItem onSelect={onSelect}>{dropDownText}</StyledMenuItem>
          </StyledMenuList>
        </>
      )}
    </Menu>
  )
}

const StyledMenuButton = styled(MenuButton)`
  display: flex;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;

  align-items: center;
  gap: 5px;

  color: ${({ theme }) => theme.text1};
  cursor: pointer;

  > span {
    opacity: 0.8;
    padding: 0;
    margin: 0;
  }

  > svg.expanded {
    transition: transform 0.3s ease-in-out;
    transform: rotate(180deg);
  }
`

const StyledMenuList = styled(MenuList)`
  position: relative;
  z-index: 2;

  padding-top: 5px;

  background: ${({ theme }) => theme.cardBackground};
`

const StyledMenuItem = styled(MenuItem)`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  min-height: 24px;

  cursor: pointer;
`
