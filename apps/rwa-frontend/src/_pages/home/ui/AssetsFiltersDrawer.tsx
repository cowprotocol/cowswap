'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, type RefObject } from 'react'

import { Drawer } from '@base-ui/react/drawer'

import explorerStyles from './AssetsExplorer.module.css'
import styles from './AssetsFiltersDrawer.module.css'
import { AssetsFiltersSections, ClearAllFiltersButton } from './AssetsFiltersPanel'

import { assetsCountLabelAtom } from '../model/assetsQueryAtoms'

interface AssetsFiltersDrawerProps {
  id: string
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function AssetsFiltersDrawer({ id, isOpen, onOpenChange, triggerRef }: AssetsFiltersDrawerProps): ReactNode {
  const assetsCount = useAtomValue(assetsCountLabelAtom)

  return (
    // Base UI's scroll lock reserves the scrollbar's gutter, which a fixed backdrop can't cover, so CSS locks the page
    <Drawer.Root modal="trap-focus" open={isOpen} onOpenChange={onOpenChange} swipeDirection="down">
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
              <AssetsFiltersSections isInDrawer />
            </Drawer.Content>
            <div className={styles.footer}>
              {/* The list's own status is hidden from screen readers while this modal is open */}
              <span className={explorerStyles.visuallyHidden} role="status">
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
