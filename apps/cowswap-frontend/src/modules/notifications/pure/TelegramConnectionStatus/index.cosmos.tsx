import { TelegramConnectionStatus } from './index'

const subscribeAccount = (): void => {}
const authorize = (): Promise<void> => Promise.resolve()

const Fixtures = {
  loading: () => (
    <TelegramConnectionStatus
      isLoading={true}
      isSubscribed={false}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
    />
  ),
  subscribed: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={true}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
    />
  ),
  needLogin: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
    />
  ),
  needsAuthorization: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      needsAuthorization={true}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
    />
  ),
}

export default Fixtures
