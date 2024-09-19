import { ReactElement } from 'react'

import { Command } from '@cowprotocol/types'

import { AlertTriangle } from 'react-feather'

import * as styledEl from './styled'

interface ExternalSourceAlertProps {
  children: ReactElement
  title: ReactElement | string
  onChange: Command
}
export function ExternalSourceAlert({ onChange, title, children }: ExternalSourceAlertProps) {
  return (
    <styledEl.Contents>
      <AlertTriangle size={48} strokeWidth={1} />
      <h3>{title}</h3>
      {children}
      <div>
        <styledEl.AcceptanceBox>
          <input type="checkbox" onChange={onChange} />
          <span>I understand</span>
        </styledEl.AcceptanceBox>
      </div>
    </styledEl.Contents>
  )
}
