import { useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

const COW_SWAP_WIDGET_KEY = 'cowSwapWidget'

export function useUpdateWidgetUrl() {
  const navigate = useNavigate()

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data.key !== COW_SWAP_WIDGET_KEY) return

      const { pathname, search } = event.data

      navigate({ pathname, search })
    })
  }, [navigate])
}
