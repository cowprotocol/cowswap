import { TradeWidgetField, TradeWidgetFieldProps } from '@cow/modules/trade/pure/TradeWidgetField'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import styled from 'styled-components/macro'
import { ChevronDown } from 'react-feather'

export type TradeSelectItem = { label: string; value: unknown }

export interface TradeSelectProps extends TradeWidgetFieldProps {
  active: TradeSelectItem
  items: TradeSelectItem[]
  onSelect(item: TradeSelectItem): void
}

const StyledMenuList = styled(MenuList)`
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  outline: none;
  list-style: none;
  position: relative;
  z-index: 2;
  min-width: 120px;
`

const StyledMenuButton = styled(MenuButton)`
  background: none;
  border: 0;
  outline: none;
  padding: 0;
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
`

const StyledMenuItem = styled(MenuItem)`
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
`

export function TradeSelect(props: TradeSelectProps) {
  const { active, items, onSelect } = props
  return (
    <TradeWidgetField {...props}>
      <div>
        <Menu>
          <StyledMenuButton>
            {active.label} <ChevronDown size={20} />
          </StyledMenuButton>
          <StyledMenuList>
            {items.map((item) => {
              return (
                <StyledMenuItem key={item.label} onSelect={() => onSelect(item)}>
                  {item.label}
                </StyledMenuItem>
              )
            })}
          </StyledMenuList>
        </Menu>
      </div>
    </TradeWidgetField>
  )
}
