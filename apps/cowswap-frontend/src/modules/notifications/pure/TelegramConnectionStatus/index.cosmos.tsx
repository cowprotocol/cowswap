import { TelegramConnectionStatus } from './index'

const authenticate = () => {}

const Fixtures = {
  loading: <TelegramConnectionStatus isLoading={true} isSubscribed={false} authenticate={authenticate} />,
  subscribed: <TelegramConnectionStatus isLoading={false} isSubscribed={true} authenticate={authenticate} />,
  needLogin: <TelegramConnectionStatus isLoading={false} isSubscribed={false} authenticate={authenticate} />,
}

export default Fixtures
