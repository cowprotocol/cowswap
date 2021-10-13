import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Colors } from 'theme/styled'
import { X } from 'react-feather'

type Level = 'info' | 'warning' | 'error'

export interface BannerProps {
  children: React.ReactNode
  level: Level
  isVisible: boolean
}

const Banner = styled.div<Pick<BannerProps, 'isVisible' | 'level'>>`
  width: 100%;
  height: 40px;
  padding: 6px 6px;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text` as keyof Colors]};
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  z-index: 1;
`

const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`
const BannerContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`
export default function NotificationBanner(props: BannerProps) {
  const [isActive, setIsActive] = useState(props.isVisible)
  return (
    <Banner {...props} isVisible={isActive}>
      <BannerContainer>{props.children}</BannerContainer>
      <StyledClose size={16} onClick={() => setIsActive(false)} />
    </Banner>
  )
}
