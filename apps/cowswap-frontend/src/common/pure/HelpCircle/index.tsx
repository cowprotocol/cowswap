import { questionIcon } from '@cowprotocol/assets/cow-swap/question'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { useIsDarkMode } from 'legacy/state/user/hooks'

const HelpCircleWrapper = styled.div`
  display: flex;
  align-items: center;

  > svg {
    opacity: 0.5;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export interface HelpCircleProps {
  size?: number
}

export function HelpCircle({ size }: HelpCircleProps) {
  const darkMode = useIsDarkMode()
  return (
    <HelpCircleWrapper>
      <SVG width={size ? size : 14} height={size ? size : 14} src={questionIcon(darkMode)} />
    </HelpCircleWrapper>
  )
}
