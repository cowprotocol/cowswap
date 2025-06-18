import { ReactElement } from 'react'

import { Command } from '@cowprotocol/types'

import { AlertTriangle } from 'react-feather'

import * as styledEl from './styled'

interface ExternalSourceAlertProps {
  children: ReactElement
  title: ReactElement | string
  onChange: Command
  className?: string
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExternalSourceAlert({ className, onChange, title, children }: ExternalSourceAlertProps) {
  return (
    <styledEl.Contents className={className}>
      <AlertTriangle size={48} strokeWidth={1} />
      <styledEl.Title>{title}</styledEl.Title>
      {children}

      <styledEl.AcceptanceBox>
        <input type="checkbox" onChange={onChange} />
        <span>I understand</span>
      </styledEl.AcceptanceBox>
    </styledEl.Contents>
  )
}
