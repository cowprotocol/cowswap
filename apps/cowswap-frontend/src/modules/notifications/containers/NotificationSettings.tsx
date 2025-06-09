import React, { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { ConnectTelegram } from './ConnectTelegram'

const OptionsList = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 16px;
`

const Option = styled.div`
  display: flex;
  flex-flow: column wrap;
  text-align: left;
  gap: 10px;

  > h4 {
    margin: 0;
  }
`

interface NotificationSettingsProps {
  children: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NotificationSettings({ children }: NotificationSettingsProps) {
  return (
    <>
      {children}

      <OptionsList>
        <Option>
          <h4>Telegram</h4>
          <ConnectTelegram />
        </Option>
      </OptionsList>
    </>
  )
}
