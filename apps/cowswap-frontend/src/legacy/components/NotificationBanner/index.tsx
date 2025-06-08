import { useEffect, useState } from 'react'

import { Media, MEDIA_WIDTHS, UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { useNotificationState } from 'common/hooks/useNotificationState'

type Level = 'INFO' | 'WARNING' | 'DANGER'

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
  background-color: ${({ level }) => `var(${UI[('COLOR_' + level + '_BG') as keyof typeof UI]})`};
  color: ${({ level }) => `var(${UI[('COLOR_' + level + '_TEXT') as keyof typeof UI]})`};
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

  ${Media.upToLarge()} {
    font-size: 14px;
  }
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function NotificationBanner(props: BannerProps) {
  const { id, isVisible, canClose = true } = props
  const [isActive, setIsActive] = useState(isVisible)
  const [{ isClosed }, setNotificationState] = useNotificationState(id)

  const isHidden = !isVisible || isClosed || !isActive

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
