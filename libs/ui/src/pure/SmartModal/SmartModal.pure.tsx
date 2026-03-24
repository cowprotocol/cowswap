import React, { useMemo, useState, ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { useTransition } from '@react-spring/web'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'

import { DropdownBackdrop, DropdownPanel, SmartModalContent, SmartModalOverlay } from './SmartModal.styled'
import { useDrawerGesture } from './useDrawerGesture'

import type { SmartModalPlacement, SmartModalProps } from './SmartModal.types'
import type { Options as PopperOptions } from '@popperjs/core'

const DEFAULT_Z_INDEX = 1000
const POPPER_OFFSET = 8

function getPortalContainer(containerId: string | null | undefined): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (!containerId) return document.body
  return document.getElementById(containerId) ?? document.body
}

// eslint-disable-next-line max-lines-per-function, complexity
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
}: SmartModalProps): ReactNode {
  const isDrawerMode = useMediaQuery(drawerMediaQuery)
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
    console.log('SmartModal 1')

    return (
      <>
        {fadeTransition((props, item) =>
          item ? (
            <SmartModalOverlay
              $zIndex={zIndex}
              className={clsx('dropdown', 'isDrawer', className)}
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
    console.log('SmartModal 2')

    return createPortal(
      isOpen ? (
        <>
          {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
          <div className={className} style={{ position: 'relative', zIndex: zIndex + 1 }}>
            {children}
          </div>
        </>
      ) : null,
      portalContainer,
    )
  }

  if (isDropdownMode && hasAnchorRef) {
    console.log('SmartModal 3')

    return (
      <SmartModalDropdown
        isOpen={isOpen}
        onDismiss={onDismiss}
        children={children}
        anchorRef={anchorRef}
        placement={placement}
        showBackdrop={showBackdrop}
        zIndex={zIndex}
        className={clsx('dropdown', 'isDropdown', className)}
        containerId={containerId}
      />
    )
  }

  if (isDropdownMode && containerId != null && !hasAnchorRef && portalContainer) {
    console.log('SmartModal 4')

    return createPortal(
      isOpen ? (
        <>
          {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
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

  const options = useMemo(
    () =>
      ({
        placement: placement,
        strategy: 'absolute',
        modifiers: [
          { name: 'offset', options: { offset: [0, POPPER_OFFSET] } },
          { name: 'preventOverflow', options: { padding: POPPER_OFFSET } },
        ],
      }) satisfies PopperOptions,
    [placement],
  )

  // eslint-disable-next-line react-hooks/refs
  const referenceElement = anchorRef.current

  const {
    styles,
    attributes,
    // update
  } = usePopper(referenceElement, popperElement, options)

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
      {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
      <DropdownPanel ref={setPopperElement} style={popperStyle} {...attributes.popper} className={className}>
        {children}
      </DropdownPanel>
    </>,
    portalContainer,
  )
}

export type { SmartModalPlacement, SmartModalProps } from './SmartModal.types'
export { SMART_MODAL_PLACEMENTS } from './SmartModal.types'
export { useDrawerGesture } from './useDrawerGesture'
