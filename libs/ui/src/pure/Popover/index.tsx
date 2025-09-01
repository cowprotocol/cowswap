import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useMediaQuery, useInterval } from '@cowprotocol/common-hooks'

import { Options, Placement, Modifier } from '@popperjs/core'
import { Portal } from '@reach/portal'
import { usePopper } from 'react-popper'

import { Arrow, MobileBackdrop, PopoverContainer, ReferenceElement } from './styled'

import { Media } from '../../consts'

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

interface RenderPopoverProps {
  children: React.ReactNode
  isMobile: boolean
  showMobileBackdrop: boolean
  backdropHeight: string
  show: boolean
  className?: string
  styles: { popper?: React.CSSProperties; arrow?: React.CSSProperties }
  shouldUseFullWidth: boolean
  attributes: { popper?: Record<string, unknown>; arrow?: Record<string, unknown> }
  bgColor?: string
  color?: string
  borderColor?: string
  content: React.ReactNode
  setReferenceElement: (element: HTMLDivElement | null) => void
  setPopperElement: (element: HTMLDivElement | null) => void
  setArrowElement: (element: HTMLDivElement | null) => void
}

function renderPopover(props: RenderPopoverProps): React.JSX.Element {
  const {
    children,
    isMobile,
    showMobileBackdrop,
    backdropHeight,
    show,
    className,
    styles,
    shouldUseFullWidth,
    attributes,
    bgColor,
    color,
    borderColor,
    content,
    setReferenceElement,
    setPopperElement,
    setArrowElement,
  } = props

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

// eslint-disable-next-line max-lines-per-function
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

  // State to force recalculation on viewport changes
  const [viewportKey, setViewportKey] = useState(0)

  // Efficient viewport change detection with debouncing
  useEffect(() => {
    if (!shouldUseFullWidth || !showMobileBackdrop) return

    let timeoutId: number | undefined

    const debouncedResize = (): void => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        setViewportKey(prev => prev + 1)
      }, 16) // ~60fps debounce
    }

    // Use ResizeObserver for reference element changes if available
    let resizeObserver: ResizeObserver | undefined
    if (referenceElement && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(debouncedResize)
      resizeObserver.observe(referenceElement)
    }

    // Minimal event listeners for actual viewport changes
    window.addEventListener('resize', debouncedResize, { passive: true })
    window.addEventListener('orientationchange', debouncedResize, { passive: true })

    // Visual viewport for mobile browser UI changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedResize)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', debouncedResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedResize)
      }
    }
  }, [shouldUseFullWidth, showMobileBackdrop, referenceElement])

  // Calculate backdrop height to stop just above the tooltip (8px gap)
  const backdropHeight = useMemo(() => {
    if (!referenceElement || !shouldUseFullWidth || !showMobileBackdrop) return '100vh'
    
    const rect = referenceElement.getBoundingClientRect()
    const gapFromElement = 8 // Same gap as used in the mobile modifier
    const maxHeight = rect.top - gapFromElement
    
    return `${Math.max(0, maxHeight)}px`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceElement, shouldUseFullWidth, showMobileBackdrop, viewportKey])

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

  return renderPopover({
    children,
    isMobile,
    showMobileBackdrop,
    backdropHeight,
    show,
    className,
    styles,
    shouldUseFullWidth,
    attributes,
    bgColor,
    color,
    borderColor,
    content,
    setReferenceElement,
    setPopperElement,
    setArrowElement,
  })
}
