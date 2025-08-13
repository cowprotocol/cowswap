import { MouseEvent, ReactNode, forwardRef, useCallback, useRef, useState } from 'react'

import { useCopyClipboard } from '@cowprotocol/common-hooks'

import { MenuPopover } from '@reach/menu-button'
import { CheckCircle, Copy, Link2 } from 'react-feather'
import styled from 'styled-components/macro'

import * as styledEl from './styled'

import { UI } from '../../enum'
import { Tooltip } from '../Tooltip'


export const ContextMenuItem = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode
    className?: string
    onSelect?: () => void
    disabled?: boolean
    variant?: 'danger'
  }
>(function ContextMenuItem({ children, className, onSelect, disabled, variant }, ref): ReactNode {
  return (
    <styledEl.ContextMenuItem
      ref={ref}
      className={className}
      onSelect={onSelect || (() => {})}
      disabled={disabled}
      variant={variant}
    >
      {children}
    </styledEl.ContextMenuItem>
  )
})

// Tooltip-based context menu wrapper for custom event handling
interface ContextMenuTooltipProps {
  children: ReactNode
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  containerRef?: React.RefObject<HTMLDivElement | null>
  disableHoverBackground?: boolean
}

export function ContextMenuTooltip({
  children,
  content,
  placement = 'bottom',
  containerRef,
  disableHoverBackground,
}: ContextMenuTooltipProps): ReactNode {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const defaultContainerRef = useRef<HTMLElement>(null)
  const [openTooltip, setOpenTooltip] = useState(false)

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation?.()
    event.preventDefault?.()
    setOpenTooltip((prev) => !prev)
  }, [])

  const handleClickOutside = useCallback((event: MouseEvent<HTMLDivElement>) => {
    // Only close if clicking outside the context menu content
    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as HTMLElement)) {
      event.stopPropagation?.()
      setOpenTooltip(false)
    }
  }, [])

  return (
    <styledEl.ContextMenuTooltipButton onClick={handleClick} disableHoverBackground={disableHoverBackground}>
      <Tooltip
        content={<styledEl.ContextMenuContent ref={contextMenuRef}>{content}</styledEl.ContextMenuContent>}
        placement={placement}
        wrapInContainer={false}
        show={openTooltip}
        onClickCapture={handleClickOutside}
        containerRef={(containerRef as React.RefObject<HTMLElement>) || defaultContainerRef}
      >
        {children}
      </Tooltip>
    </styledEl.ContextMenuTooltipButton>
  )
}

const CopyFeedbackText = styled.span<{ isCopied?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ isCopied }) => (isCopied ? `var(${UI.COLOR_SUCCESS})` : 'inherit')};
`

interface ContextMenuCopyButtonProps {
  address: string
}

export function ContextMenuCopyButton({ address }: ContextMenuCopyButtonProps): ReactNode {
  const [isCopied, setCopied] = useCopyClipboard()

  const handleCopyAddress = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setCopied(address)
    },
    [address, setCopied],
  )

  return (
    <styledEl.ContextMenuItemButton onClick={handleCopyAddress}>
      {isCopied ? (
        <>
          <CopyFeedbackText isCopied={isCopied}>
            <CheckCircle size={16} />
          </CopyFeedbackText>
          <CopyFeedbackText isCopied={isCopied}>Copied</CopyFeedbackText>
        </>
      ) : (
        <>
          <Copy size={16} />
          <span>Copy address</span>
        </>
      )}
    </styledEl.ContextMenuItemButton>
  )
}

interface ContextMenuExternalLinkProps {
  href: string
  label: string
}

export function ContextMenuExternalLink({ href, label }: ContextMenuExternalLinkProps): ReactNode {
  const handleClick = useCallback(() => {
    window.open(href, '_blank', 'noopener,noreferrer')
  }, [href])

  return (
    <styledEl.ContextMenuItemButton onClick={handleClick}>
      <Link2 size={16} />
      <span>{label}</span>
    </styledEl.ContextMenuItemButton>
  )
}

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
