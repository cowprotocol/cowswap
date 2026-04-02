import { useWalletSessionDuration } from 'common/hooks/useWalletSessionDuration'

export function WalletSessionDurationUpdater(): null {
  useWalletSessionDuration()
  return null
}
