import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useRef } from 'react'

import { useNavigate } from 'react-router-dom'

import { deepEqual } from 'utils/deepEqual'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

const COW_SWAP_WIDGET_EVENT_KEY = 'cowSwapWidget'

export function InjectedWidgetUpdater() {
  const updateParams = useUpdateAtom(injectedWidgetParamsAtom)
  const navigate = useNavigate()
  const prevData = useRef(null)

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const method = event.data.method

      if (event.data.key !== COW_SWAP_WIDGET_EVENT_KEY || !method) return

      if (method === 'update') {
        if (prevData.current && deepEqual(prevData.current, event.data)) return

        prevData.current = event.data
        updateParams(event.data.appParams)
        navigate(event.data.urlParams)
      }
    })
  }, [navigate, updateParams])

  return null
}
