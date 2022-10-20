import { ReactNode, useCallback, useRef, useState } from 'react'
import * as styledEl from './styled'
import { DropdownContentPosition } from './styled'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

export interface DropdownProps extends Partial<DropdownContentPosition> {
  children: ReactNode
  content: ReactNode
  ignoreOutsideClicks?: boolean
  isOpen?: boolean
}

export function Dropdown(props: DropdownProps) {
  const {
    content,
    children,
    isOpen = false,
    ignoreOutsideClicks = false,
    positionX = 'right',
    positionY = 'bottom',
  } = props
  const [showContent, setShowContent] = useState(isOpen)
  const node = useRef<HTMLDivElement>()

  const toggleShowContent = useCallback(() => {
    setShowContent(!showContent)
  }, [showContent, setShowContent])

  const hideContent = useCallback(() => {
    if (!ignoreOutsideClicks) {
      setShowContent(false)
    }
  }, [setShowContent, ignoreOutsideClicks])

  useOnClickOutside(node, hideContent)

  return (
    <styledEl.DropdownBox ref={node as any}>
      <styledEl.DropdownButton onClick={toggleShowContent}>{children}</styledEl.DropdownButton>
      {showContent && (
        <styledEl.DropdownContent positionX={positionX} positionY={positionY}>
          {content}
        </styledEl.DropdownContent>
      )}
    </styledEl.DropdownBox>
  )
}
