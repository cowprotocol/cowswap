import { useLocation } from 'react-router-dom'

export const useIsLimitOrderMode = (): boolean => {
  const location = useLocation()
  const isLimitOrderMode = location.pathname.includes('/limit/')

  return isLimitOrderMode
}
