import { useEffect } from 'react'

import { ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'
import { UI } from '../../enum'

const BackIcon = styled(ArrowLeft)<{ onClick: () => void }>`
  cursor: pointer;
  opacity: 1;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin-right: 10px;

  &:hover {
    opacity: 0.6;
  }
`

interface BackButtonProps {
  onClick(): void
  size?: number
  className?: string
}

export function BackButton(props: BackButtonProps) {
  const { className, size = 22, onClick } = props

  // Close on Escape press
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClick()
      }
    }

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [onClick])

  return <BackIcon size={size} className={className} onClick={onClick}></BackIcon>
}
