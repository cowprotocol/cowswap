import { useEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { formatRefCode } from '../lib/affiliateProgramUtils'

export function useAffiliateTraderCodeFromUrl(onRecoveredFromUrl: (code: string) => void): void {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const routerSearchParams = new URLSearchParams(location.search || '')
    const windowSearchParams = new URLSearchParams(window.location.search || '')
    const windowRefCodeParam = windowSearchParams.get('ref')
    const routerRefCodeParam = routerSearchParams.get('ref')

    if (windowRefCodeParam) {
      const refCodeFromUrl = formatRefCode(windowRefCodeParam)
      if (refCodeFromUrl) onRecoveredFromUrl(refCodeFromUrl)

      windowSearchParams.delete('ref')
      const nextWindowSearch = windowSearchParams.toString()
      const nextUrl = `${window.location.pathname}${nextWindowSearch ? `?${nextWindowSearch}` : ''}${window.location.hash}`

      window.history.replaceState(window.history.state, '', nextUrl)
    } else if (routerRefCodeParam) {
      const refCodeFromUrl = formatRefCode(routerRefCodeParam)
      if (refCodeFromUrl) onRecoveredFromUrl(refCodeFromUrl)

      routerSearchParams.delete('ref')
      const nextSearch = routerSearchParams.toString()

      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
          hash: location.hash,
        },
        { replace: true },
      )
    }
  }, [location.hash, location.pathname, location.search, navigate, onRecoveredFromUrl])
}
