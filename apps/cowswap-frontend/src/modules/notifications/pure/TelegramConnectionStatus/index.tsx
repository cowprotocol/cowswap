import { Loader, UI } from '@cowprotocol/ui'

import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { Toggle } from 'legacy/components/Toggle'

const Connected = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS});
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
`

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  subscribeAccount(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TelegramConnectionStatus({ isLoading, isSubscribed, subscribeAccount }: TelegramConnectionStatusProps) {
  if (isLoading) {
    return <Loader />
  }

  if (!isLoading && !isSubscribed) {
    return <Toggle id="toggle-telegram-notifications" isActive={false} toggle={subscribeAccount} />
  }

  return (
    <Connected>
      Connected <CheckCircle size={14} />
    </Connected>
  )
}
