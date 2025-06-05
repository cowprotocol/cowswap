import { useEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import useIsAnySwapAffectedUser from './useIsAnySwapAffectedUser'

const WARNING_PAGE = '/anyswap-affected-users'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function RedirectAnySwapAffectedUsers() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Detect if the user is affected by the hack
  const isAnySwapAffectedUser = useIsAnySwapAffectedUser()

  useEffect(() => {
    if (isAnySwapAffectedUser && location.pathname !== WARNING_PAGE) {
      // Redirect to warning page
      navigate(WARNING_PAGE)
    }
  }, [isAnySwapAffectedUser, navigate, pathname])

  return null
}
