import { TelegramConnectionStatus } from './index'

const noop = (): void => {}
const asyncNoop = async (): Promise<void> => {}

const Fixtures = {
  loading: () => (
    <TelegramConnectionStatus
      isLoading={true}
      isSubscribed={false}
      botDeepLink={undefined}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
    />
  ),
  subscribed: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={true}
      botDeepLink="https://t.me/cowNotificationsBot"
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
    />
  ),
  notConnected: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      botDeepLink={undefined}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
    />
  ),
  waitingForStart: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      botDeepLink={undefined}
      connectState="connecting"
      deepLink="https://t.me/cowNotificationsBot?start=preview-token"
      connect={asyncNoop}
      cancelConnect={noop}
    />
  ),
  linkExpired: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      botDeepLink={undefined}
      connectState="expired"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
    />
  ),
}

export default Fixtures
