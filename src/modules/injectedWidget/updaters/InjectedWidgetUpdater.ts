import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

export function InjectedWidgetUpdater() {
  const updateParams = useUpdateAtom(injectedWidgetParamsAtom)
  const navigate = useNavigate()

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const method = event.data.method

      if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || !method) return

      if (method === 'update') {
        updateParams(event.data.appParams)
        navigate(event.data.urlParams)
      }
    })
  }, [navigate, updateParams])

  return null
}
