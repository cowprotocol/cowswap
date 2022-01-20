import { ProgressBarWrap, ProgressContainer, Progress, Label, FlexWrap, HiddenRange, ProgressVal } from './styled'

interface ProgressBarProps {
  percentage: number // between 0 - 100
  onPercentageClick: (percentage: number) => void
}

export function ProgressBar({ percentage, onPercentageClick }: ProgressBarProps) {
  const statPercentages = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
  ]
  const minVal = statPercentages[0].value
  const maxVal = statPercentages[statPercentages.length - 1].value

  if (percentage > 100) {
    percentage = 100
  } else if (percentage < 0) {
    percentage = 0
  }

  return (
    <FlexWrap>
      <ProgressBarWrap>
        {statPercentages.map((item, index) => (
          <Label position={item.value} onClick={() => onPercentageClick(item.value)} key={`${item.value}-${index}`}>
            {item.label}
          </Label>
        ))}
        <ProgressContainer>
          <HiddenRange
            onChange={(e) => onPercentageClick(parseFloat(e.target.value))}
            min={minVal}
            max={maxVal}
            value={percentage}
            type="range"
          />
          <Progress percentage={percentage} />
          <ProgressVal>{percentage}%</ProgressVal>
        </ProgressContainer>
      </ProgressBarWrap>
    </FlexWrap>
  )
}
