import { useLocation } from 'react-router-dom'

export const useIsSwapMode = (): boolean => {
  const location = useLocation()
  const isSwapMode = location.pathname.includes('/swap/')

  return isSwapMode
}
