import { ReactNode, useCallback, useState } from 'react'

import { Loader, UI } from '@cowprotocol/ui'

import { Toggle } from 'legacy/components/Toggle'

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  needsAuthorization: boolean
  toggleSubscription(): void
  authorize(): Promise<void>
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  needsAuthorization,
  authorize,
  toggleSubscription,
}: TelegramConnectionStatusProps): ReactNode {
  const [isAuthorizingInProgress, setIsAuthorizingInProgress] = useState(false)

  const handleToggle = useCallback(async () => {
    if (needsAuthorization) {
      // If not authorized, trigger authorization when toggled ON
      setIsAuthorizingInProgress(true)
      try {
        await authorize()
        // If successful, the toggle will stay ON due to subscription state update
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
  }, [needsAuthorization, authorize, toggleSubscription])

  if (isLoading || isAuthorizingInProgress) {
    return <Loader />
  }

  // Always show toggle - when needsAuthorization=true, isSubscribed will be false
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
