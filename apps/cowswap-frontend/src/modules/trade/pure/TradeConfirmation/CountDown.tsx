import { useEffect, useState } from 'react'

import ms from 'ms.macro'

import { QuoteCountdownWrapper } from './styled'

const ONE_SEC = ms`1s`

interface CountdownComponentProps {
  refreshInterval: number | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const QuoteCountdown = ({ refreshInterval }: CountdownComponentProps) => {
  const [blink, setBlink] = useState<boolean>(false)

  const [nextUpdateAt, setNextUpdateAt] = useState(refreshInterval)

  useEffect(() => {
    if (refreshInterval === undefined || nextUpdateAt === undefined) return

    const interval = setInterval(() => {
      const newValue = nextUpdateAt - ONE_SEC

      setNextUpdateAt(newValue <= 0 ? refreshInterval : newValue)
    }, ONE_SEC)

    return () => clearInterval(interval)
  }, [nextUpdateAt, refreshInterval])

  useEffect(() => {
    if (nextUpdateAt === undefined) return

    if (Math.ceil(nextUpdateAt / 1000) <= 1) {
      setBlink(true)
      const timer = setTimeout(() => setBlink(false), 1000)

      return () => clearTimeout(timer)
    }

    return
  }, [nextUpdateAt])

  if (nextUpdateAt === undefined) return null

  return (
    <QuoteCountdownWrapper blink={blink}>
      Quote refresh in <b>{Math.ceil(nextUpdateAt / 1000)} sec</b>
    </QuoteCountdownWrapper>
  )
}
