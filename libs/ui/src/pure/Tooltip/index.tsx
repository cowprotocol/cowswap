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
  const [sticky, setSticky] = useState(false)
  const [show, setShow] = useState(false)
  const cancelCloseRef = useRef<Command | null>()

  const divRef = useRef<HTMLDivElement>(null);
  const open = useCallback(() => {
    setShow(true)
    onOpen?.()
  }, [onOpen])

  // Close the tooltip
  const close = useCallback((props: {force: boolean, delayed: boolean}) => {
    const {force, delayed} = props
    if (sticky && !force) return

    const closeSticky = () => {
      cancelCloseRef.current = null
      setSticky(false)
      setShow(false)
    }
    

    // Cancel any previous scheduled close
    if (cancelCloseRef.current) {
      cancelCloseRef.current() 
    }

    // Create a delayed timeout
    const timeout = setTimeout(closeSticky, delayed ? TOOLTIP_CLOSE_DELAY : 0)
    cancelCloseRef.current = () => {
      cancelCloseRef.current = null
      clearTimeout(timeout)
    }
    return () => cancelCloseRef.current && cancelCloseRef.current()
  }, [setShow, sticky])

  // Toggle the stickiness
  const toggleSticky = useCallback<React.MouseEventHandler<HTMLDivElement>>((event) => {
    event.stopPropagation()
    if (show) {
      setSticky(sticky => {
        if (sticky) {
          // Tooltip was visible, but sticky. Closing it.
          close({ force: true, delayed: false})
          return false
        } else {
          // Tooltip was visible, and not sticky. Making it sticky.
          return true
        }
      })      
    } else {
      // Tooltip was not visible. Making it visible and sticky.
      setSticky(true)
      open()
    }    
  }, [close, open, setSticky, show])

  // Remove the stickiness when clicking outside the tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sticky && divRef.current && !divRef.current.contains(event.target as Node)) {
        setSticky(false)
        setShow(false)
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [toggleSticky, setShow, sticky]);

  // Remove the stickiness when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (sticky) {
        close({ force: true, delayed: false})
      }
    }
    
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    }
  }, [sticky])

  // Stop the delayed close when hovering the tooltip
  const stopDelayedClose = useCallback(() => {
    // Cancel any previous scheduled close
    if (cancelCloseRef.current) {
      cancelCloseRef.current()
    }
  }, [])

  

  const tooltipContent = disableHover ? null : <div ref={divRef} onMouseEnter={stopDelayedClose} onMouseLeave={() => close({ force: false, delayed: true })}>{content}</div>

  return (
    <TooltipContent {...rest} show={show} content={tooltipContent}>
      <div onMouseEnter={open} onMouseLeave={() => close({force: false, delayed: true })} onClick={toggleSticky} >

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
