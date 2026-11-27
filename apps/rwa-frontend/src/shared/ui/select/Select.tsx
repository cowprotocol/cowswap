'use client'

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { createPortal } from 'react-dom'

import { getActiveIndexForKey } from './listboxKeyboard'
import { getListboxPosition, type ListboxPosition } from './listboxPosition'
import styles from './Select.module.css'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { CheckIcon, ChevronDownIcon } from '@/shared/ui/icons'

export interface SelectOption<T> {
  value: T
  /** Unique within the options */
  label: string
  icon?: ReactNode
}

interface ComboboxKeyState {
  /** `null` while the listbox is closed */
  activeIndex: number | null
  selectedIndex: number
  labels: string[]
  open(): void
  close(): void
  select(index: number): void
  activate(index: number): void
}

interface SelectListboxProps<T> {
  ref: RefObject<HTMLUListElement | null>
  id: string
  label: string
  options: SelectOption<T>[]
  selectedIndex: number
  activeIndex: number
  /** `null` while the listbox is measured */
  position: ListboxPosition | null
  onActivate(index: number): void
  onSelect(index: number): void
}

interface SelectProps<T> {
  'aria-label': string
  value: T
  options: SelectOption<T>[]
  onChange(value: T): void
  /** `regular` is 40px high with a border, `small` is 32px, `filled` is 40px on the surface color without a border */
  variant?: 'regular' | 'small' | 'filled'
  className?: string
}

export function Select<T>({
  'aria-label': label,
  value,
  options,
  onChange,
  variant = 'regular',
  className,
}: SelectProps<T>): ReactNode {
  const listboxId = useId()
  const triggerRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  // `null` while the listbox is closed
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [position, setPosition] = useState<ListboxPosition | null>(null)
  const isOpen = activeIndex !== null
  const selectedIndex = options.findIndex((option) => Object.is(option.value, value))
  const selected = options[selectedIndex]

  const close = useCallback(() => {
    setActiveIndex(null)
    setPosition(null)
  }, [])
  const open = (): void => setActiveIndex(Math.max(selectedIndex, 0))
  const select = (index: number): void => {
    const option = options[index]

    close()
    if (option && !Object.is(option.value, value)) onChange(option.value)
  }

  // The listbox is fixed to the viewport, so `overflow` of the trigger's containers doesn't clip it
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const listbox = listboxRef.current

    if (!isOpen || !trigger || !listbox) return

    setPosition(
      getListboxPosition(trigger.getBoundingClientRect(), listbox.getBoundingClientRect(), {
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      }),
    )
  }, [isOpen])

  useEffect(() => {
    if (activeIndex !== null && position)
      listboxRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, position])

  useDismissOnOutsideInteraction(isOpen, [triggerRef, listboxRef], close)

  return (
    <>
      <div
        ref={triggerRef}
        className={[styles.trigger, styles[variant], className].filter(Boolean).join(' ')}
        role="combobox"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen ? `${listboxId}-${activeIndex}` : undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={(event) =>
          onComboboxKeyDown(event, {
            activeIndex,
            selectedIndex,
            labels: options.map((option) => option.label),
            open,
            close,
            select,
            activate: setActiveIndex,
          })
        }
        onBlur={close}
      >
        {selected?.icon}
        <span className={styles.value}>{selected?.label}</span>
        <ChevronDownIcon className={styles.chevron} />
      </div>
      {isOpen &&
        createPortal(
          <SelectListbox
            ref={listboxRef}
            id={listboxId}
            label={label}
            options={options}
            selectedIndex={selectedIndex}
            activeIndex={activeIndex}
            position={position}
            onActivate={setActiveIndex}
            onSelect={select}
          />,
          document.body,
        )}
    </>
  )
}

function onComboboxKeyDown(event: KeyboardEvent<HTMLDivElement>, state: ComboboxKeyState): void {
  const { activeIndex, selectedIndex, labels } = state

  if (event.altKey || event.ctrlKey || event.metaKey) return

  if (activeIndex === null) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      state.open()
      return
    }

    const index = event.key.length === 1 ? getActiveIndexForKey(event.key, selectedIndex, labels) : null

    if (index !== null) state.select(index)
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    state.close()
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    state.select(activeIndex)
  } else if (event.key === 'Tab') {
    state.close()
  } else {
    const index = getActiveIndexForKey(event.key, activeIndex, labels)

    if (index === null) return

    event.preventDefault()
    state.activate(index)
  }
}

function SelectListbox<T>({
  ref,
  id,
  label,
  options,
  selectedIndex,
  activeIndex,
  position,
  onActivate,
  onSelect,
}: SelectListboxProps<T>): ReactNode {
  return (
    <ul
      ref={ref}
      id={id}
      className={styles.listbox}
      role="listbox"
      aria-label={label}
      style={
        position
          ? { top: position.top, left: position.left, minWidth: position.minWidth, maxHeight: position.maxHeight }
          : { visibility: 'hidden' }
      }
      // Keeps the focus on the combobox, which would close the listbox on blur before the click selects
      onMouseDown={(event) => event.preventDefault()}
    >
      {options.map((option, index) => (
        <li
          key={option.label}
          id={`${id}-${index}`}
          className={index === activeIndex ? `${styles.option} ${styles.active}` : styles.option}
          role="option"
          aria-selected={index === selectedIndex}
          onPointerMove={() => onActivate(index)}
          onClick={() => onSelect(index)}
        >
          {option.icon}
          <span className={styles.label}>{option.label}</span>
          {index === selectedIndex && <CheckIcon className={styles.check} />}
        </li>
      ))}
    </ul>
  )
}
