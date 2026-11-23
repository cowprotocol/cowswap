import { ReactNode, RefObject, useState } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

import * as styledEl from './WaitAndSaveRow.styled'

export interface WaitAndSaveRowProps {
  isEnabled: boolean
  toggle: () => void
  joinsBatchInRef: RefObject<HTMLElement | null>
  isScheduleError: boolean
  isScheduleLoading: boolean
  isScheduleFetching: boolean
  onRetry: () => void
}

export function WaitAndSaveRow({
  isEnabled,
  toggle,
  joinsBatchInRef,
  isScheduleError,
  isScheduleLoading,
  isScheduleFetching,
  onRetry,
}: WaitAndSaveRowProps): ReactNode {
  const { t } = useLingui()
  const [starSpinKey, setStarSpinKey] = useState(0)
  const isRetrying = isScheduleError && isScheduleFetching

  const handleToggle = (): void => {
    if (!isEnabled) {
      setStarSpinKey((key) => key + 1)
    }
    toggle()
  }

  return (
    <styledEl.Wrapper $hasError={isScheduleError}>
      <styledEl.Content>
        <styledEl.Icon key={starSpinKey} $animate={starSpinKey > 0} aria-hidden>
          <SVG src={svgStarShineSrc} />
        </styledEl.Icon>
        <styledEl.TextColumn>
          <styledEl.TitleRow>
            <Trans>Wait & save</Trans>
            <TooltipIcon
              type="info"
              title={t`Wait & save`}
              content={
                <Trans>
                  Join the next batch to save on volume fees and potentially get a better price. Prices may change, and
                  the countdown isn’t a guaranteed fill time. Price-improvement fees still apply.
                </Trans>
              }
            />
          </styledEl.TitleRow>
          <styledEl.DescriptionRow>
            {isScheduleError ? (
              <styledEl.ErrorColumn>
                <styledEl.ScheduleError>
                  <Trans>Couldn’t load the next batch time</Trans>
                </styledEl.ScheduleError>
                {isRetrying ? (
                  <styledEl.FetchingBatchTime>
                    <Trans>Fetching batch time</Trans>
                    <ThreeDots />
                  </styledEl.FetchingBatchTime>
                ) : (
                  <styledEl.RetryButton type="button" onClick={onRetry}>
                    <Trans>Try again</Trans>
                  </styledEl.RetryButton>
                )}
              </styledEl.ErrorColumn>
            ) : (
              <>
                <styledEl.SaveAmount>
                  <Trans>Save $2.50</Trans>
                </styledEl.SaveAmount>
                <styledEl.NextBatch>
                  {isScheduleLoading ? (
                    <Trans>
                      · Joins batch in <styledEl.BatchTimeSkeleton aria-hidden />
                    </Trans>
                  ) : (
                    <Trans>
                      · Joins batch in <span ref={joinsBatchInRef} />
                    </Trans>
                  )}
                </styledEl.NextBatch>
              </>
            )}
          </styledEl.DescriptionRow>
        </styledEl.TextColumn>
      </styledEl.Content>
      {isScheduleError ? null : (
        <styledEl.WaitAndSaveToggle
          id="wait-and-save-toggle"
          checked={isEnabled}
          toggle={handleToggle}
          variant="success"
          aria-label={t`Wait & save`}
        />
      )}
    </styledEl.Wrapper>
  )
}
