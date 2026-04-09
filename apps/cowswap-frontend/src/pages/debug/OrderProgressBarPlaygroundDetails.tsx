import { ReactNode } from 'react'

import { ScenarioFrame } from './OrderProgressBarPlayground.demo.constants'
import * as styledEl from './OrderProgressBarPlayground.styled'

type OrderProgressBarPlaygroundDetailsProps = {
  currentFrame: ScenarioFrame
  currentFrameIndex: number
  frames: ScenarioFrame[]
  sequenceLabel: string
  title: string
}

export function OrderProgressBarPlaygroundDetails({
  currentFrame,
  currentFrameIndex,
  frames,
  sequenceLabel,
  title,
}: OrderProgressBarPlaygroundDetailsProps): ReactNode {
  return (
    <styledEl.MetaCard>
      <styledEl.MetaTitle>{title}</styledEl.MetaTitle>
      <styledEl.CurrentStatusGrid>
        <styledEl.CurrentStatusCard>
          <styledEl.CurrentStatusLabel>Current backend status</styledEl.CurrentStatusLabel>
          <styledEl.CurrentStatusValue>{currentFrame.backendStatus}</styledEl.CurrentStatusValue>
        </styledEl.CurrentStatusCard>

        <styledEl.CurrentStatusCard>
          <styledEl.CurrentStatusLabel>Current progress step</styledEl.CurrentStatusLabel>
          <styledEl.CurrentStatusValue>{currentFrame.stepName}</styledEl.CurrentStatusValue>
        </styledEl.CurrentStatusCard>
      </styledEl.CurrentStatusGrid>

      <styledEl.MetaRow>
        <strong>Backend sequence:</strong> {sequenceLabel}
      </styledEl.MetaRow>

      <styledEl.Timeline>
        {frames.map((frame, index) => (
          <styledEl.TimelineItem
            key={`${title}-${frame.stepName}-${frame.backendStatus}-${index}`}
            $active={index === currentFrameIndex}
          >
            <styledEl.TimelineHeader>
              <styledEl.TimelineTitle>Step {index + 1}</styledEl.TimelineTitle>
              {index === currentFrameIndex && <styledEl.TimelineCurrentBadge>Now</styledEl.TimelineCurrentBadge>}
            </styledEl.TimelineHeader>

            <styledEl.TimelineStatuses>
              <styledEl.TimelineStatusPill $variant="backend">
                <styledEl.TimelineStatusLabel>Backend</styledEl.TimelineStatusLabel>
                {frame.backendStatus}
              </styledEl.TimelineStatusPill>

              <styledEl.TimelineStatusPill $variant="progress">
                <styledEl.TimelineStatusLabel>Progress</styledEl.TimelineStatusLabel>
                {frame.stepName}
              </styledEl.TimelineStatusPill>
            </styledEl.TimelineStatuses>
          </styledEl.TimelineItem>
        ))}
      </styledEl.Timeline>
    </styledEl.MetaCard>
  )
}
