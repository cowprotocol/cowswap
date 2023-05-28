import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import useIsAnySwapAffectedUser from './useIsAnySwapAffectedUser'

const WARNING_PAGE = '/anyswap-affected-users'

export default function RedirectAnySwapAffectedUsers() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Detect if the user is affected by the hack
  const isAnySwapAffectedUser = useIsAnySwapAffectedUser()

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (isAnySwapAffectedUser && location.pathname !== WARNING_PAGE) {
      // Redirect to warning page
      navigate(WARNING_PAGE)
    }
  }, [isAnySwapAffectedUser, navigate, pathname])

  return null
}
