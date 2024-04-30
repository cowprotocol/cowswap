import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'

import Popover, { PopoverProps } from '../Popover'

import { Command } from '@cowprotocol/types'

const TOOLTIP_CLOSE_DELAY = 300

export const TooltipContainer = styled.div`
  max-width: 320px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

export interface TooltipProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  text: ReactNode
}

interface TooltipContentProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  content: ReactNode
  onOpen?: Command
  // whether to wrap the content in a `TooltipContainer`
  wrap?: boolean
  disableHover?: boolean // disable the hover and content display
}

export function Tooltip({ text, className, ...rest }: TooltipProps) {
  return <Popover className={className} content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function TooltipContent({ content, wrap = false, ...rest }: TooltipContentProps) {
  return <Popover content={wrap ? <TooltipContainer>{content}</TooltipContainer> : content} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}

export function MouseoverTooltipContent({
  content,
  children,
  onOpen = undefined,
  disableHover,
  ...rest
}: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const cancelCloseRef = useRef<Command | null>()

  const divRef = useRef<HTMLDivElement>(null);
  const open = useCallback(() => {
    setShow(true)
    onOpen?.()
  }, [onOpen])

  // Close the tooltip
  const close = useCallback((eager = false) => {      
    // Cancel any previous scheduled close
    if (cancelCloseRef.current) {
      cancelCloseRef.current() 
    }

    const closeNow = () => {
      cancelCloseRef.current = null
      setShow(false)
    }

    if (eager) {
      // Close eagerly
      closeNow()
    } else {
      // Close after a delay
      const closeTimeout = setTimeout(closeNow, TOOLTIP_CLOSE_DELAY)

      cancelCloseRef.current = () => {
        cancelCloseRef.current = null
        clearTimeout(closeTimeout)
      }
    }

    return () => cancelCloseRef.current && cancelCloseRef.current()
  }, [setShow])

  // Stop the delayed close when hovering the tooltip
  const stopDelayedClose = useCallback(() => {
    // Cancel any previous scheduled close
    if (cancelCloseRef.current) {
      cancelCloseRef.current()
    }
  }, [])

  const toggleTooltip = useCallback(() => {
    if (show) {
      close(true)
    } else {
      open()
    }
  }, [close, open, show])

  const tooltipContent = disableHover ? null : <div ref={divRef} onMouseEnter={stopDelayedClose} onMouseLeave={() => close()}>{content}</div>
  return (
    <TooltipContent {...rest} show={show} content={tooltipContent}>
      <div onMouseEnter={open} onMouseLeave={() => close()} onClick={toggleTooltip}>
        {children}
      </div>
    </TooltipContent>
  )
}

export function renderTooltip(tooltip: ReactNode | ((params?: any) => ReactNode), params?: any): ReactNode {
  if (typeof tooltip === 'function') {
    return tooltip(params)
  }
  return tooltip
}
