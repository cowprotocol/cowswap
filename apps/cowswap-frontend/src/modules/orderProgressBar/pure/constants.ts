import { UI } from '@cowprotocol/ui'

import { OrderProgressBarProps } from '../types'

export type BgColorMap = Record<NonNullable<StepName>, string | undefined>
export type StepName = OrderProgressBarProps['stepName']
export type PaddingMap = Record<NonNullable<StepName>, string | undefined>
export type GapMap = Record<NonNullable<StepName>, string | undefined>

export const PROCESS_IMAGE_WRAPPER_BG_COLOR: BgColorMap = {
  initial: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  unfillable: '#FFDB9C',
  delayed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  submissionFailed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  solved: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  solving: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  finished: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  cancellationFailed: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  executing: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
  cancelling: '#f0dede',
  cancelled: '#f0dede',
  expired: `var(${UI.COLOR_ALERT_BG})`,
  bridgingFinished: undefined,
  bridgingFailed: undefined,
  bridgingInProgress: undefined,
  refundCompleted: undefined,
}
