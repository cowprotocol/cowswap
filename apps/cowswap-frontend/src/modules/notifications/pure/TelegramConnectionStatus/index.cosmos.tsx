import { TelegramConnectionStatus } from './index'

const subscribeAccount = () => {}

const Fixtures = {
  loading: () => <TelegramConnectionStatus isLoading={true} isSubscribed={false} subscribeAccount={subscribeAccount} />,
  subscribed: () => (
    <TelegramConnectionStatus isLoading={false} isSubscribed={true} subscribeAccount={subscribeAccount} />
  ),
  needLogin: () => (
    <TelegramConnectionStatus isLoading={false} isSubscribed={false} subscribeAccount={subscribeAccount} />
  ),
}

export default Fixtures
