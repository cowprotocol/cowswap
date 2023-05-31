import { useEffect, useState } from 'react'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { MEDIA_WIDTHS } from 'legacy/theme'

import { useNotificationState } from 'common/hooks/useNotificationState'

type Level = 'info' | 'warning' | 'error'

export interface BannerProps {
  children: React.ReactNode
  className?: string
  level: Level
  isVisible: boolean
  id?: string
  canClose?: boolean
}

const Banner = styled.div<Pick<BannerProps, 'isVisible' | 'level'>>`
  width: 100%;
  padding: 8px;
  border-radius: 12px;
  margin: 0 0 16px 0;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text`]};
  font-size: 16px;
  text-align: center;
  justify-content: space-between;
  align-items: center;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  z-index: 1;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    font-size: 12px;
    width: 100%;
    text-align: center;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 14px;
  `}
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
  const { id, isVisible, canClose = true } = props
  const [isActive, setIsActive] = useState(isVisible)
  const [{ isClosed }, setNotificationState] = useNotificationState(id)

  const isHidden = !isVisible || isClosed || !isActive

  const handleClose = () => {
    setIsActive(false)
    setNotificationState({ isClosed: true })
  }

  useEffect(() => {
    if (isClosed !== null) {
      setIsActive((state) => !state)
    }
  }, [isClosed])

  return (
    <Banner {...props} isVisible={!isHidden}>
      <BannerContainer>{props.children}</BannerContainer>
      {canClose && <StyledClose size={24} onClick={handleClose} />}
    </Banner>
  )
}
