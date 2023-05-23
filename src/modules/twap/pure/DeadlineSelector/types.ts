import { Milliseconds } from 'types'

export type CustomDeadline = {
  hours: number
  minutes: number
}

export type DeadlinePayload = {
  isCustomDeadline: boolean
  customDeadline?: CustomDeadline
  deadline?: Milliseconds
}
