import { ReactNode, useCallback, useEffect } from 'react'

import { UI } from '@cowprotocol/ui'

import { animated, useSpring } from '@react-spring/web'
import { X } from 'react-feather'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  background-color: var(${UI.COLOR_PAPER});
  position: relative;
  border-radius: 10px;
  padding: 20px 35px 20px 20px;
  overflow: hidden;
  border: 2px solid var(${UI.COLOR_TEXT_OPACITY_50});
`

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 20px;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;
  color: inherit;
  opacity: 0.7;
  transition: opacity ${UI.ANIMATION_DURATION} ease-in-out;

  &:hover {
    opacity: 1;
    cursor: pointer;
  }

  svg {
    stroke: currentColor;
  }
`

const Fader = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

const AnimatedFader = animated(Fader)

export interface SnackbarPopupProps {
  id: string
  duration: number
  children: ReactNode
  icon: ReactNode | undefined
  onExpire(id: string): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SnackbarPopup(props: SnackbarPopupProps) {
  const { id, children, duration, icon, onExpire } = props

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration },
  })

  const removeSelf = useCallback(() => {
    onExpire(id)
  }, [id, onExpire])

  useEffect(() => {
    const timeout = setTimeout(removeSelf, duration)

    return () => clearTimeout(timeout)
  }, [duration, removeSelf])

  return (
    <Wrapper>
      <StyledClose onClick={removeSelf} />
      <ContentWrapper>
        {icon && <div>{icon}</div>}
        <div>{children}</div>
      </ContentWrapper>
      <AnimatedFader style={faderStyle} />
    </Wrapper>
  )
}
