import { ReactNode, type UIEvent, useCallback, useEffect, useState } from 'react'

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
  /** Expands the drawer surface to the full dynamic viewport and removes the rounded sheet chrome. */
  fullScreen?: boolean
  /** Renders this drawer and its backdrop above another open BottomDrawer. */
  nested?: boolean
}

export function BottomDrawer({
  open,
  onOpenChange,
  children,
  title,
  className,
  footer,
  header,
  fullScreen = false,
  nested = false,
}: BottomDrawerProps): ReactNode {
  const [isContentScrolled, setIsContentScrolled] = useState(false)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  const handleContentScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setIsContentScrolled(event.currentTarget.scrollTop > 0)
  }, [])

  useEffect(() => {
    if (!open) {
      setIsContentScrolled(false)
    }
  }, [open])

  return (
    <BaseDrawer.Root open={open} onOpenChange={handleOpenChange} swipeDirection="down">
      <BaseDrawer.VirtualKeyboardProvider>
        <BaseDrawer.Portal>
          <styledEl.Backdrop data-bottom-drawer-backdrop="" forceRender={nested} $nested={nested} />
          <styledEl.Viewport data-bottom-drawer-viewport="" $nested={nested}>
            <styledEl.Popup className={className} $fullScreen={fullScreen} $nested={nested}>
              <styledEl.Header $fullScreen={fullScreen}>
                <styledEl.Handle aria-hidden $fullScreen={fullScreen} />
                {header}
              </styledEl.Header>

              <styledEl.Content
                $fullScreen={fullScreen}
                data-scrolled={isContentScrolled ? 'true' : undefined}
                onScroll={handleContentScroll}
              >
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
