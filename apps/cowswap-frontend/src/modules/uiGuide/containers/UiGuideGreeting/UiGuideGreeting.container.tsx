import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { Trans } from '@lingui/react/macro'
import { uiGuideState } from 'entities/uiGuide'

import { CoWBubble } from '../../pure/CoWBubble.pure'

interface GreetingProps {
  children: ReactNode
}

export function UiGuideGreeting({ children }: GreetingProps): ReactNode {
  const [{ skipped, currentStep, finished }, setState] = useAtom(uiGuideState)
  const [visible, setVisible] = useState(false)

  const onSkip = useCallback(() => {
    setState({ skipped: true })
  }, [setState])

  const onStart = useCallback(() => {
    setState({ skipped: false, currentStep: 0 })
  }, [setState])

  useEffect(() => {
    if (skipped || typeof currentStep === 'number') return

    const timeout = setTimeout(() => {
      setVisible(true)
    }, 2500)

    return () => clearTimeout(timeout)
  }, [skipped, currentStep])

  const startButtons = useMemo(() => {
    return [
      { text: 'Next', onClick: onStart },
      { text: 'Skip', onClick: onSkip, secondary: true },
    ]
  }, [onStart, onSkip])

  const finishButtons = useMemo(() => {
    return [{ text: 'Finish', onClick: onSkip }]
  }, [onSkip])

  if (skipped) return null

  if (typeof currentStep === 'number') return children

  if (finished) {
    return (
      <CoWBubble visible={visible} buttons={finishButtons}>
        <h3>
          <Trans>Confirm Swap</Trans>
        </h3>
        <p>
          Confirm the trade and sign{' '}
          <a href="https://cow.fi/learn/how-to-gasless-swaps-on-ethereum" target="_blank">
            your gasless swap order
          </a>{' '}
          in your wallet. Once executed, your new tokens will appear in your wallet automatically. You’re Ready!
        </p>
      </CoWBubble>
    )
  }

  return (
    <CoWBubble visible={visible} buttons={startButtons}>
      <h3>
        <Trans>Welcome to CoW Swap</Trans>
      </h3>
      <p>
        <Trans>Let me guide you across the page to help you to get the best user experience using CoW Swap app!</Trans>
      </p>
    </CoWBubble>
  )
}
