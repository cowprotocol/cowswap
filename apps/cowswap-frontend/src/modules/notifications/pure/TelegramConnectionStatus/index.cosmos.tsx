import { TelegramConnectionStatus } from './index'

const subscribeAccount = (): void => {}
const subscribeWithData = async (_data: TelegramData): Promise<void> => {}
const authorize = (): Promise<TelegramData | null> => Promise.resolve(null)

const Fixtures = {
  loading: () => (
    <TelegramConnectionStatus
      isLoading={true}
      isSubscribed={false}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
      subscribeWithData={subscribeWithData}
    />
  ),
  subscribed: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={true}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
      subscribeWithData={subscribeWithData}
    />
  ),
  needLogin: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      needsAuthorization={false}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
      subscribeWithData={subscribeWithData}
    />
  ),
  needsAuthorization: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      needsAuthorization={true}
      authorize={authorize}
      toggleSubscription={subscribeAccount}
      subscribeWithData={subscribeWithData}
    />
  ),
}

export default Fixtures
