import { UI } from '@cowprotocol/ui'

import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import { FileText, Link2, MoreVertical, Trash2 } from 'react-feather'
import styled from 'styled-components/macro'

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
  color: inherit;
  opacity: 0.5;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    height: 100%;
    width: auto;
    color: currentColor;
  }

  &:hover {
    outline: currentColor;
  }
`
export const ContextMenuList = styled(MenuList)`
  background: var(${UI.COLOR_PAPER});
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
  color: ${({ $red }) => ($red ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_TEXT})`)};

  &:hover {
    background: ${({ theme }) => transparentize(theme.text3, 0.8)};
  }
`

export const ContextMenuLink = styled(ContextMenuItem)``

export interface OrderContextMenuProps {
  openReceipt: () => void
  activityUrl: string | undefined
  showCancellationModal: (() => void) | null
}

export function OrderContextMenu({ openReceipt, activityUrl, showCancellationModal }: OrderContextMenuProps) {
  return (
    <Menu>
      <ContextMenuButton>
        <MoreVertical />
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
