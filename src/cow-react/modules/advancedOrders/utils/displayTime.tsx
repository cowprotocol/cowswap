type Params = {
  hours?: number
  minutes?: number
  seconds?: number
  defaultOutput: string
}

export function displayTime(params: Params) {
  const { minutes, hours, seconds, defaultOutput } = params

  const output = []

  if (hours) output.push(`${hours}h`)
  if (minutes) output.push(`${minutes}m`)
  if (seconds) output.push(`${seconds}s`)

  return output.length ? output.join(' ') : defaultOutput
}
