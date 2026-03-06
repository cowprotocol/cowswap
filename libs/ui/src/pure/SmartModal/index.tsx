import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { useMediaQuery, useInterval } from '@cowprotocol/common-hooks'

import { DialogOverlay } from '@reach/dialog'
import type { Placement, Options as PopperOptions } from '@popperjs/core'
import { usePopper } from 'react-popper'
import { useTransition } from '@react-spring/web'

import { DropdownBackdrop, DropdownPanel, SmartModalContent, SmartModalOverlay } from './styled'
import type { SmartModalPlacement, SmartModalProps } from './types'
import { useDrawerGesture } from './useDrawerGesture'

const DEFAULT_Z_INDEX = 1000
const POPPER_OFFSET = 8

function getPortalContainer(containerId: string | null | undefined): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (!containerId) return document.body
  return document.getElementById(containerId) ?? document.body
}

export function SmartModal({
  isOpen,
  onDismiss,
  children,
  anchorRef,
  containerId,
  drawerMediaQuery,
  placement = 'bottom',
  showBackdrop = true,
  zIndex = DEFAULT_Z_INDEX,
  className,
  initialFocusRef,
  minHeight = false,
  maxHeight = 90,
}: SmartModalProps): React.JSX.Element | null {
  const isDrawerMode = useMediaQuery(drawerMediaQuery)
  const hasAnchor = anchorRef?.current != null
  const hasAnchorRef = anchorRef != null
  const drawerGesture = useDrawerGesture({ onClose: onDismiss })

  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const isCenteredModal = !isDrawerMode && !hasAnchorRef && !containerId
  const isDropdownMode = !isDrawerMode && (hasAnchorRef || containerId != null)
  const isContainerOnly = !isDrawerMode && containerId != null && !hasAnchorRef

  const portalContainer = getPortalContainer(containerId ?? undefined)

  if (isDrawerMode || isCenteredModal) {
    return (
      <>
        {fadeTransition((props, item) =>
          item ? (
            <SmartModalOverlay
              className={className}
              style={props}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef as React.RefObject<HTMLElement | null>}
              dangerouslyBypassFocusLock={false}
            >
              <SmartModalContent
                {...(isDrawerMode
                  ? {
                      ...drawerGesture.bind(),
                      style: drawerGesture.style,
                    }
                  : {})}
                $mobile={isDrawerMode}
                $maxHeight={maxHeight}
                $minHeight={minHeight}
              >
                {!initialFocusRef && isDrawerMode ? <div tabIndex={0} /> : null}
                {children}
              </SmartModalContent>
            </SmartModalOverlay>
          ) : null,
        )}
      </>
    )
  }

  if (isContainerOnly && portalContainer) {
    return createPortal(
      isOpen ? (
        <>
          {showBackdrop && (
            <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />
          )}
          <div className={className} style={{ position: 'relative', zIndex: zIndex + 1 }}>
            {children}
          </div>
        </>
      ) : null,
      portalContainer,
    )
  }

  if (isDropdownMode && hasAnchorRef) {
    return (
      <SmartModalDropdown
        isOpen={isOpen}
        onDismiss={onDismiss}
        children={children}
        anchorRef={anchorRef}
        placement={placement}
        showBackdrop={showBackdrop}
        zIndex={zIndex}
        className={className}
        containerId={containerId}
      />
    )
  }

  if (isDropdownMode && containerId != null && !hasAnchorRef && portalContainer) {
    return createPortal(
      isOpen ? (
        <>
          {showBackdrop && (
            <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />
          )}
          <DropdownPanel style={{ position: 'relative', zIndex: zIndex + 1 }} className={className}>
            {children}
          </DropdownPanel>
        </>
      ) : null,
      portalContainer,
    )
  }

  return null
}

interface SmartModalDropdownProps {
  isOpen: boolean
  onDismiss: () => void
  children: React.ReactNode
  anchorRef: React.RefObject<HTMLElement | null>
  placement: SmartModalPlacement
  showBackdrop: boolean
  zIndex: number
  className?: string
  containerId?: string | null
}

function SmartModalDropdown({
  isOpen,
  onDismiss,
  children,
  anchorRef,
  placement,
  showBackdrop,
  zIndex,
  className,
  containerId,
}: SmartModalDropdownProps): React.JSX.Element | null {
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const referenceElement = anchorRef.current
  const options = useMemo(
    () => ({
      placement: placement,
      strategy: 'absolute',
      modifiers: [
        { name: 'offset', options: { offset: [0, POPPER_OFFSET] } },
        { name: 'preventOverflow', options: { padding: POPPER_OFFSET } },
      ],
    } satisfies PopperOptions),
    [placement],
  )
  const { styles, update, attributes } = usePopper(referenceElement, popperElement, options)

  // TODO: Implement as per example here https://codesandbox.io/p/sandbox/gallant-sea-rcg43b?file=%2Fsrc%2FApp.tsx
  // or not at all (just close on resize or scroll)
  // const updateCb = useCallback(() => {
  //   update?.()
  // }, [update])
  // useInterval(updateCb, isOpen ? 100 : null)

  const portalContainer = getPortalContainer(containerId ?? undefined)
  if (!portalContainer || !isOpen) return null

  const popperStyle = { ...styles.popper, zIndex: zIndex + 1 }

  return createPortal(
    <>
      {showBackdrop && (
        <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />
      )}
      <DropdownPanel
        ref={setPopperElement}
        style={popperStyle}
        {...attributes.popper}
        className={className}
      >
        {children}
      </DropdownPanel>
    </>,
    portalContainer,
  )
}

export type { SmartModalPlacement, SmartModalProps } from './types'
export { SMART_MODAL_PLACEMENTS } from './types'
export { useDrawerGesture } from './useDrawerGesture'
