import React from 'react'

import { Command } from '@cowprotocol/types'

import { ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'

import { ConnectTelegram } from 'modules/notifications'

import { SidebarHeader } from './styled'

const Option = styled.div`
  text-align: left;
  margin: 0 20px;

  h4 {
    margin: 0 0 10px 0;
  }
`

interface NotificationSettingsProps {
  toggleSettingsOpen: Command
}

export function NotificationSettings({ toggleSettingsOpen }: NotificationSettingsProps) {
  return (
    <div>
      <SidebarHeader>
        <span>
          <ArrowLeft size="15" onClick={toggleSettingsOpen} />
        </span>
        <h3>Settings</h3>
      </SidebarHeader>
      <Option>
        <h4>Telegram</h4>
        <ConnectTelegram />
      </Option>
    </div>
  )
}
