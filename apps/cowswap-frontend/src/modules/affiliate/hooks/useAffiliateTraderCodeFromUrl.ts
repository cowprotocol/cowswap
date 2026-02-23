import { type Dispatch, useEffect, type SetStateAction } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { formatRefCode } from '../lib/affiliateProgramUtils'

interface UseAffiliateTraderCodeFromUrlParams {
  savedCode?: string
  setError: Dispatch<SetStateAction<string | undefined>>
  setCodeInput(value: string): void
}

export function useAffiliateTraderCodeFromUrl({
  savedCode,
  setError,
  setCodeInput,
}: UseAffiliateTraderCodeFromUrlParams): void {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const refCodeParam = searchParams.get('ref')
    const refCodeFromUrl = formatRefCode(refCodeParam)

    setCodeInput(refCodeFromUrl ?? savedCode ?? '')
    setError(undefined)

    if (!refCodeParam || !refCodeFromUrl) {
      return
    }

    searchParams.delete('ref')
    const nextSearch = searchParams.toString()

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
        hash: location.hash,
      },
      { replace: true },
    )
  }, [location.hash, location.pathname, location.search, navigate, savedCode, setCodeInput, setError])
}
