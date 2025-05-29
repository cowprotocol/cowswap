import { UI } from '@cowprotocol/ui'

/**
 * Possible statuses for bridge/swap stops
 */
export enum StopStatusEnum {
  DEFAULT = 'default',
  DONE = 'done',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUND_COMPLETE = 'refund_complete',
}

export enum StatusColor {
  SUCCESS = `var(${UI.COLOR_SUCCESS})`,
  PENDING = `var(${UI.COLOR_TEXT})`,
  DANGER = `var(${UI.COLOR_DANGER})`,
  ALERT = `var(${UI.COLOR_ALERT})`,
}
