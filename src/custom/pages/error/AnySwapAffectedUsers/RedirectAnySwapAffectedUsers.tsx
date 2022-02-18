import { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import useIsAnySwapAffectedUser from './useIsAnySwapAffectedUser'

const WARNING_PAGE = '/anyswap-affected-users'

export default function RedirectAnySwapAffectedUsers() {
  const history = useHistory()
  const { pathname } = useLocation()

  // Detect if the user is affected by the hack
  const isAnySwapAffectedUser = useIsAnySwapAffectedUser()

  useEffect(() => {
    if (isAnySwapAffectedUser && location.pathname !== WARNING_PAGE) {
      // Redirect to warning page
      history.push(WARNING_PAGE)
    }
  }, [isAnySwapAffectedUser, history, pathname])

  return null
}
