import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { Edit, FileText, Link2, MoreVertical, Repeat, Trash2 } from 'react-feather'
import styled from 'styled-components/macro'

import { AlternativeOrderModalContext } from '../OrdersReceiptModal/hooks'

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
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  outline: none;
  min-width: 240px;
  margin: 10px 0;
  padding: 16px;
  z-index: 100;
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
  background: transparent;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PAPER});
  }
`

export const ContextMenuLink = styled(ContextMenuItem)``

export interface OrderContextMenuProps {
  openReceipt: Command
  activityUrl: string | undefined
  showCancellationModal: Command | null
  alternativeOrderModalContext: AlternativeOrderModalContext
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderContextMenu({
  openReceipt,
  activityUrl,
  showCancellationModal,
  alternativeOrderModalContext,
}: OrderContextMenuProps) {
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
        {alternativeOrderModalContext && (
          <ContextMenuItem onSelect={alternativeOrderModalContext.showAlternativeOrderModal}>
            {alternativeOrderModalContext.isEdit ? <Edit size={16} /> : <Repeat size={16} />}
            <span>{alternativeOrderModalContext.isEdit ? 'Edit' : 'Recreate'} order</span>
          </ContextMenuItem>
        )}
        {showCancellationModal && (
          <ContextMenuItem $red onSelect={showCancellationModal}>
            <Trash2 size={16} />
            <span>Cancel order</span>
          </ContextMenuItem>
        )}
      </ContextMenuList>
    </Menu>
  )
}
