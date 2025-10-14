import { ReactNode, useEffect, useMemo, useRef } from 'react'

import jazzicon from '@metamask/jazzicon'
import styled from 'styled-components/macro'

const JazzIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

interface JazzIconProps {
  className?: string
  size: number
  account: string | undefined
}

export function JazzIcon({ className, size, account }: JazzIconProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null)

  const icon = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const defaultSeed = Math.floor(Math.random() * 1000000)

    const seed = account ? parseInt(account.slice(2, 10), 16) : defaultSeed
    return jazzicon(size, seed)
  }, [size, account])

  useEffect(() => {
    if (!ref.current) return

    ref.current.innerHTML = ''
    ref.current.appendChild(icon)
  }, [icon])

  return <JazzIconWrapper ref={ref} className={className}></JazzIconWrapper>
}
