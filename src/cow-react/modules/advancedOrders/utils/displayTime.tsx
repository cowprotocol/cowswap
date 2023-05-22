import ms from 'ms'

type Params = {
  time: number
  defaultOutput: string
}

export function displayTime(params: Params) {
  const { time, defaultOutput } = params

  const output = []

  let days = Math.floor(ms(`${time}ms`) / ms('1d'))
  let hours = Math.floor((ms(`${time}ms`) % ms('1d')) / ms('1h'))
  let minutes = Math.floor((ms(`${time}ms`) % ms('1h')) / ms('1m'))
  let seconds = Math.floor((ms(`${time}ms`) % ms('1m')) / ms('1s'))

  if (days) output.push(`${days}d`)
  if (hours) output.push(`${hours}h`)
  if (minutes) output.push(`${minutes}m`)
  if (seconds) output.push(`${seconds}s`)

  return output.length ? output.join(' ') : defaultOutput
}
