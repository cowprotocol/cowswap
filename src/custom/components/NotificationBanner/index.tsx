import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { Colors } from 'theme/styled'
import { X } from 'react-feather'
import { MEDIA_WIDTHS } from '@src/theme'
import { useDismissNotification } from 'state/affiliate/hooks'
import { useAppDispatch } from '@src/state/hooks'
import { dismissNotification } from 'state/affiliate/actions'

type Level = 'info' | 'warning' | 'error'

export interface BannerProps {
  children: React.ReactNode
  level: Level
  isVisible: boolean
  changeOnProp?: string | null
  canClose?: boolean
}

const Banner = styled.div<Pick<BannerProps, 'isVisible' | 'level'>>`
  width: 100%;
  min-height: 40px;
  padding: 6px 6px;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text` as keyof Colors]};
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  z-index: 1;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    font-size: 12px;
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
  const [isActive, setIsActive] = useState(props.isVisible)
  const [changeOnPropStore, setChangeOnPropStore] = useState(props.changeOnProp)
  const { canClose = true } = props

  const dispatch = useAppDispatch()
  const isNotificationDismissed = useDismissNotification()
  const noteHandleClose = () => {
    setIsActive(false)
    dispatch(dismissNotification(!isNotificationDismissed))
  }

  useEffect(() => {
    if (changeOnPropStore !== props.changeOnProp) {
      dispatch(dismissNotification(false))
      setChangeOnPropStore(props.changeOnProp)
    }
  }, [dispatch, props.changeOnProp, changeOnPropStore])

  return (
    <Banner {...props} isVisible={isActive} style={{ display: isNotificationDismissed ? 'none' : 'flex' }}>
      <BannerContainer>{props.children}</BannerContainer>
      {canClose && <StyledClose size={16} onClick={() => noteHandleClose()} />}
    </Banner>
  )
}
