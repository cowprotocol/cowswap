// Dev-mode helpers for Telegram auth/subscription flows

export const TG_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.REACT_APP_TG_DEV_BYPASS === 'true'

// Telegram data shape used across hooks
export interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

export const MOCK_TELEGRAM_DATA: TelegramData = {
  auth_date: Math.floor(Date.now() / 1000),
  first_name: 'Dev',
  hash: 'mock-hash-dev-mode',
  id: 12345,
  photo_url: '',
  username: 'devuser',
}

// Dev auth state (not account-specific)
const DEV_AUTH_KEY = 'tgDevAuthState:v0'
export const clearDevAuthState = (): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.removeItem(DEV_AUTH_KEY)
}
export const hasDevAuthState = (): boolean => {
  if (!TG_DEV_BYPASS) return false
  return sessionStorage.getItem(DEV_AUTH_KEY) === 'true'
}
export const setDevAuthState = (): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.setItem(DEV_AUTH_KEY, 'true')
}

// Dev subscription state (account-specific)
const getDevSubscriptionKey = (account: string): string => `tgDevSubscriptionState:${account}:v0`

export const getDevSubscriptionState = (account?: string): boolean => {
  if (!TG_DEV_BYPASS || !account) return false
  return sessionStorage.getItem(getDevSubscriptionKey(account)) === 'true'
}

export const setDevSubscriptionState = (account: string, subscribed: boolean): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.setItem(getDevSubscriptionKey(account), String(subscribed))
}

export const simulateDevModeApiCall = (
  method: string,
  setIsCmsCallInProgress: (loading: boolean) => void,
  account: string,
): Promise<{ data: boolean }> => {
  setIsCmsCallInProgress(true)
  return new Promise((resolve) => {
    setTimeout(() => {
      setIsCmsCallInProgress(false)

      if (method.includes('check')) {
        const currentState = getDevSubscriptionState(account)
        resolve({ data: currentState })
      } else if (method.includes('add')) {
        setDevSubscriptionState(account, true)
        resolve({ data: true })
      } else if (method.includes('remove')) {
        setDevSubscriptionState(account, false)
        resolve({ data: true })
      } else {
        resolve({ data: true })
      }
    }, 300)
  })
}
