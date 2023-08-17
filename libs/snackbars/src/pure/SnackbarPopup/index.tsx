import { ReactElement, useCallback, useEffect } from 'react'

import styled from 'styled-components/macro'
import { X } from 'react-feather'
import { animated, useSpring } from '@react-spring/web'

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  position: relative;
  border-radius: 10px;
  padding: 20px 40px 20px 20px;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.black};
  box-shadow: 2px 2px 0 ${({ theme }) => theme.black};
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.text1};
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

  :hover {
    cursor: pointer;
  }
`

const Fader = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.disabled};
  height: 4px;
`

const AnimatedFader = animated(Fader)

export interface SnackbarPopupProps {
  id: string
  duration: number
  children: ReactElement
  icon: ReactElement | undefined
  onExpire(id: string): void
}

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
