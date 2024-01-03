import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { useGetVolumeData } from './useGetVolumeData'

import { PeriodButton, VolumeChart } from './VolumeChart'

const WrapperVolumeChart = styled.div`
  height: 21.4rem;
`
export enum VolumePeriod {
  DAILY = '1D',
  WEEKLY = '1W',
  MONTHLY = '1M',
  YEARLY = '1Y',
}

export const volumePeriodTitle = new Map(
  (Object.keys(VolumePeriod) as (keyof typeof VolumePeriod)[]).map((key) => [
    VolumePeriod[key],
    key.toLocaleLowerCase(),
  ]),
)

/* A lightweight-charts logical range is an object with: 'from' and 'to', which are numbers and represent
 * logical indexes on the thweight-charts time scale.
 */
const logicalTimeRange = {
  [VolumePeriod.WEEKLY]: { from: 3.4, to: 9 }, // by the 7 points
}

export function VolumeChartWidget(): JSX.Element {
  const [periodSelected, setVolumeTimePeriod] = useState(VolumePeriod.DAILY)
  const volumeData = useGetVolumeData(periodSelected)
  const containerRef = useRef<HTMLDivElement>(null)

  // update the width on a window resize
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(containerRef.current?.getBoundingClientRect().width)
  React.useLayoutEffect(() => {
    if (!isClient || containerRef.current === null) return

    function updatePosition(): void {
      setWidth(containerRef.current?.getBoundingClientRect().width)
    }
    window.addEventListener('resize', updatePosition)
    updatePosition()

    return (): void => window.removeEventListener('resize', updatePosition)
  }, [isClient, width])

  return (
    <WrapperVolumeChart ref={containerRef}>
      <VolumeChart
        volumeData={volumeData}
        width={width}
        period={periodSelected}
        logicalTimeScaleRange={logicalTimeRange[periodSelected]}
      >
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.DAILY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.DAILY)}
        >
          {VolumePeriod.DAILY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.WEEKLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.WEEKLY)}
        >
          {VolumePeriod.WEEKLY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.MONTHLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.MONTHLY)}
        >
          {VolumePeriod.MONTHLY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.YEARLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.YEARLY)}
        >
          {VolumePeriod.YEARLY}
        </PeriodButton>
      </VolumeChart>
    </WrapperVolumeChart>
  )
}
