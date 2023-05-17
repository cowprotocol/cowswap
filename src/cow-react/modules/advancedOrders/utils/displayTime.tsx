type Params = {
  hours?: number
  days?: number
  minutes?: number
  seconds?: number
  defaultOutput: string
}

export function displayTime(params: Params) {
  const { minutes, hours, seconds, days, defaultOutput } = params

  const output = []

  if (days) output.push(`${days}d`)
  if (hours) output.push(`${hours}h`)
  if (minutes) output.push(`${minutes}m`)
  if (seconds) output.push(`${seconds}s`)

  return output.length ? output.join(' ') : defaultOutput
}
