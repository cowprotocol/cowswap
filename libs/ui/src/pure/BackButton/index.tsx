import { useEffect } from 'react'

import { Command } from '@cowprotocol/types'

import { ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BackIcon = styled(ArrowLeft as any)<{ onClick: Command }>`
  cursor: pointer;
  opacity: 1;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin-right: 10px;
  z-index: 10;

  &:hover {
    opacity: 0.6;
  }
`

interface BackButtonProps {
  size?: number
  className?: string

  onClick(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BackButton(props: BackButtonProps) {
  const { className, size = 22, onClick } = props

  // Close on Escape press
  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

  return <BackIcon size={size} className={className} onClick={onClick} />
}
