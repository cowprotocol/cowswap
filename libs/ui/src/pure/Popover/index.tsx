import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useMediaQuery, useInterval, useElementViewportTracking } from '@cowprotocol/common-hooks'

import { Options, Placement, Modifier } from '@popperjs/core'
import { Portal } from '@reach/portal'
import { usePopper } from 'react-popper'

import { Arrow, MobileBackdrop, PopoverContainer, ReferenceElement } from './styled'

import { Media } from '../../consts'
import { calculateAvailableSpaceAbove } from '../../utils/calculateAvailableSpaceAbove'

import type { OffsetsFunction } from '@popperjs/core/lib/modifiers/offset'

export enum PopoverMobileMode {
  Popper = 'popper',
  FullWidth = 'fullWidth',
}

const MOBILE_FULL_WIDTH_STYLES = {
  width: '100vw',
  maxWidth: '100vw',
  boxSizing: 'border-box' as const,
}

function createMobileModifiers(
  arrowElement: HTMLDivElement | null,
): Array<Partial<Modifier<string, Record<string, unknown>>>> {
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

function createDesktopModifiers(
  arrowElement: HTMLDivElement | null,
): Array<Partial<Modifier<string, Record<string, unknown>>>> {
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
  mobileMode?: PopoverMobileMode
  showMobileBackdrop?: boolean
  mobileBorderRadius?: string
  zIndex?: number
  /**
   * Forces the portal to stay mounted even if `show` is false.
   * Useful for consumers that depend on persistent markup (legacy behavior).
   */
  forceMount?: boolean
}

function useLazyPortalMount(show: boolean, forceMount: boolean): boolean {
  const [hasMountedPortal, setHasMountedPortal] = useState<boolean>(() => show || forceMount)

  useEffect(() => {
    if ((show || forceMount) && !hasMountedPortal) {
      setHasMountedPortal(true)
    }
  }, [show, forceMount, hasMountedPortal])

  return forceMount || show || hasMountedPortal
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
    mobileMode = PopoverMobileMode.Popper,
    showMobileBackdrop = false,
    mobileBorderRadius,
    zIndex = 999999,
    forceMount = false,
  } = props

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const shouldUseFullWidth = isMobile && mobileMode === PopoverMobileMode.FullWidth
  const { rect } = useElementViewportTracking(referenceElement, shouldUseFullWidth && showMobileBackdrop)
  const backdropHeight = useMemo(() => {
    if (!shouldUseFullWidth || !showMobileBackdrop) return '100vh'
    return calculateAvailableSpaceAbove(rect, 8)
  }, [rect, shouldUseFullWidth, showMobileBackdrop])
  const options = useMemo(
    (): Options => ({
      placement: shouldUseFullWidth ? 'top' : placement,
      strategy: 'fixed',
      modifiers: shouldUseFullWidth ? createMobileModifiers(arrowElement) : createDesktopModifiers(arrowElement),
    }),
    [arrowElement, placement, shouldUseFullWidth],
  )
  const { styles, update, attributes } = usePopper(referenceElement, popperElement, options)
  const updateCallback = useCallback(() => {
    update?.()
  }, [update])
  const intervalDelay = useMemo(() => (show ? 100 : null), [show])
  useInterval(updateCallback, intervalDelay)
  const shouldRenderPortal = useLazyPortalMount(show, forceMount)
  const popperStyle = {
    ...styles.popper,
    zIndex,
    ...(shouldUseFullWidth && MOBILE_FULL_WIDTH_STYLES),
    ...(shouldUseFullWidth && mobileBorderRadius && { borderRadius: mobileBorderRadius }),
  }
  const arrowPlacement = (attributes.popper?.['data-popper-placement'] as string | undefined)?.split('-')[0] ?? ''
  return (
    <>
      <ReferenceElement ref={setReferenceElement}>{children}</ReferenceElement>
      <PopoverPortal
        shouldRender={shouldRenderPortal}
        show={show}
        isMobile={isMobile}
        showMobileBackdrop={showMobileBackdrop}
        backdropHeight={backdropHeight}
        className={className}
        setPopperElement={setPopperElement}
        popperStyle={popperStyle}
        popperAttributes={attributes.popper}
        bgColor={bgColor}
        color={color}
        borderColor={borderColor}
        content={content}
        setArrowElement={setArrowElement}
        arrowStyle={styles.arrow}
        arrowAttributes={attributes.arrow}
        arrowPlacement={arrowPlacement}
      />
    </>
  )
}

interface PopoverPortalProps {
  shouldRender: boolean
  show: boolean
  isMobile: boolean
  showMobileBackdrop: boolean
  backdropHeight: string
  className?: string
  setPopperElement(value: HTMLDivElement | null): void
  popperStyle: React.CSSProperties
  popperAttributes: ReturnType<typeof usePopper>['attributes']['popper']
  bgColor?: string
  color?: string
  borderColor?: string
  content: React.ReactNode
  setArrowElement(value: HTMLDivElement | null): void
  arrowStyle: React.CSSProperties
  arrowAttributes: ReturnType<typeof usePopper>['attributes']['arrow']
  arrowPlacement: string
}

function PopoverPortal({
  shouldRender,
  show,
  isMobile,
  showMobileBackdrop,
  backdropHeight,
  className,
  setPopperElement,
  popperStyle,
  popperAttributes,
  bgColor,
  color,
  borderColor,
  content,
  setArrowElement,
  arrowStyle,
  arrowAttributes,
  arrowPlacement,
}: PopoverPortalProps): React.ReactNode {
  if (!shouldRender) {
    return null
  }

  return (
    <Portal>
      {isMobile && showMobileBackdrop && <MobileBackdrop show={show} maxHeight={backdropHeight} />}
      <PopoverContainer
        className={className}
        show={show}
        ref={setPopperElement}
        style={popperStyle}
        {...popperAttributes}
        bgColor={bgColor}
        color={color}
        borderColor={borderColor}
      >
        {content}
        <Arrow
          className={`arrow-${arrowPlacement}`}
          ref={setArrowElement}
          style={arrowStyle}
          bgColor={bgColor}
          borderColor={borderColor}
          {...arrowAttributes}
        />
      </PopoverContainer>
    </Portal>
  )
}
