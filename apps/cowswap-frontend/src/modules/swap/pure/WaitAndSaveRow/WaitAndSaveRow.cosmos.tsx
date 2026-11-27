import { ReactNode, useEffect, useRef, useState } from 'react'

import { DemoContainer } from 'cosmos.decorator'

import { WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT } from './waitAndSaveRow.constants'
import { WaitAndSaveRow } from './WaitAndSaveRow.pure'

function RowFixture({
  approximateLabel = '~7 min',
  hasError = false,
  initiallyEnabled = false,
  isFetching = false,
  isLoading = false,
  liveLabel = '6m 42s',
  saveAmount,
}: {
  approximateLabel?: string
  hasError?: boolean
  initiallyEnabled?: boolean
  isFetching?: boolean
  isLoading?: boolean
  liveLabel?: string
  saveAmount?: string
}): ReactNode {
  const [isEnabled, setEnabled] = useState(initiallyEnabled)
  const joinsBatchInRef = useRef<HTMLElement | null>(null)
  const countdownLabel = isEnabled ? liveLabel : approximateLabel

  useEffect(() => {
    if (joinsBatchInRef.current) {
      joinsBatchInRef.current.textContent = countdownLabel
    }
  }, [countdownLabel])

  return (
    <DemoContainer>
      <div style={{ maxWidth: 480 }}>
        <WaitAndSaveRow
          isEnabled={isEnabled}
          toggle={() => setEnabled((value) => !value)}
          joinsBatchInRef={joinsBatchInRef}
          hasError={hasError}
          isFetching={isFetching}
          isLoading={isLoading}
          onRetry={() => undefined}
          saveAmount={saveAmount}
        />
      </div>
    </DemoContainer>
  )
}

const Fixtures = {
  withSaveAmount: <RowFixture saveAmount={WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT} />,
  withSaveAmountEnabled: <RowFixture initiallyEnabled saveAmount={WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT} />,
  withoutSaveAmount: <RowFixture />,
  withoutSaveAmountEnabled: <RowFixture initiallyEnabled />,
  lastMinuteApproximate: <RowFixture approximateLabel="45s" saveAmount={WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT} />,
  lastMinuteLive: <RowFixture initiallyEnabled liveLabel="42s" saveAmount={WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT} />,
  scheduleError: <RowFixture hasError />,
  scheduleLoading: <RowFixture isLoading saveAmount={WAIT_AND_SAVE_DEMO_SAVE_AMOUNT_FIAT} />,
  scheduleFetching: <RowFixture hasError isFetching />,
}

export default Fixtures
