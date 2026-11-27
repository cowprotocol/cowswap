import { type ReactNode, useRef } from 'react'

import styles from './ResetFiltersButton.module.css'

const FOCUSABLE_SELECTOR = 'button, input, select, [role="combobox"], [tabindex]:not([tabindex="-1"])'

interface ResetFiltersButtonProps {
  variant?: 'regular' | 'small'
  className?: string
  /** Defaults to "Reset filters" */
  children?: ReactNode
  onClick(): void
}

/**
 * Callers render it only while a filter is set, so it unmounts once it resets them. A keyboard user's focus then
 * moves to the control rendered just before it, instead of falling back to the page.
 */
export function ResetFiltersButton({
  variant = 'regular',
  className,
  children = 'Reset filters',
  onClick,
}: ResetFiltersButtonProps): ReactNode {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const classNames = [styles.button, variant === 'small' && styles.small, className].filter(Boolean).join(' ')

  const onReset = (): void => {
    const button = buttonRef.current
    const focusTarget = button && document.activeElement === button ? getPreviousControl(button) : null

    onClick()
    focusTarget?.focus()
  }

  return (
    <button ref={buttonRef} type="button" className={classNames} onClick={onReset}>
      {children}
    </button>
  )
}

function getPreviousControl(button: HTMLButtonElement): HTMLElement | null {
  const sibling = button.previousElementSibling

  if (!(sibling instanceof HTMLElement)) return null

  return sibling.matches(FOCUSABLE_SELECTOR) ? sibling : sibling.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
}
