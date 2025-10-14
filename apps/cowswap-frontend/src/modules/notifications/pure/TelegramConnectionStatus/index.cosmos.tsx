import { TelegramConnectionStatus } from './index'

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

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
