import { ElementType, ReactNode, useRef } from 'react'

import clsx from 'clsx'

import * as styledEl from './styled'
import { useScrollableBottomVisibility } from './useScrollableBottomVisibility'

export interface ModalHeaderProps {
  sticky?: boolean
  title?: ReactNode
  /**
   * Polymorphic title element: `Dialog.Title`, `BottomDrawer.Title`, or `'h2'` / `'h3'` / …
   * Prefer the Base UI Title inside overlays so `aria-labelledby` is wired.
   */
  titleAs?: ElementType
  children?: ReactNode
  subtitle?: ReactNode
  hideSubtitle?: boolean
  rightSlot?: ReactNode
  hideRightSlot?: boolean
  scrollableBottomSlot?: ReactNode
  bottomBorder?: boolean
  contentMargin?: boolean
  onScrollableBottomVisibilityChange?(visible: boolean): void
  onBack?(): void
  onClose?(): void
  className?: string
}

// TODO: Move inside modal Modal directory

export function ModalHeader({
  sticky,
  title,
  titleAs,
  children,
  subtitle,
  hideSubtitle = false,
  rightSlot,
  hideRightSlot = false,
  scrollableBottomSlot,
  bottomBorder,
  contentMargin,
  onScrollableBottomVisibilityChange,
  className,
  onBack,
  onClose,
}: ModalHeaderProps): ReactNode {
  const headerRef = useRef<HTMLElement>(null)
  const scrollableBottomSlotRef = useRef<HTMLDivElement>(null)
  const hasBack = !!onBack
  const hasClose = !!onClose
  const hasScrollableBottomSlot = !!scrollableBottomSlot
  const headerClass = clsx(
    className,
    hasBack && 'hasBack',
    hasClose && 'hasClose',
    sticky && 'sticky',
    subtitle && !hideSubtitle && 'noBottomPadding',
  )

  useScrollableBottomVisibility(
    scrollableBottomSlotRef,
    headerRef,
    hasScrollableBottomSlot && !!onScrollableBottomVisibilityChange,
    onScrollableBottomVisibilityChange,
  )

  return (
    <>
      <styledEl.Header
        ref={headerRef}
        className={headerClass}
        $bottomBorder={bottomBorder && !hasScrollableBottomSlot}
        $contentMargin={contentMargin && !hasScrollableBottomSlot}
      >
        <styledEl.Inner>
          <styledEl.BackButton aria-hidden={!hasBack} disabled={!hasBack} onClick={onBack} />

          <styledEl.Title as={titleAs}>{title || children}</styledEl.Title>
          {rightSlot ? (
            <styledEl.RightSlot aria-hidden={hideRightSlot} inert={hideRightSlot}>
              {rightSlot}
            </styledEl.RightSlot>
          ) : null}

          <styledEl.CloseButton aria-hidden={!hasClose} disabled={!hasClose} onClick={onClose} />
        </styledEl.Inner>

        {subtitle ? (
          <styledEl.Subtitle aria-hidden={hideSubtitle} inert={hideSubtitle}>
            <styledEl.SubtitleContent>
              <styledEl.SubtitleLabel>{subtitle}</styledEl.SubtitleLabel>
            </styledEl.SubtitleContent>
          </styledEl.Subtitle>
        ) : null}
      </styledEl.Header>

      {hasScrollableBottomSlot ? (
        <styledEl.ScrollableBottomSlot
          ref={scrollableBottomSlotRef}
          $bottomBorder={bottomBorder}
          $contentMargin={contentMargin}
        >
          {scrollableBottomSlot}
        </styledEl.ScrollableBottomSlot>
      ) : null}
    </>
  )
}
