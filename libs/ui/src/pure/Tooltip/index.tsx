import { ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { useOnClickOutside, useOnScroll } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import Popover, { PopoverProps } from '../Popover'

const TOOLTIP_CLOSE_DELAY = 300 // in milliseconds

export const TooltipContainer = styled.div`
  max-width: 320px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

export interface HoverTooltipProps extends Omit<PopoverProps, 'content' | 'show'> {
  isClosed?: boolean
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

  /**
   * In milliseconds, the delay before the tooltip is closed
   */
  tooltipCloseDelay?: number
}

const BaseTooltipTrigger = styled.div`
  display: inline-flex;
  align-items: center;
`

const BaseTooltipPopup = styled(BaseTooltip.Popup)<{
  bgColor?: string
  color?: string
  borderColor?: string
}>`
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  color: ${({ color }) => color || `var(${UI.COLOR_TEXT_PAPER})`};
  box-shadow: var(${UI.BOX_SHADOW});
  border: 1px solid ${({ borderColor, bgColor }) => borderColor || bgColor || `var(${UI.COLOR_PAPER_DARKEST})`};
  border-radius: 12px;
  padding: 6px 3px;
  font-size: 13px;
  backdrop-filter: blur(20px);
  transform-origin: var(--transform-origin);

  > div div {
    font-size: inherit;
  }
`

function getTooltipSide(placement: HoverTooltipProps['placement']): 'top' | 'bottom' | 'left' | 'right' {
  const side = placement?.split('-')[0]

  if (side === 'bottom' || side === 'left' || side === 'right') return side

  return 'top'
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
export function HoverTooltip(props: HoverTooltipProps): ReactNode {
  const {
    content,
    children,
    onOpen = undefined,
    disableHover,
    wrapInContainer = false,
    tooltipCloseDelay = TOOLTIP_CLOSE_DELAY,
    isClosed,
    placement = 'top',
    bgColor,
    color,
    borderColor,
    className,
  } = props

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isClosed) {
      setShow(false)
    }
  }, [isClosed])

  // Hide tooltip when scrolling
  useEffect(() => {
    const handleScroll = (): void => {
      if (show) {
        setShow(false)
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [show])

  const onOpenChange = useCallback(
    (open: boolean) => {
      setShow(open)

      if (open) {
        onOpen?.()
      }
    },
    [onOpen],
  )

  if (disableHover) return <>{children}</>

  return (
    <BaseTooltip.Provider delay={0} closeDelay={tooltipCloseDelay}>
      <BaseTooltip.Root open={show} onOpenChange={onOpenChange}>
        <BaseTooltip.Trigger closeOnClick={false} render={<BaseTooltipTrigger className={className} />}>
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner
            side={getTooltipSide(placement)}
            sideOffset={8}
            positionMethod="fixed"
            style={{ zIndex: 999999 }}
          >
            <BaseTooltipPopup bgColor={bgColor} color={color} borderColor={borderColor}>
              {wrapInContainer ? <TooltipContainer>{content}</TooltipContainer> : content}
            </BaseTooltipPopup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
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

  containerRef: RefObject<HTMLElement | null>
}

/**
 * Tooltip that displays text when the passed `show` prop is true.
 *
 * IMPORTANT: Don't use it if you need to show the tooltip when you hover on one element. For that use `HoverTooltip`
 * @see HoverTooltip as an alternative if you need to show the tooltip on hover
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Tooltip({ content, className, wrapInContainer, show, containerRef, ...rest }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(() => {
    if (show && rest.onClickCapture) {
      rest.onClickCapture({} as React.MouseEvent<HTMLDivElement>)
    }
  }, [show, rest])

  useOnClickOutside([tooltipRef], handleClick)

  useOnScroll(containerRef, handleClick)

  return (
    <Popover
      className={className}
      show={show}
      content={<div ref={tooltipRef}>{wrapInContainer ? <TooltipContainer>{content}</TooltipContainer> : content}</div>}
      {...rest}
    />
  )
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTooltip(tooltip: ReactNode | ((params?: any) => ReactNode), params?: any): ReactNode {
  if (typeof tooltip === 'function') {
    return tooltip(params)
  }
  return tooltip
}
