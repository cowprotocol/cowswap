import { CowWidgetEventPayloadMap, CowWidgetEvents } from './events'

import { CowEventListener } from '../CowEventEmitter'

export type CowWidgetEventListener = CowEventListener<CowWidgetEventPayloadMap, CowWidgetEvents>
export type CowWidgetEventListeners = CowWidgetEventListener[]
