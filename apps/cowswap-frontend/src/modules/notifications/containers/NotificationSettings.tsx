import { ReactNode } from 'react'

import TELEGRAM_ICON from '@cowprotocol/assets/images/icon-telegram.svg'
import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Toggle } from 'legacy/components/Toggle'

import { ConnectTelegram } from './ConnectTelegram'

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
  margin: 8px 16px 32px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.4;
`

const TelegramIcon = styled(SVG)`
  width: 28px;
  height: 28px;
`

interface NotificationSettingsProps {
  children: ReactNode
}

export function NotificationSettings({ children }: NotificationSettingsProps): ReactNode {
  return (
    <>
      {children}

      <SettingsContainer>
        <SectionHeader>Alert types</SectionHeader>
        <SettingsCard>
          <SettingsRow className="disabled">
            <RowBetween>
              <span>Order fills</span>
              <Toggle isActive={true} toggle={() => {}} isDisabled={true} />
            </RowBetween>
          </SettingsRow>
          <Divider />
          <SettingsRow className="disabled">
            <RowBetween>
              <span>Order expired</span>
              <Toggle isActive={true} toggle={() => {}} isDisabled={true} />
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
              <RowFixed gap="8px">
                <TelegramIcon src={TELEGRAM_ICON} />
                <span>Telegram</span>
              </RowFixed>
              <ConnectTelegram />
            </RowBetween>
          </SettingsRow>
        </SettingsCard>
      </SettingsContainer>
    </>
  )
}
