import { useLocation } from 'react-router-dom'

export const useIsAdvancedMode = (): boolean => {
  const location = useLocation()
  const isAdvancedMode = location.pathname.includes('/advanced/')

  return isAdvancedMode
}
