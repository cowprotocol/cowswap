import { i18n } from '@lingui/core'

export type AffiliateProgramParams = {
  traderRewardAmount: number
  triggerVolumeUsd: number
  timeCapDays: number
  volumeCapUsd: number
  notes?: string | null
}

export function getAffiliateProgramCopyValues(params: AffiliateProgramParams): {
  rewardAmount: string
  rewardCurrency: string
  triggerVolume: string
  timeCapDays: number
} {
  return {
    rewardAmount: formatInteger(params.traderRewardAmount),
    rewardCurrency: 'USDC',
    triggerVolume: formatInteger(params.triggerVolumeUsd),
    timeCapDays: params.timeCapDays,
  }
}

function formatInteger(value: number): string {
  return value.toLocaleString(i18n.locale, { maximumFractionDigits: 0 })
}
