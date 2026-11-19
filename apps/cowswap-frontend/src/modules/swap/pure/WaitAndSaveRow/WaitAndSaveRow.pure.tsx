import { ReactNode, RefObject, useState } from 'react'

import svgStarShineSrc from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { TooltipIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WaitAndSaveRow.styled'
import { WaitAndSaveTooltipContent } from './WaitAndSaveTooltipContent.pure'

export interface WaitAndSaveRowProps {
  isEnabled: boolean
  toggle: () => void
  joinsBatchInRef: RefObject<HTMLElement | null>
  hasError: boolean
  onRetry: () => void
  saveAmount?: string
}

export function WaitAndSaveRow({
  isEnabled,
  toggle,
  joinsBatchInRef,
  hasError,
  onRetry,
  saveAmount,
}: WaitAndSaveRowProps): ReactNode {
  const { t } = useLingui()
  const [starSpinKey, setStarSpinKey] = useState(0)

  const handleToggle = (): void => {
    if (!isEnabled) {
      setStarSpinKey((key) => key + 1)
    }
    toggle()
  }

  return (
    <styledEl.Wrapper $hasError={hasError}>
      <styledEl.Content>
        <styledEl.Icon key={starSpinKey} $animate={starSpinKey > 0} aria-hidden>
          <SVG src={svgStarShineSrc} />
        </styledEl.Icon>

        <styledEl.TextColumn>
          <WaitAndSaveTitle hasError={hasError} saveAmount={saveAmount} />
          <WaitAndSaveDescription
            hasError={hasError}
            isEnabled={isEnabled}
            joinsBatchInRef={joinsBatchInRef}
            onRetry={onRetry}
            saveAmount={saveAmount}
          />
        </styledEl.TextColumn>
      </styledEl.Content>

      {hasError ? null : (
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

function WaitAndSaveDescription({
  hasError,
  isEnabled,
  joinsBatchInRef,
  onRetry,
  saveAmount,
}: {
  hasError: boolean
  isEnabled: boolean
  joinsBatchInRef: RefObject<HTMLElement | null>
  onRetry: () => void
  saveAmount?: string
}): ReactNode {
  const joinsBatchGap = isEnabled ? ' ' : ' ~'

  return (
    <styledEl.DescriptionRow>
      {hasError ? (
        <styledEl.ScheduleError>
          <Trans>
            Couldn’t load the next batch{' '}
            <span className="noBreak">
              time ·{' '}
              <styledEl.RetryButton type="button" onClick={onRetry}>
                Try again
              </styledEl.RetryButton>
            </span>
          </Trans>
        </styledEl.ScheduleError>
      ) : (
        <styledEl.NextBatch>
          {saveAmount ? (
            <>
              <styledEl.NoVolumeFee $active={isEnabled}>
                <Trans>No volume</Trans>{' '}
              </styledEl.NoVolumeFee>
              <span className="noBreak">
                <styledEl.NoVolumeFee $active={isEnabled}>
                  <Trans>fee</Trans>
                </styledEl.NoVolumeFee>
                {' · '}
                <Trans>Joins</Trans>
              </span>{' '}
              <Trans>
                batch in{joinsBatchGap}
                <span ref={joinsBatchInRef} />
              </Trans>
            </>
          ) : (
            <Trans>
              Joins batch in{joinsBatchGap}
              <span ref={joinsBatchInRef} />
            </Trans>
          )}
        </styledEl.NextBatch>
      )}
    </styledEl.DescriptionRow>
  )
}

function WaitAndSaveTitle({ hasError, saveAmount }: { hasError: boolean; saveAmount?: string }): ReactNode {
  const { t } = useLingui()
  const visibleAmount = saveAmount && !hasError ? saveAmount : undefined

  const tooltip = (
    <styledEl.TitleTooltip>
      <TooltipIcon
        type="info"
        title={t`Wait & save`}
        interactive
        content={<WaitAndSaveTooltipContent saveAmount={visibleAmount} />}
      />
    </styledEl.TitleTooltip>
  )

  return (
    <styledEl.TitleRow>
      {visibleAmount ? (
        <Trans>Wait & save </Trans>
      ) : (
        <Trans>
          Wait & <span className="noBreak">save {visibleAmount ? null : tooltip}</span>
        </Trans>
      )}

      {visibleAmount ? (
        <styledEl.TitleAmount className="noBreak">
          {visibleAmount}
          {'\u00A0'}
          {tooltip}
        </styledEl.TitleAmount>
      ) : null}
    </styledEl.TitleRow>
  )
}
