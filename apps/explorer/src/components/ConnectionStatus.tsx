import React, { useCallback, useEffect, useState } from 'react'
import { Notification } from './Notification'

export const ConnectionStatus: React.FC = () => {
  const [online, setOnline] = useState(true)

  const handleConnectionChange = useCallback((e: Event) => {
    setOnline(e.type === 'online')
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    return (): void => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
    }
  }, [handleConnectionChange])

  return online ? null : (
    <Notification type="warn" message="You may have lost your network connection." appendMessage={false} />
  )
}
