import { ReactNode } from 'react'

import { FancyButton, Loader } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Toggle } from 'legacy/components/Toggle'

const AuthButton = styled(FancyButton)`
  padding-left: 14px;
  padding-right: 14px;
  font-size: 13px;
  cursor: pointer;
`

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  needsAuthorization: boolean
  toggleSubscription(): void
  authorize(): Promise<void>
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  needsAuthorization,
  authorize,
  toggleSubscription,
}: TelegramConnectionStatusProps): ReactNode {
  if (isLoading) {
    return <Loader />
  }

  return (
    <div>
      {needsAuthorization ? (
        <AuthButton onClick={authorize}>Authorize Telegram</AuthButton>
      ) : (
        <Toggle id="toggle-telegram-notifications" isActive={isSubscribed} toggle={toggleSubscription} />
      )}
    </div>
  )
}
