import React, { useEffect, useMemo, useState, ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { useTransition } from '@react-spring/web'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'

import { DropdownBackdrop, DropdownPanel, SmartModalContent, SmartModalOverlay } from './SmartModal.styled'
import { SmartModalLayerContext, useSmartModalLayerDepth } from './SmartModalLayerContext'
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

function useSmartModalDropdownPointerDismiss(
  isOpen: boolean,
  showBackdrop: boolean,
  onDismiss: () => void,
  anchorRef: React.RefObject<HTMLElement | null>,
  popperElement: HTMLDivElement | null,
  layerDepth: number,
): void {
  useEffect(() => {
    if (!isOpen || showBackdrop) return

    const onPointerDownCapture = (e: PointerEvent): void => {
      const target = e.target
      if (!(target instanceof Node)) return
      if (anchorRef.current?.contains(target)) return
      if (popperElement?.contains(target)) return

      const el = target instanceof Element ? target : target.parentElement
      if (el) {
        const panel = el.closest('[data-smart-modal-panel]')
        if (panel instanceof HTMLElement) {
          const raw = panel.dataset.smartModalDepth
          const nestedDepth = raw === undefined ? NaN : Number.parseInt(raw, 10)
          if (!Number.isNaN(nestedDepth) && nestedDepth > layerDepth) return
        }
      }

      onDismiss()
    }

    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [isOpen, showBackdrop, onDismiss, anchorRef, popperElement, layerDepth])
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
  const parentDepth = useSmartModalLayerDepth()
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
  const isDropdownMode = !isDrawerMode && (hasAnchorRef || containerId !== null)
  const isContainerOnly = !isDrawerMode && containerId !== null && !hasAnchorRef

  const portalContainer = getPortalContainer(containerId ?? undefined)

  if (isDrawerMode || isCenteredModal) {
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
                <SmartModalLayerContext.Provider value={parentDepth + 1}>{children}</SmartModalLayerContext.Provider>
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
        <SmartModalLayerContext.Provider value={parentDepth + 1}>
          <>
            {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
            <div className={className} style={{ position: 'relative', zIndex: zIndex + 1 }}>
              {children}
            </div>
          </>
        </SmartModalLayerContext.Provider>
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
        className={clsx('dropdown', 'isDropdown', className)}
        containerId={containerId}
      />
    )
  }

  if (isDropdownMode && containerId != null && !hasAnchorRef && portalContainer) {
    return createPortal(
      isOpen ? (
        <SmartModalLayerContext.Provider value={parentDepth + 1}>
          <>
            {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
            <DropdownPanel style={{ position: 'relative', zIndex: zIndex + 1 }} className={className}>
              {children}
            </DropdownPanel>
          </>
        </SmartModalLayerContext.Provider>
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
  const parentDepth = useSmartModalLayerDepth()
  const layerDepth = parentDepth + 1
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)

  useSmartModalDropdownPointerDismiss(isOpen, showBackdrop, onDismiss, anchorRef, popperElement, layerDepth)

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

  const portalContainer = getPortalContainer(containerId ?? undefined)
  if (!portalContainer || !isOpen) return null

  const popperStyle = { ...styles.popper, zIndex: zIndex + 1 }

  return createPortal(
    <>
      {showBackdrop && <DropdownBackdrop $show $zIndex={zIndex} onClick={onDismiss} aria-hidden />}
      <DropdownPanel
        ref={setPopperElement}
        style={popperStyle}
        {...attributes.popper}
        className={className}
        data-smart-modal-panel=""
        data-smart-modal-depth={layerDepth}
      >
        <SmartModalLayerContext.Provider value={layerDepth}>{children}</SmartModalLayerContext.Provider>
      </DropdownPanel>
    </>,
    portalContainer,
  )
}

export type { SmartModalPlacement, SmartModalProps } from './SmartModal.types'
export { SMART_MODAL_PLACEMENTS } from './SmartModal.types'
export { useDrawerGesture } from './useDrawerGesture'
export { useSmartModalLayerDepth, SmartModalLayerContext } from './SmartModalLayerContext'
