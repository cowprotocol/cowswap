import { Milliseconds } from '@cow/types'

export type CustomDeadline = {
  hours: number
  minutes: number
}

export type DeadlinePayload = {
  isCustomDeadline: boolean
  customDeadline?: CustomDeadline
  deadline?: Milliseconds
}
