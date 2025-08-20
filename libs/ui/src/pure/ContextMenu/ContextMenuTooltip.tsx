import { MouseEvent, ReactNode, useCallback, useRef, useState } from 'react'

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
