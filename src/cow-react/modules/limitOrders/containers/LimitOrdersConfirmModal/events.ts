import { EventBus } from '@cow/common/services/EventBus'

export enum ConfirmEvent {
  OPEN,
  CLOSE,
}

export interface ConfirmEvents {
  [ConfirmEvent.OPEN]: null
  [ConfirmEvent.CLOSE]: null
}

const confirmEventBus = new EventBus<ConfirmEvents>()

export const confirmDispatch = confirmEventBus.dispatch.bind(confirmEventBus)

export const confirmSubscribe = confirmEventBus.subscribe.bind(confirmEventBus)
