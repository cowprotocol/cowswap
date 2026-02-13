import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { CowEventListener, CowWidgetEventPayloadMap, CowWidgetEvents } from '@cowprotocol/events'

import ms from 'ms.macro'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { surplusInvalidationTriggerAtom, totalSurplusAtom } from './atoms'
import { TotalSurplusState } from './types'

const DEBOUNCE_FOR_SURPLUS_INVALIDATION_MS = ms`1s`

type OrderFilledListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents.ON_FULFILLED_ORDER>

/**
 * Hook that sets up a global event listener to increment the surplus invalidation trigger
 * Should be called from a component that's always mounted (like root updaters)
 * to ensure events are captured even when the surplus UI is not visible
 */
export function useSurplusInvalidationListener(): void {
  const setTriggerValue = useSetAtom(surplusInvalidationTriggerAtom)

  useEffect(() => {
    const incrementTrigger = (): void => {
      setTriggerValue((prev) => prev + 1)
    }

    const onFulfilledListener: OrderFilledListener = {
      event: CowWidgetEvents.ON_FULFILLED_ORDER,
      handler: incrementTrigger,
    }

    WIDGET_EVENT_EMITTER.on(onFulfilledListener)

    return (): void => {
      WIDGET_EVENT_EMITTER.off(onFulfilledListener)
    }
  }, [setTriggerValue])
}

/**
 * Hook that reads the current surplus invalidation trigger value
 * Can be called from any component, even if unmounted/remounted
 * The trigger value persists in Jotai state across component lifecycles
 */
export function useSurplusInvalidationTrigger(): number {
  const triggerValue = useAtomValue(surplusInvalidationTriggerAtom)
  return useDebounce(triggerValue, DEBOUNCE_FOR_SURPLUS_INVALIDATION_MS)
}

export function useTotalSurplus(): TotalSurplusState {
  return useAtomValue(totalSurplusAtom)
}
