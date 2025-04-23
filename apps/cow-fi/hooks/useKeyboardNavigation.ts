import { RefObject, useEffect, useState } from 'react'

// Keyboard navigation types
type NavigationDirection = 'up' | 'down'

const KEYBOARD_KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
} as const

// Navigation helper function
const getNextIndex = (currentIndex: number, itemsLength: number, direction: NavigationDirection): number => {
  if (direction === 'down') {
    return (currentIndex + 1) % Math.max(1, itemsLength)
  } else {
    return (currentIndex - 1 + itemsLength) % Math.max(1, itemsLength)
  }
}

/**
 * Custom hook for keyboard navigation with improved focus management
 * @param isActive - Whether keyboard navigation is active
 * @param itemsLength - Number of items that can be navigated
 * @param onSelect - Callback when an item is selected (e.g. with Enter key)
 * @param onEscape - Callback when Escape key is pressed
 * @param containerRef - Reference to the container element for focus management
 * @returns The currently selected index (-1 if none selected)
 */
export function useKeyboardNavigation(
  isActive: boolean,
  itemsLength: number,
  onSelect: (index: number) => void,
  onEscape: () => void,
  containerRef: RefObject<HTMLDivElement | null>,
): number {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    if (!isActive) {
      setSelectedIndex(-1)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) {
        return
      }

      switch (e.key) {
        case KEYBOARD_KEYS.ARROW_DOWN:
        case KEYBOARD_KEYS.ARROW_UP:
          e.preventDefault()
          setSelectedIndex((prevIndex) =>
            getNextIndex(prevIndex, itemsLength, e.key === KEYBOARD_KEYS.ARROW_DOWN ? 'down' : 'up'),
          )
          break
        case KEYBOARD_KEYS.ENTER:
          if (selectedIndex >= 0 && selectedIndex < itemsLength) {
            onSelect(selectedIndex)
          }
          break
        case KEYBOARD_KEYS.ESCAPE:
          onEscape()
          break
        case KEYBOARD_KEYS.TAB:
          // Allow normal tab navigation but keep track of selected item
          if (itemsLength > 0) {
            e.preventDefault()
            setSelectedIndex((prevIndex) => getNextIndex(prevIndex, itemsLength, e.shiftKey ? 'up' : 'down'))
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, itemsLength, onSelect, onEscape, containerRef])

  return selectedIndex
}
