import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Command } from '@cowprotocol/types'

import { Options, Placement } from '@popperjs/core'
import { Portal } from '@reach/portal'
import { usePopper } from 'react-popper'

import { Arrow, PopoverContainer, ReferenceElement } from './styled'

export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
}

export interface PopoverProps extends PopoverContainerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  children: React.ReactNode
  placement?: Placement
}

export default function Popover(props: PopoverProps) {
  const { content, show, children, placement = 'auto', bgColor, color, className } = props

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

// TODO: reuse hook from @cowprotocol/common-hooks
// Currently it's not possible because of dependency inversion
function useInterval(callback: Command, delay: null | number, leading = true) {
  const savedCallback = useRef<Command>()

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
