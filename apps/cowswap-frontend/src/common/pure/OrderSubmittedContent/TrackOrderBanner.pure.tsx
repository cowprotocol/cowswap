import { ReactNode } from 'react'

import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Bell, X } from 'react-feather'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  margin-top: 10px;
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
  text-align: left;
`

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 24px;
`

const IconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  color: inherit;
`

const Title = styled.h4`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: inherit;
`

const Description = styled.p`
  margin: 12px 0 16px;
  font-size: 14px;
  line-height: 1.4;
  color: inherit;
`

const EnableButton = styled(ButtonPrimary)`
  width: 100%;
`

export interface TrackOrderBannerProps {
  onEnableClick: () => void
  onClose: () => void
}

export function TrackOrderBanner({ onEnableClick, onClose }: TrackOrderBannerProps): ReactNode {
  return (
    <Wrapper>
      <CloseButton type="button" onClick={onClose} aria-label={t`Close`}>
        <X size={18} />
      </CloseButton>
      <Header>
        <IconCircle>
          <Bell size={20} />
        </IconCircle>
        <Title>
          <Trans>Track this order</Trans>
        </Title>
      </Header>
      <Description>
        <Trans>Get Telegram updates when it fills or expires.</Trans>
      </Description>
      <EnableButton onClick={onEnableClick}>
        <Trans>Enable Telegram alerts</Trans>
      </EnableButton>
    </Wrapper>
  )
}
