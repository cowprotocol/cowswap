import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useLatestRef } from '@cowprotocol/common-hooks'

import { BottomDrawer } from './BottomDrawer.pure'

import { Dialog, type DialogVariant } from '../Dialog/Dialog.pure'
import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'

export interface BottomDrawerOrDialogProps extends BaseSurfaceProps {
  variant?: DialogVariant
  /**
   * When true, render BottomDrawer; otherwise Dialog.
   * Pass the same value used for `ModalHeader` `titleAs`.
   */
  isDrawer: boolean
}

export function BottomDrawerOrDialog({
  variant,
  isDrawer,
  isOpen,
  onOpenChange,
  onOpenChangeComplete,
  ...rest
}: BottomDrawerOrDialogProps): ReactNode {
  const onOpenChangeRef = useLatestRef(onOpenChange)
  const onOpenChangeCompleteRef = useLatestRef(onOpenChangeComplete)
  const isDrawerRef = useLatestRef(isDrawer)
  const isOpenRef = useLatestRef(isOpen)

  const [activeIsDrawer, setActiveIsDrawer] = useState(isDrawer)
  const [surfaceOpen, setSurfaceOpen] = useState(isOpen)
  const isSwitchingBranchRef = useRef(false)

  useEffect(() => {
    if (!isSwitchingBranchRef.current) {
      setSurfaceOpen(isOpen)
    }
  }, [isOpen])

  useEffect(() => {
    if (isSwitchingBranchRef.current && isDrawer === activeIsDrawer) {
      isSwitchingBranchRef.current = false

      if (isOpenRef.current) {
        setSurfaceOpen(true)
      }

      return
    }

    if (isDrawer === activeIsDrawer) {
      return
    }

    if (surfaceOpen) {
      isSwitchingBranchRef.current = true
      setSurfaceOpen(false)
      return
    }

    if (!isSwitchingBranchRef.current) {
      setActiveIsDrawer(isDrawer)
    }
  }, [activeIsDrawer, isDrawer, isOpenRef, surfaceOpen])

  const completeBranchSwitch = useCallback(() => {
    isSwitchingBranchRef.current = false
    setActiveIsDrawer(isDrawerRef.current)

    if (isOpenRef.current) {
      setSurfaceOpen(true)
    }
  }, [isDrawerRef, isOpenRef])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isSwitchingBranchRef.current && !nextOpen) {
        return
      }

      onOpenChangeRef.current(nextOpen)
    },
    [onOpenChangeRef],
  )

  const handleOpenChangeComplete = useCallback(
    (nextOpen: boolean) => {
      if (isSwitchingBranchRef.current && !nextOpen) {
        completeBranchSwitch()

        if (!isOpenRef.current) {
          onOpenChangeCompleteRef.current?.(false)
        }

        return
      }

      onOpenChangeCompleteRef.current?.(nextOpen)
    },
    [completeBranchSwitch, isOpenRef, onOpenChangeCompleteRef],
  )

  useEffect(() => {
    const closeOverlay = onOpenChangeRef.current

    return () => {
      closeOverlay(false)
    }
  }, [onOpenChangeRef])

  if (activeIsDrawer) {
    return (
      <BottomDrawer
        {...rest}
        isOpen={surfaceOpen}
        onOpenChange={handleOpenChange}
        onOpenChangeComplete={handleOpenChangeComplete}
      />
    )
  }

  return (
    <Dialog
      {...rest}
      isOpen={surfaceOpen}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      variant={variant}
    />
  )
}
