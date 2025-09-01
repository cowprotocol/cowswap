import React, { useCallback, useMemo, useState } from 'react'

import { useMediaQuery, useInterval, useElementViewportTracking } from '@cowprotocol/common-hooks'

import { Options, Placement, Modifier } from '@popperjs/core'
import { Portal } from '@reach/portal'
import { usePopper } from 'react-popper'

import { Arrow, MobileBackdrop, PopoverContainer, ReferenceElement } from './styled'

import { Media } from '../../consts'
import { calculateAvailableSpaceAbove } from '../../utils/calculateAvailableSpaceAbove'

import type { OffsetsFunction } from '@popperjs/core/lib/modifiers/offset'

const MOBILE_FULL_WIDTH_STYLES = {
  width: '100vw',
  maxWidth: '100vw',
  borderRadius: '12px 12px 0 0',
  boxSizing: 'border-box' as const,
}

function createMobileModifiers(arrowElement: HTMLDivElement | null): Array<Partial<Modifier<string, Record<string, unknown>>>> {
  return [
    {
      name: 'offset',
      options: {
        offset: ({ reference }: Parameters<OffsetsFunction>[0]) => {
          const refCenterX = reference.x + reference.width / 2
          const viewportCenterX = window.innerWidth / 2
          const skidding = viewportCenterX - refCenterX
          const distance = 8
          return [skidding, distance]
        },
      },
    },
    { name: 'preventOverflow', enabled: false },
    { name: 'flip', enabled: false },
    { name: 'arrow', options: { element: arrowElement, padding: 8 } },
  ]
}

function createDesktopModifiers(arrowElement: HTMLDivElement | null): Array<Partial<Modifier<string, Record<string, unknown>>>> {
  return [
    { name: 'offset', options: { offset: [8, 8] } },
    { name: 'arrow', options: { element: arrowElement } },
    { name: 'preventOverflow', options: { padding: 8 } },
  ]
}


export interface PopoverContainerProps {
  show: boolean
  bgColor?: string
  color?: string
  borderColor?: string
}

export interface PopoverProps extends PopoverContainerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  children: React.ReactNode
  placement?: Placement
  mobileMode?: 'popper' | 'fullWidth'
  showMobileBackdrop?: boolean
}

export default function Popover(props: PopoverProps): React.JSX.Element {
  const {
    content,
    show,
    children,
    placement = 'auto',
    bgColor,
    color,
    borderColor,
    className,
    mobileMode = 'popper',
    showMobileBackdrop = false,
  } = props

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const isMobile = useMediaQuery(Media.upToSmall(false))
  const shouldUseFullWidth = isMobile && mobileMode === 'fullWidth'

  // Use hook for viewport tracking and utility for backdrop height calculation
  const { rect } = useElementViewportTracking(referenceElement, shouldUseFullWidth && showMobileBackdrop)
  
  const backdropHeight = useMemo(() => {
    if (!shouldUseFullWidth || !showMobileBackdrop) return '100vh'
    return calculateAvailableSpaceAbove(rect, 8)
  }, [rect, shouldUseFullWidth, showMobileBackdrop])

  const options = useMemo(
    (): Options => ({
      placement: shouldUseFullWidth ? 'top' : placement,
      strategy: 'fixed',
      modifiers: shouldUseFullWidth
        ? createMobileModifiers(arrowElement)
        : createDesktopModifiers(arrowElement),
    }),
    [arrowElement, placement, shouldUseFullWidth],
  )

  const { styles, update, attributes } = usePopper(referenceElement, popperElement, options)

  const updateCallback = useCallback(() => {
    update && update()
  }, [update])
  useInterval(updateCallback, show ? 100 : null)

  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <Portal>
        {isMobile && showMobileBackdrop && <MobileBackdrop show={show} maxHeight={backdropHeight} />}
        <PopoverContainer
          className={className}
          show={show}
          ref={setPopperElement}
          style={{
            ...styles.popper,
            zIndex: 999999,
            // Add full-width styling for mobile
            ...(shouldUseFullWidth && MOBILE_FULL_WIDTH_STYLES),
          }}
          {...attributes.popper}
          bgColor={bgColor}
          color={color}
          borderColor={borderColor}
        >
          {content}
          <Arrow
            className={`arrow-${attributes.popper?.['data-popper-placement'] ?? ''}`}
            ref={setArrowElement}
            style={styles.arrow}
            bgColor={bgColor}
            borderColor={borderColor}
            {...attributes.arrow}
          />
        </PopoverContainer>
      </Portal>
    </>
  )
}
