import { TelegramConnectionStatus } from './index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
