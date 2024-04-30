import { ReactNode, useCallback, useRef, useState } from 'react'

import styled from 'styled-components'

import Popover, { PopoverProps } from '../Popover'

import { Command } from '@cowprotocol/types'

const TOOLTIP_CLOSE_DELAY = 300 // in milliseconds

export const TooltipContainer = styled.div`
  max-width: 320px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

export interface TooltipProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow' | 'show'>  {
  /**
   * The content of the tooltip
   */
  content: ReactNode

  /**
   * Callback to be called when the tooltip is opened
   */
  onOpen?: Command
  
  /**
   * Whether to wrap the content in a container
   */
  wrapInContainer?: boolean

  /**
   * Whether to disable the hover and content display
   */
  disableHover?: boolean
}

export function Tooltip(props: TooltipProps) {
  const {
    content,
    children,
    onOpen = undefined,
    disableHover,
    wrapInContainer = false,
    ...rest
  } = props

  // { text, className, ...rest }: TooltipProps

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

  
  const tooltipContent = disableHover ? null : (
    <div ref={divRef} onMouseEnter={stopDelayedClose} onMouseLeave={() => close()}>
      {wrapInContainer ? <TooltipContainer>{content}</TooltipContainer> : content}
    </div>
  )
  return (
    <Popover show={show} content={tooltipContent} {...rest}> 
      <div onMouseEnter={open} onMouseLeave={() => close()} onClick={toggleTooltip}>
        {children}
      </div>
    </Popover>
  )
}

export interface TextTooltipProps extends Omit<TooltipProps, 'content'> {
  /**
   * The text to display in the tooltip
   */
  text: ReactNode,
}

/**
 * Tooltip that displays text
 * 
 * @deprecated use Tooltip instead with `wrapInContainer` set to `true`
 */
export function TooltipText({ text, ...rest }: TextTooltipProps) {  
  return <Tooltip wrapInContainer content={text} {...rest} />
}


export function renderTooltip(tooltip: ReactNode | ((params?: any) => ReactNode), params?: any): ReactNode {
  if (typeof tooltip === 'function') {
    return tooltip(params)
  }
  return tooltip
}
