import { ReactNode, useCallback, useRef, useState } from 'react'
import * as styledEl from './styled'
import { DropdownContentPosition } from './styled'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

export interface DropdownProps extends Partial<DropdownContentPosition> {
  children: ReactNode
  content: ReactNode
  isOpened?: boolean
}

export function Dropdown(props: DropdownProps) {
  const { content, children, isOpened = false, positionX = 'right', positionY = 'bottom' } = props
  const [showContent, setShowContent] = useState(isOpened)
  const node = useRef<HTMLDivElement>()

  const toggleShowContent = useCallback(() => {
    setShowContent(!showContent)
  }, [showContent, setShowContent])
  const hideContent = useCallback(() => {
    setShowContent(false)
  }, [setShowContent])

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
