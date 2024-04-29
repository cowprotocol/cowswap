import { useEffect, useState } from 'react'

import { HistogramData, UTCTimestamp } from 'lightweight-charts'

import { VolumeDataResponse } from './VolumeChart'
import { VolumePeriod } from './VolumeChartWidget'

import { subgraphApiSDK } from '../../../../cowSdk'
import { useNetworkId } from '../../../../state/network'
import { Network } from '../../../../types'


type RawVolumeItem = {
  timestamp: number
  volumeUsd: string
}

export function useGetVolumeData(volumeTimePeriod = VolumePeriod.DAILY): VolumeDataResponse | undefined {
  const [volumeData, setVolumeDataJson] = useState<VolumeDataResponse | undefined>()
  const network = useNetworkId() ?? Network.MAINNET

  useEffect(() => {
    setVolumeDataJson((prevState) => {
      return { ...prevState, isLoading: true }
    })

    let rawData: Promise<RawVolumeItem[]>
    if (volumeTimePeriod === VolumePeriod.DAILY) {
      rawData = getLastHoursData(network)
    } else {
      rawData = getLastDaysData(volumeTimePeriod, network)
    }

    rawData.then((data: RawVolumeItem[]) => {
      const volumeData = buildVolumeData(data, volumeTimePeriod)
      volumeData.data.sort((a, b) => (a.time < b.time ? -1 : 1))
      setVolumeDataJson({ ...volumeData, isLoading: false })
    })
  }, [network, volumeTimePeriod])

  return volumeData
}

async function getLastHoursData(network: Network): Promise<RawVolumeItem[]> {
  const data = await subgraphApiSDK.getLastHoursVolume(48, { chainId: network })

  return (data?.hourlyTotals as RawVolumeItem[]) || []
}

async function getLastDaysData(
  period: VolumePeriod.WEEKLY | VolumePeriod.MONTHLY | VolumePeriod.YEARLY,
  network: Network
): Promise<RawVolumeItem[]> {
  const days = {
    [VolumePeriod.WEEKLY]: 7 * 2,
    [VolumePeriod.MONTHLY]: 30 * 2,
    [VolumePeriod.YEARLY]: 365 * 2,
  }
  const data = await subgraphApiSDK.getLastDaysVolume(days[period], { chainId: network })

  return (data?.dailyTotals as RawVolumeItem[]) || []
}

export function buildVolumeData(
  _data: RawVolumeItem[],
  volumePeriod: VolumePeriod
): {
  data: HistogramData[]
  currentVolume: number
  changedVolume: number
} {
  const periods = {
    [VolumePeriod.DAILY]: 24,
    [VolumePeriod.WEEKLY]: 7,
    [VolumePeriod.MONTHLY]: 30,
    [VolumePeriod.YEARLY]: 365,
  }
  const currentPeriodData = _data.slice(0, periods[volumePeriod])
  const previousPeriodData = _data.slice(periods[volumePeriod], periods[volumePeriod] * 2)

  return {
    data: currentPeriodData.map((item) => ({
      time: Number(item.timestamp) as UTCTimestamp,
      value: Number(item.volumeUsd),
    })),
    currentVolume: getAccumulatedVolume(currentPeriodData),
    changedVolume: getAccumulatedVolume(previousPeriodData),
  }
}

function getAccumulatedVolume(data: RawVolumeItem[]): number {
  return data.reduce((acc, item) => acc + Number(item.volumeUsd), 0)
}
