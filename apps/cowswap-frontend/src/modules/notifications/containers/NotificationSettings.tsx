import { ReactNode } from 'react'

import TELEGRAM_ICON from '@cowprotocol/assets/images/icon-telegram.svg'
import { RowBetween, RowFixed, HoverTooltip } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Toggle } from 'legacy/components/Toggle'

import { ConnectTelegram, useConnectTelegram } from './ConnectTelegram.tsx'

const DISABLED_TOGGLE_TOOLTIP_MESSAGE = 'This toggle is on by default. Toggling on/off will be supported in the future.'

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
}

export function NotificationSettings({ children }: NotificationSettingsProps): ReactNode {
  const telegramController = useConnectTelegram()
  const { username } = telegramController

  return (
    <>
      {children}

      <SettingsContainer>
        <SectionHeader>Alert types</SectionHeader>
        <SettingsCard>
          <SettingsRow className="disabled">
            <RowBetween>
              <span>Order fills</span>
              <HoverTooltip
                content={<DisabledToggleTooltip>{DISABLED_TOGGLE_TOOLTIP_MESSAGE}</DisabledToggleTooltip>}
                placement="bottom"
                wrapInContainer={false}
                className="toggle-wrapper"
              >
                <Toggle isActive={true} toggle={() => {}} isDisabled={true} />
              </HoverTooltip>
            </RowBetween>
          </SettingsRow>
          <Divider />
          <SettingsRow className="disabled">
            <RowBetween>
              <span>Order expired</span>
              <HoverTooltip
                content={<DisabledToggleTooltip>{DISABLED_TOGGLE_TOOLTIP_MESSAGE}</DisabledToggleTooltip>}
                placement="bottom"
                wrapInContainer={false}
                className="toggle-wrapper"
              >
                <Toggle isActive={true} toggle={() => {}} isDisabled={true} />
              </HoverTooltip>
            </RowBetween>
          </SettingsRow>
        </SettingsCard>
        <SectionDescription>
          Only trade alerts are sent. No marketing messages. Swap and bridge orders aren't supported yet.
        </SectionDescription>

        <SectionHeader>Alert channels</SectionHeader>
        <SettingsCard>
          <SettingsRow>
            <RowBetween>
              <RowFixed gap={8}>
                <TelegramIcon src={TELEGRAM_ICON} />
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
