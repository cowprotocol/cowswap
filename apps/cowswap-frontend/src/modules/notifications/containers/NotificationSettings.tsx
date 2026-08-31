import { ReactNode } from 'react'

import iconTelegramSrc from '@cowprotocol/assets/images/icon-telegram.svg'
import { RowBetween, RowFixed, HoverTooltip, UI, Toggle } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { ConnectTelegram } from './ConnectTelegram'
import { useConnectTelegram } from './ConnectTelegram/useConnectTelegram'

const DisabledToggleTooltip = styled.span`
  display: block;
  font-size: 13px;
  padding: 5px 10px;
  max-width: 250px;
`

const SettingsContainer = styled.div`
  padding: 16px;
`

const SettingsCard = styled.div`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
`

const SettingsRow = styled.div`
  padding: 12px 16px;
  font-weight: 500;

  &:hover:not(.disabled) {
    background: var(${UI.COLOR_PAPER_DARKEST});
  }

  &.disabled {
    opacity: 0.7;
  }

  &.disabled .toggle-wrapper {
    pointer-events: none;
  }
`

const SectionHeader = styled.h4`
  margin: 20px 16px 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Divider = styled.div`
  height: 1px;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
`

const SectionDescription = styled.p`
  margin: 8px 16px 42px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.4;
`

const TelegramIcon = styled(SVG)`
  width: 28px;
  height: 28px;
`

const TelegramUsername = styled.div`
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  margin: 3px 0 0;
`

interface NotificationSettingsProps {
  children: ReactNode
  isSettingsOpen: boolean
}

export function NotificationSettings({ children, isSettingsOpen }: NotificationSettingsProps): ReactNode {
  const telegramController = useConnectTelegram(isSettingsOpen)
  const { username } = telegramController

  return (
    <>
      {children}

      <SettingsContainer>
        <SectionHeader>
          <Trans>Alert types</Trans>
        </SectionHeader>
        <SettingsCard>
          <SettingsRow className="disabled">
            <RowBetween>
              <span>
                <Trans>Order fills</Trans>
              </span>
              <HoverTooltip
                content={<DisabledToggleTooltipMessage />}
                placement="bottom"
                wrapInContainer={false}
                className="toggle-wrapper"
              >
                <Toggle checked toggle={() => {}} disabled />
              </HoverTooltip>
            </RowBetween>
          </SettingsRow>
          <Divider />
          <SettingsRow className="disabled">
            <RowBetween>
              <span>
                <Trans>Order expired</Trans>
              </span>
              <HoverTooltip
                content={<DisabledToggleTooltipMessage />}
                placement="bottom"
                wrapInContainer={false}
                className="toggle-wrapper"
              >
                <Toggle checked toggle={() => {}} disabled />
              </HoverTooltip>
            </RowBetween>
          </SettingsRow>
        </SettingsCard>
        <SectionDescription>
          <Trans>Only trade alerts are sent. No marketing messages. Swap and bridge orders aren't supported yet.</Trans>
        </SectionDescription>

        <SectionHeader>
          <Trans>Alert channels</Trans>
        </SectionHeader>
        <SettingsCard>
          <SettingsRow>
            <RowBetween>
              <RowFixed gap={8}>
                <TelegramIcon src={iconTelegramSrc} />
                <div>
                  <span>Telegram</span>
                  {username && <TelegramUsername>@{username}</TelegramUsername>}
                </div>
              </RowFixed>
              <ConnectTelegram controller={telegramController} />
            </RowBetween>
          </SettingsRow>
        </SettingsCard>
      </SettingsContainer>
    </>
  )
}

function DisabledToggleTooltipMessage(): ReactNode {
  return (
    <DisabledToggleTooltip>
      <Trans>This toggle is on by default. Toggling on/off will be supported in the future.</Trans>
    </DisabledToggleTooltip>
  )
}
