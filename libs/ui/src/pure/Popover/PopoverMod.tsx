import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Options, Placement } from '@popperjs/core'
import { Portal } from '@reach/portal'
import { usePopper } from 'react-popper'
import styled, { DefaultTheme, StyledComponent } from 'styled-components'

import { PopoverContainerProps } from './index'

export const PopoverContainer = styled.div<{ show: boolean }>`
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
`

const ReferenceElement = styled.div`
  display: inline-block;
`

export const Arrow = styled.div`
  width: 8px;
  height: 8px;
  z-index: 9998;
  color: inherit;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 9998;
    content: '';
    transform: rotate(45deg);
  }

  &.arrow-top {
    bottom: -5px;
    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &.arrow-bottom {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &.arrow-left {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &.arrow-right {
    left: -5px;
    ::before {
      border-right: none;
      border-top: none;
    }
  }
`

export interface PopoverProps extends PopoverContainerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  // show: boolean
  children: React.ReactNode
  placement?: Placement
  // MOD
  PopoverContainer: StyledComponent<'div', DefaultTheme, PopoverContainerProps, never> // gp mod
  Arrow: StyledComponent<'div', DefaultTheme, Omit<PopoverContainerProps, 'color' | 'show'>, never> // gp mod
}

// TODO: reuse hook from @cowprotocol/common-hooks
// Currently it's not possible because of dependency inversion
function useInterval(callback: () => void, delay: null | number, leading = true) {
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const { current } = savedCallback
      current && current()
    }

    if (delay !== null) {
      if (leading) tick()
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return
  }, [delay, leading])
}

export default function Popover({
  content,
  show,
  children,
  placement = 'auto',
  bgColor,
  color,
  PopoverContainer,
  Arrow,
  className,
}: PopoverProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const options = useMemo(
    (): Options => ({
      placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset: [8, 8] } },
        { name: 'arrow', options: { element: arrowElement } },
        { name: 'preventOverflow', options: { padding: 8 } },
      ],
    }),
    [arrowElement, placement]
  )

  const { styles, update, attributes } = usePopper(referenceElement, popperElement, options)

  const updateCallback = useCallback(() => {
    update && update()
  }, [update])

  useInterval(updateCallback, show ? 100 : null)

  return (
    <>
      <ReferenceElement ref={setReferenceElement as any}>{children}</ReferenceElement>
      <Portal>
        <PopoverContainer
          className={className}
          show={show}
          ref={setPopperElement as any}
          style={styles.popper}
          {...attributes.popper}
          bgColor={bgColor}
          color={color}
        >
          {content}
          <Arrow
            className={`arrow-${attributes.popper?.['data-popper-placement'] ?? ''}`}
            ref={setArrowElement as any}
            style={styles.arrow}
            bgColor={bgColor}
            {...attributes.arrow}
          />
        </PopoverContainer>
      </Portal>
    </>
  )
}
