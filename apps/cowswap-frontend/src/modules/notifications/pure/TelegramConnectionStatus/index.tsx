import { ReactNode, useCallback, useState } from 'react'

import { Loader, UI } from '@cowprotocol/ui'

import { Toggle } from 'legacy/components/Toggle'

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

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

  const isToggleActive = !needsAuthorization && isSubscribed

  return (
    <div>
      <Toggle
        id="toggle-telegram-notifications"
        isActive={isToggleActive}
        toggle={handleToggle}
        inactiveBgColor={`var(${UI.COLOR_PAPER})`}
      />
    </div>
  )
}
