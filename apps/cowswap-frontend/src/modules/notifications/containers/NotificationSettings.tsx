import React, { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { ConnectTelegram } from './ConnectTelegram'

const Option = styled.div`
  text-align: left;
  margin: 0 20px;

  h4 {
    margin: 0 0 10px 0;
  }
`

interface NotificationSettingsProps {
  children: ReactNode
}

export function NotificationSettings({ children }: NotificationSettingsProps) {
  return (
    <div>
      {children}
      <Option>
        <h4>Telegram</h4>
        <ConnectTelegram />
      </Option>
    </div>
  )
}
