import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { isMobile } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import styled from 'styled-components/macro'

import Popover, { PopoverProps } from '../Popover'

const TOOLTIP_CLOSE_DELAY = 300 // in milliseconds

export const TooltipContainer = styled.div`
  max-width: 320px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

export interface HoverTooltipProps extends Omit<PopoverProps, 'content' | 'show'> {
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

/**
 * Tooltip that appears when hovering over the children
 *
 * @see HelpTooltip as an alternative if you need to show a tooltip with a question mark icon (or icon of your choice)
 * @see InfoTooltip as an alternative if you need to show a tooltip with an info icon
 * @see Tooltip as an alternative if you need to control when the tooltip is shown
 *
 * @param props
 * @returns
 */
export function HoverTooltip(props: HoverTooltipProps) {
  const { content, children, onOpen = undefined, disableHover, wrapInContainer = false, ...rest } = props

  // { text, className, ...rest }: TooltipProps

  const [show, setShow] = useState(false)
  const cancelCloseRef = useRef<Command | null>()

  const divRef = useRef<HTMLDivElement>(null)
  const open = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setShow(true)
      onOpen?.()
    },
    [onOpen]
  )

  // Close the tooltip
  const close = useCallback(
    (e: MouseEvent<HTMLDivElement> | null, eager = false) => {
      e && e.preventDefault()

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
    },
    [setShow]
  )

  // Stop the delayed close when hovering the tooltip
  const stopDelayedClose = useCallback(() => {
    // Cancel any previous scheduled close
    if (cancelCloseRef.current) {
      cancelCloseRef.current()
    }
  }, [])

  const toggleTooltip = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (show) {
        close(e, true)
      } else {
        open(e)
      }
    },
    [close, open, show]
  )

  // Hide tooltip when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (show) {
        close(null, true)
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [show])

  const tooltipContent = disableHover ? null : (
    <div ref={divRef} onMouseEnter={stopDelayedClose} onMouseLeave={close}>
      {wrapInContainer ? <TooltipContainer>{content}</TooltipContainer> : content}
    </div>
  )
  return (
    <Popover show={show} content={tooltipContent} {...rest}>
      <div onMouseEnter={open} onMouseLeave={close} onClick={isMobile ? undefined : toggleTooltip}>
        {children}
      </div>
    </Popover>
  )
}

export interface TooltipProps extends Omit<PopoverProps, 'content'> {
  /**
   * Shows the tooltip
   */
  show: boolean

  /**
   * Whether to wrap the content in a container
   */
  wrapInContainer?: boolean

  /**
   * The content of the tooltip
   */
  content: ReactNode
}

/**
 * Tooltip that displays text when the passed `show` prop is true.
 *
 * IMPORTANT: Don't use it if you need to show the tooltip when you hover on one element. For that use `HoverTooltip`
 * @see HoverTooltip as an alternative if you need to show the tooltip on hover
 */
export function Tooltip({ content, className, wrapInContainer, ...rest }: TooltipProps) {
  return (
    <Popover
      className={className}
      content={wrapInContainer ? <TooltipContainer>{content}</TooltipContainer> : content}
      {...rest}
    />
  )
}

export function renderTooltip(tooltip: ReactNode | ((params?: any) => ReactNode), params?: any): ReactNode {
  if (typeof tooltip === 'function') {
    return tooltip(params)
  }
  return tooltip
}
