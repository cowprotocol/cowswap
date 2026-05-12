import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import type { Command } from '@cowprotocol/types'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

import type { PopoverProps } from '../Popover'

const TOOLTIP_CLOSE_DELAY = 300 // in milliseconds

const NewTooltipTrigger = styled.div`
  display: inline-flex;
  align-items: center;
`

const NewTooltipContainer = styled.div`
  max-width: 320px;
  padding: 4px 6px;
  font-weight: 400;
  word-break: break-word;
`

const NewTooltipPopup = styled(BaseTooltip.Popup)<{
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

const NewTooltipArrow = styled(BaseTooltip.Arrow)<{
  bgColor?: string
  borderColor?: string
}>`
  width: 8px;
  height: 8px;
  pointer-events: none;
  color: inherit;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    content: '';
    background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
    border: 1px solid ${({ borderColor, bgColor }) => borderColor || bgColor || `var(${UI.COLOR_PAPER_DARKEST})`};
    transform: rotate(45deg);
  }

  &[data-side='top'] {
    bottom: -5px;

    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &[data-side='bottom'] {
    top: -5px;

    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &[data-side='left'] {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &[data-side='right'] {
    left: -5px;

    ::before {
      border-right: none;
      border-top: none;
    }
  }
`

export interface NewTooltipProps extends Omit<PopoverProps, 'content' | 'show'> {
  isClosed?: boolean
  content: ReactNode
  onOpen?: Command
  wrapInContainer?: boolean
  disableHover?: boolean
  tooltipCloseDelay?: number
}

function getTooltipSide(placement: NewTooltipProps['placement']): 'top' | 'bottom' | 'left' | 'right' {
  const side = placement?.split('-')[0]

  if (side === 'bottom' || side === 'left' || side === 'right') return side

  return 'top'
}

function getTooltipAlign(placement: NewTooltipProps['placement']): 'start' | 'center' | 'end' {
  const align = placement?.split('-')[1]

  if (align === 'start' || align === 'end') return align

  return 'center'
}

export function NewTooltip(props: NewTooltipProps): ReactNode {
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
    zIndex = 999999,
  } = props

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isClosed) {
      setShow(false)
    }
  }, [isClosed])

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
        <BaseTooltip.Trigger closeOnClick={false} render={<NewTooltipTrigger className={className} />}>
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner
            side={getTooltipSide(placement)}
            align={getTooltipAlign(placement)}
            sideOffset={8}
            positionMethod="fixed"
            style={{ zIndex }}
          >
            <NewTooltipPopup bgColor={bgColor} color={color} borderColor={borderColor}>
              <NewTooltipArrow bgColor={bgColor} borderColor={borderColor} />
              {wrapInContainer ? <NewTooltipContainer>{content}</NewTooltipContainer> : content}
            </NewTooltipPopup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
