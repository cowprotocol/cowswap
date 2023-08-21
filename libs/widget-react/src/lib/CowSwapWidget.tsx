import { useEffect, useRef } from 'react'

import {
  cowSwapWidget,
  CowSwapWidgetParams as CowSwapWidgetParamsAux,
  CowSwapWidgetSettings,
} from '@cowswap/widget-lib'

export type CowSwapWidgetParams = Omit<CowSwapWidgetParamsAux, 'container'>
export interface CowSwapWidgetProps {
  params: CowSwapWidgetParams
  settings: CowSwapWidgetSettings
}

export function CowSwapWidget(props: CowSwapWidgetProps) {
  const cowWidgetRef = useRef(null)

  useEffect(() => {
    if (cowWidgetRef.current) {
      const { params, settings } = props

      cowSwapWidget(
        {
          ...params,
          container: cowWidgetRef.current,
        },
        settings
      )
    }
  }, [cowWidgetRef, props])

  return <div ref={cowWidgetRef}></div>
}
