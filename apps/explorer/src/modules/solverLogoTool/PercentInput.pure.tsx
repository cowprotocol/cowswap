import { ReactElement, useState } from 'react'

import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

import { clamp } from './geometry.utils'
import { PercentField } from './solverLogoTool.styled'

interface Props {
  label: string
  value: number
  min: number
  max: number
  onChange(value: number): void
  showLabel?: boolean
}

export function PercentInput({ label, value, min, max, onChange, showLabel = false }: Props): ReactElement {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const stepBy = (delta: number): void => {
    onChange(Math.round(clamp(value + delta, min, max)))
    setEditing(false)
  }
  return (
    <PercentField role="group" aria-label={`${label} controls`}>
      {showLabel && <span>{label}</span>}
      <div className="number-control">
        <input
          type="number"
          aria-label={`${label} percentage`}
          min={min}
          max={max}
          step={1}
          inputMode="numeric"
          value={editing ? draft : value}
          onFocus={(): void => {
            setDraft(String(value))
            setEditing(true)
          }}
          onChange={(event): void => {
            setDraft(event.target.value)
            const next = event.target.valueAsNumber
            if (Number.isFinite(next) && next >= min && next <= max) onChange(Math.round(next))
          }}
          onBlur={(): void => {
            onChange(draft === '' ? value : Math.round(clamp(draft, min, max)))
            setEditing(false)
          }}
          onKeyDown={(event): void => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <span aria-hidden="true">%</span>
        <span className="step-buttons">
          <button
            type="button"
            aria-label={`Increase ${label} percentage`}
            disabled={value >= max}
            onClick={(): void => stepBy(1)}
          >
            <FaChevronUp aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label} percentage`}
            disabled={value <= min}
            onClick={(): void => stepBy(-1)}
          >
            <FaChevronDown aria-hidden="true" />
          </button>
        </span>
      </div>
    </PercentField>
  )
}
