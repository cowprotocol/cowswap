import { ReactNode, useCallback, useState } from 'react'

import styled from 'styled-components/macro'

import Popover, { PopoverProps } from 'legacy/components/Popover'

export const TooltipContainer = styled.div`
  max-width: 300px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

export interface TooltipProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  text: ReactNode
}

interface TooltipContentProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  content: ReactNode
  onOpen?: () => void
  // whether to wrap the content in a `TooltipContainer`
  wrap?: boolean
  disableHover?: boolean // disable the hover and content display
}

export default function Tooltip({ text, className, ...rest }: TooltipProps) {
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
  onOpen: openCallback = undefined,
  disableHover,
  ...rest
}: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => {
    setShow(true)
    openCallback?.()
  }, [openCallback])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipContent {...rest} show={show} content={disableHover ? null : content}>
      <div onMouseEnter={open} onMouseLeave={close}>
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
