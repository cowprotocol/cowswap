import { TelegramConnectionStatus } from './index'

const noop = (): void => {}
const asyncNoop = async (): Promise<void> => {}

const Fixtures = {
  loading: () => (
    <TelegramConnectionStatus
      isLoading={true}
      isSubscribed={false}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  subscribed: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={true}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  notConnected: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  waitingForStart: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="connecting"
      deepLink="https://t.me/cowNotificationsBot?start=preview-token"
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  linkExpired: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="expired"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
}

export default Fixtures
