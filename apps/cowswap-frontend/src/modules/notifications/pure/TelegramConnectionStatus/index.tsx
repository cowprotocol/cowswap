import { ReactNode, useCallback, useState } from 'react'

import { Loader, UI, Toggle } from '@cowprotocol/ui'

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  needsAuthorization: boolean
  toggleSubscription(): void
  subscribeWithData(data: TelegramData): Promise<void>
  authorize(): Promise<TelegramData | null>
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  needsAuthorization,
  authorize,
  toggleSubscription,
  subscribeWithData,
}: TelegramConnectionStatusProps): ReactNode {
  const [isAuthorizingInProgress, setIsAuthorizingInProgress] = useState(false)

  const handleToggle = useCallback(async () => {
    if (needsAuthorization) {
      // If not authorized, trigger authorization when toggled ON
      setIsAuthorizingInProgress(true)
      try {
        const authData = await authorize()
        if (authData) {
          // Pass the auth data directly to avoid race condition
          await subscribeWithData(authData)
        }
      } catch (error) {
        // If authorization fails, the toggle will revert to OFF automatically
        console.warn('Telegram authorization failed or was cancelled:', error)
      } finally {
        setIsAuthorizingInProgress(false)
      }
    } else {
      // If already authorized, handle normal subscription toggle
      toggleSubscription()
    }
  }, [needsAuthorization, authorize, toggleSubscription, subscribeWithData])

  if (isLoading || isAuthorizingInProgress) {
    return <Loader size="33px" stroke={`var(${UI.COLOR_TEXT_OPACITY_50})`} />
  }

  const checked = !needsAuthorization && isSubscribed

  return (
    <div>
      <Toggle
        root="label"
        id="toggle-telegram-notifications"
        checked={checked}
        toggle={handleToggle}
        inactiveBgColor={`var(${UI.COLOR_PAPER})`}
      />
    </div>
  )
}
