import { ReactNode } from 'react'

import SVG from 'react-inlinesvg'

import greetingCow from '../assets/greeting-cow.svg'
import { ActionButton, GreetingContent, GreetingWrapper } from '../containers/UiGuideGreeting/UiGuideGreeting.styled'

interface CoWBubbleProps {
  children: ReactNode
  visible: boolean
  buttons: { text: string; onClick: () => void; secondary?: boolean }[]
}
export function CoWBubble({ visible, buttons, children }: CoWBubbleProps): ReactNode {
  return (
    <GreetingWrapper id="ui-guide-greeting" visible$={visible}>
      <SVG src={greetingCow} />
      <GreetingContent>
        {children}
        {buttons.map((button) => {
          return (
            <ActionButton key={button.text} onClick={button.onClick} secondary={button.secondary}>
              {button.text}
            </ActionButton>
          )
        })}
      </GreetingContent>
      {/*{children}*/}
    </GreetingWrapper>
  )
}
