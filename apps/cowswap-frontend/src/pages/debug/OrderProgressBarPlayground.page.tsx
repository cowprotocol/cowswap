import { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { OrderProgressBar } from 'modules/orderProgressBar'

import {
  getProgressBarProps,
  PLAYGROUND_SCENARIOS,
  Scenario,
  ScenarioFrame,
} from './OrderProgressBarPlayground.constants'
import * as styledEl from './OrderProgressBarPlayground.styled'

interface ScenarioSimulationCardProps {
  currentFrame: ScenarioFrame
  currentFrameIndex: number
  scenario: Scenario
}

function ScenarioSimulationCard({ currentFrame, currentFrameIndex, scenario }: ScenarioSimulationCardProps): ReactNode {
  return (
    <styledEl.MetaCard>
      <styledEl.MetaTitle>Simulation</styledEl.MetaTitle>
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
        <strong>Backend sequence:</strong> {scenario.frames.map((frame) => frame.backendStatus).join(' -> ')}
      </styledEl.MetaRow>

      <styledEl.Timeline>
        {scenario.frames.map((frame, index) => (
          <styledEl.TimelineItem key={`${scenario.id}-${index}`} $active={index === currentFrameIndex}>
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

export function OrderProgressBarPlaygroundPage(): ReactNode {
  const [scenarioId, setScenarioId] = useState(PLAYGROUND_SCENARIOS[0].id)
  const [playbackKey, setPlaybackKey] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)

  const scenario = useMemo(
    () => PLAYGROUND_SCENARIOS.find((item) => item.id === scenarioId) || PLAYGROUND_SCENARIOS[0],
    [scenarioId],
  )
  const currentFrameIndex = scenario.frames.length > 1 ? Math.min(frameIndex, scenario.frames.length - 1) : 0
  const currentFrame = scenario.frames[currentFrameIndex] ?? scenario.frames[0]

  const restartScenario = useCallback((): void => {
    setFrameIndex(0)
    setPlaybackKey((value) => value + 1)
  }, [])

  const handleReplay = useCallback((): void => {
    restartScenario()
  }, [restartScenario])

  const handleScenarioChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setScenarioId(event.target.value)
      restartScenario()
    },
    [restartScenario],
  )

  useEffect(() => {
    setFrameIndex(0)

    let elapsedMs = 0
    const timers = scenario.frames.slice(0, -1).map((frame, index) => {
      elapsedMs += frame.holdMs

      return window.setTimeout(() => setFrameIndex(index + 1), elapsedMs)
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [playbackKey, scenario])

  return (
    <styledEl.Page>
      <styledEl.Header>
        <styledEl.Title>Progress Bar Playground</styledEl.Title>
        <styledEl.Description>
          Select a canned backend sequence to replay the progress bar without placing a real order.
        </styledEl.Description>
      </styledEl.Header>

      <styledEl.Controls>
        <styledEl.Field htmlFor="progress-bar-scenario">
          Scenario
          <styledEl.Select
            id="progress-bar-scenario"
            aria-label="Scenario"
            value={scenario.id}
            onChange={handleScenarioChange}
          >
            {PLAYGROUND_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </styledEl.Select>
        </styledEl.Field>

        <styledEl.ReplayButton type="button" onClick={handleReplay}>
          Replay scenario
        </styledEl.ReplayButton>
      </styledEl.Controls>

      <styledEl.Layout>
        <styledEl.PreviewCard>
          <OrderProgressBar {...getProgressBarProps(currentFrame)} />
        </styledEl.PreviewCard>

        <ScenarioSimulationCard currentFrame={currentFrame} currentFrameIndex={currentFrameIndex} scenario={scenario} />
      </styledEl.Layout>
    </styledEl.Page>
  )
}
