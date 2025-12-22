import type { ReactElement } from 'react'

import styled from 'styled-components/macro'

import { useConnectTelegram, ConnectTelegramController } from './useConnectTelegram'

import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

export type { ConnectTelegramController }
export { useConnectTelegram }

const Wrapper = styled.div``

interface ConnectTelegramProps {
  controller: ConnectTelegramController
}

export function ConnectTelegram({ controller }: ConnectTelegramProps): ReactElement {
  const { wrapperRef, isLoading, isSubscribed, needsAuthorization, authorize, toggleSubscription, subscribeWithData } =
    controller

  return (
    <Wrapper ref={wrapperRef}>
      <TelegramConnectionStatus
        isLoading={isLoading}
        isSubscribed={isSubscribed}
        needsAuthorization={needsAuthorization}
        authorize={authorize}
        toggleSubscription={toggleSubscription}
        subscribeWithData={subscribeWithData}
      />
    </Wrapper>
  )
}
