'use client'

import { type ReactNode, type RefObject } from 'react'

import { Drawer } from '@base-ui/react/drawer'

import styles from './AssetsFiltersDrawer.module.css'
import { AssetsFiltersSections, ClearAllFiltersButton } from './AssetsFiltersPanel'

interface AssetsFiltersDrawerProps {
  id: string
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
  triggerRef: RefObject<HTMLButtonElement | null>
  assetsCount: string | undefined
  issuers: string[]
  chainIds: number[]
}

export function AssetsFiltersDrawer({
  id,
  isOpen,
  onOpenChange,
  triggerRef,
  assetsCount,
  issuers,
  chainIds,
}: AssetsFiltersDrawerProps): ReactNode {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.backdrop} />
        <Drawer.Viewport className={styles.viewport}>
          <Drawer.Popup id={id} className={styles.popup} finalFocus={triggerRef}>
            <div className={styles.handle} aria-hidden />
            <div className={styles.header}>
              <Drawer.Title className={styles.title}>Filters</Drawer.Title>
              <ClearAllFiltersButton />
            </div>
            <Drawer.Content className={styles.body}>
              <AssetsFiltersSections issuers={issuers} chainIds={chainIds} isTouch />
            </Drawer.Content>
            <div className={styles.footer}>
              {/* The list's own status is hidden from screen readers while this modal is open */}
              <span className={styles.visuallyHidden} role="status">
                {assetsCount}
              </span>
              <Drawer.Close className={styles.showButton}>Show {assetsCount ?? 'assets'}</Drawer.Close>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
