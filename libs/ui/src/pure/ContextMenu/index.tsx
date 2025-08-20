import { ReactNode } from 'react'

import { MenuPopover } from '@reach/menu-button'

import * as styledEl from './styled'

export { ContextMenuItem } from './ContextMenuItem'
export { ContextMenuTooltip } from './ContextMenuTooltip'
export { ContextMenuCopyButton } from './ContextMenuCopyButton'
export { ContextMenuExternalLink } from './ContextMenuExternalLink'

export const ContextMenuItemButton = styledEl.ContextMenuItemButton
export const ContextMenuItemText = styledEl.ContextMenuItemText

// Dropdown/Selector pattern exports (for settings panels, form dropdowns, etc.)
// Use ContextMenuTooltip for action menus (copy, view, delete)
export const ContextMenu = styledEl.ContextMenu
export const ContextMenuButton = styledEl.ContextMenuButton
export function ContextMenuList({ children, portal = false }: { children: ReactNode; portal?: boolean }): ReactNode {
  return (
    <MenuPopover portal={portal}>
      <styledEl.ContextMenuItems>{children}</styledEl.ContextMenuItems>
    </MenuPopover>
  )
}
