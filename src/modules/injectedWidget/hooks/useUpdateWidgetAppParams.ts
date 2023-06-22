import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { InjectedWidgetParams, injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

const COW_SWAP_WIDGET_APP_UPDATE_KEY = 'cowSwapWidgetAppUpdate'

export function useUpdateWidgetAppParams() {
  const updateParams = useUpdateAtom(injectedWidgetParamsAtom)

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.key !== COW_SWAP_WIDGET_APP_UPDATE_KEY) return

      const appParams = event.data.params as InjectedWidgetParams

      updateParams(appParams)
    })
  }, [updateParams])
}
