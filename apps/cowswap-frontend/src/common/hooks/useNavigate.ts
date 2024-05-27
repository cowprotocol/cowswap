import { useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

// eslint-disable-next-line no-restricted-imports
import { NavigateOptions, To, useNavigate as useNavigateOriginal } from 'react-router-dom'

export type NavigateFunction = (to: To, options?: NavigateOptions) => void

export function useNavigate(): NavigateFunction {
  const isWidget = isInjectedWidget()
  const navigate = useNavigateOriginal()

  return useCallback<NavigateFunction>(
    (to, options) => {
      navigate(to, {
        replace: isWidget,
        ...options,
      })
    },
    [navigate, isWidget]
  )
}
