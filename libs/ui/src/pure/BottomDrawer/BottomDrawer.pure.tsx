import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Drawer as BaseDrawer } from '@base-ui/react/drawer'

import * as styledEl from './BottomDrawer.styled'

export interface BottomDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Optional a11y title; rendered visually hidden */
  title?: string
  className?: string
  /**
   * Optional pinned footer rendered outside the scrollable body.
   * Use for footer inputs; keyboard inset is applied via StickyFooter styles.
   */
  footer?: ReactNode
  /** Optional header content below the drag handle (outside the scroll body). */
  header?: ReactNode
}

export function BottomDrawer({
  open,
  onOpenChange,
  children,
  title,
  className,
  footer,
  header,
}: BottomDrawerProps): ReactNode {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  useBodyScrollbarLocker(open)

  return (
    <BaseDrawer.Root open={open} onOpenChange={handleOpenChange} swipeDirection="down">
      <BaseDrawer.VirtualKeyboardProvider>
        <BaseDrawer.Portal>
          <styledEl.Backdrop />
          <styledEl.Viewport>
            <styledEl.Popup className={className}>
              <styledEl.Header>
                <styledEl.Handle aria-hidden />
                {header}
              </styledEl.Header>

              <styledEl.Content>
                <styledEl.VisuallyHiddenTitle>{title ?? 'Drawer'}</styledEl.VisuallyHiddenTitle>
                {children}
              </styledEl.Content>

              {footer ? (
                <styledEl.FooterSlot>
                  <styledEl.StickyFooter>{footer}</styledEl.StickyFooter>
                </styledEl.FooterSlot>
              ) : null}
            </styledEl.Popup>
          </styledEl.Viewport>
        </BaseDrawer.Portal>
      </BaseDrawer.VirtualKeyboardProvider>
    </BaseDrawer.Root>
  )
}
