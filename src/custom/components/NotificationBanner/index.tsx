import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { Colors } from 'theme/styled'
import { X } from 'react-feather'
import { MEDIA_WIDTHS } from '@src/theme'
import { useIsNotificationClosed } from 'state/affiliate/hooks'
import { useAppDispatch } from 'state/hooks'
import { dismissNotification } from 'state/affiliate/actions'

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
  min-height: 40px;
  padding: 8px;
  border-radius: 12px;
  margin: 0 0 16px 0;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text` as keyof Colors]};
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
  const dispatch = useAppDispatch()
  const isNotificationClosed = useIsNotificationClosed(id) // TODO: the notification closed state is now tied to the Affiliate state, this should be generic
  const [isActive, setIsActive] = useState(!isNotificationClosed ?? isVisible)

  const isHidden = !isVisible || isNotificationClosed || !isActive

  const handleClose = () => {
    setIsActive(false)
    if (id) {
      dispatch(dismissNotification(id))
    }
  }

  useEffect(() => {
    if (isNotificationClosed !== null) {
      setIsActive(!isNotificationClosed)
    }
  }, [isNotificationClosed, isActive])

  return (
    <Banner {...props} isVisible={!isHidden}>
      <BannerContainer>{props.children}</BannerContainer>
      {canClose && <StyledClose size={24} onClick={handleClose} />}
    </Banner>
  )
}
