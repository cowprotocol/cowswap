import { FileText, Link2, MoreVertical, Trash2 } from 'react-feather'
import { transparentize } from 'polished'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import styled, { ThemeContext } from 'styled-components/macro'
import { useContext } from 'react'

export const ContextMenuButton = styled(MenuButton)`
  background: none;
  border: 0;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  padding: 0;
  margin: 0;
  display: flex;
  height: 24px;

  > svg {
    height: 100%;
    width: auto;
  }

  &:hover {
    outline: 1px solid ${({ theme }) => transparentize(0.8, theme.text1)};
  }
`
export const ContextMenuList = styled(MenuList)`
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 2;
  outline: none;
  min-width: 240px;
  margin: 10px 0;
  padding: 16px;
`

export const ContextMenuItem = styled(MenuItem)<{ $red?: boolean }>`
  padding: 12px;
  border-radius: 6px;
  margin: 0;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme, $red }) => ($red ? theme.danger : theme.text1)};

  &:hover {
    background: ${({ theme }) => transparentize(0.8, theme.text3)};
  }
`

export const ContextMenuLink = styled(ContextMenuItem)``

export interface OrderContextMenuProps {
  openReceipt: () => void
  activityUrl: string | undefined
  showCancellationModal: (() => void) | null
}

export function OrderContextMenu({ openReceipt, activityUrl, showCancellationModal }: OrderContextMenuProps) {
  const theme = useContext(ThemeContext)

  return (
    <Menu>
      <ContextMenuButton>
        <MoreVertical color={transparentize(0.5, theme.text1)} />
      </ContextMenuButton>
      <ContextMenuList>
        <ContextMenuItem onSelect={openReceipt}>
          <FileText size={16} />
          <span>Order receipt</span>
        </ContextMenuItem>
        {activityUrl && (
          <ContextMenuLink as="a" href={activityUrl} target="_blank">
            <Link2 size={16} />
            <span>View on explorer</span>
          </ContextMenuLink>
        )}
        {showCancellationModal && (
          <ContextMenuItem $red onSelect={() => showCancellationModal()}>
            <Trash2 size={16} />
            <span>Cancel order</span>
          </ContextMenuItem>
        )}
      </ContextMenuList>
    </Menu>
  )
}
