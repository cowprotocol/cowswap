import { ProfileData } from './api'

export async function getProfileData(): Promise<ProfileData | null> {
  console.log('[utils:operatorMock] Get profile data')
  return {
    lastUpdated: new Date(2021, 9, 4, 7).toUTCString(),
    referralVolumeUsd: 250_000,
    totalReferrals: 45,
    totalTrades: 542,
    tradeVolumeUsd: 1_250_300,
  }
}
