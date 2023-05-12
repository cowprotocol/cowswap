import { Milliseconds } from '@cow/types'

export type CustomDeadline = {
  hours: number | null
  minutes: number | null
}

export type DeadlinePayload = {
  isCustomDeadline: boolean
  customDeadline?: CustomDeadline
  deadline?: Milliseconds
}
