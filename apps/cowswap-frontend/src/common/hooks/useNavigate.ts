import { useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { NavigateOptions, To, useNavigate as useNavigateOriginal } from 'react-router'

export type NavigateFunction = (to: To, options?: NavigateOptions) => void | Promise<void>

export function useNavigate(): NavigateFunction {
  const isWidget = isInjectedWidget()
  const navigate = useNavigateOriginal()

  return useCallback<NavigateFunction>(
    (to, options) => {
      return navigate(to, {
        replace: isWidget,
        ...options,
      })
    },
    [navigate, isWidget],
  )
}

export function useNavigateBack(): () => void {
  const navigate = useNavigateOriginal()

  return useCallback(() => {
    navigate(-1)
  }, [navigate])
}
