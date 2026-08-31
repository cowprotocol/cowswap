import { MouseEvent, ReactNode, useRef, useState, useEffect } from 'react'

import * as styledEl from './styled'

import { Tooltip } from '../Tooltip'

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

  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation?.()
    event.preventDefault?.()
    setOpenTooltip((prev) => !prev)
  }

  // Click outside handler
  useEffect(() => {
    if (!openTooltip) return

    const handleClickOutside = (event: Event): void => {
      const target = event.target as HTMLElement

      // Only close if clicking outside the context menu
      if (!contextMenuRef.current?.contains(target)) {
        setOpenTooltip(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openTooltip])

  // Close on menu item click. Portal events still bubble through the React tree to
  // ContextMenuTooltipButton, so stopPropagation is required to avoid re-opening.
  const handleTooltipClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement
    const isAnchor = target.tagName === 'A' || Boolean(target.closest('a'))

    // Don't preventDefault for anchors, let navigation work naturally
    if (!isAnchor) {
      event.preventDefault()
    }

    event.stopPropagation()
    setOpenTooltip(false)
  }

  return (
    <styledEl.ContextMenuTooltipButton onClick={handleClick} disableHoverBackground={disableHoverBackground}>
      <Tooltip
        content={
          <styledEl.ContextMenuContent ref={contextMenuRef} onClick={handleTooltipClick}>
            {content}
          </styledEl.ContextMenuContent>
        }
        placement={placement}
        wrapInContainer={false}
        show={openTooltip}
        containerRef={(containerRef as React.RefObject<HTMLElement>) || defaultContainerRef}
      >
        {children}
      </Tooltip>
    </styledEl.ContextMenuTooltipButton>
  )
}
