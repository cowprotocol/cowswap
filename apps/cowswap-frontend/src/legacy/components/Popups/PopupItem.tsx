import { useCallback, useContext, useEffect } from 'react'

import { useSpring } from '@react-spring/web'
import { ThemeContext } from 'styled-components/macro'

import { FailedNetworkSwitchPopup } from 'legacy/components/Popups/FailedNetworkSwitchPopup'
import { WarningPopup } from 'legacy/components/Popups/WarningPopup'
import { useRemovePopup } from 'legacy/state/application/hooks'
import { PopupContent } from 'legacy/state/application/reducer'

import { AnimatedFader, PopupWrapper, StyledClose } from './styled'
import { TransactionPopup } from './TransactionPopup'

export function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useContext(ThemeContext)

  const isTxn = 'txn' in content
  const isMetaTxn = 'metatxn' in content
  const isWarningTxn = 'warning' in content

  let popupContent
  if (isTxn) {
    const {
      txn: { hash, success, summary },
    } = content
    popupContent = <TransactionPopup hash={hash} success={success} summary={summary} />
  } else if (isMetaTxn) {
    const {
      metatxn: { id, success, summary, orderType },
    } = content
    popupContent = <TransactionPopup hash={id} success={success} summary={summary} type={orderType} />
  } else if ('failedSwitchNetwork' in content) {
    popupContent = <FailedNetworkSwitchPopup chainId={content.failedSwitchNetwork} />
  } else if (isWarningTxn) {
    popupContent = <WarningPopup warning={content.warning} />
  }

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined },
  })

  return (
    <PopupWrapper css={content.styles}>
      <StyledClose stroke={theme.text2} onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </PopupWrapper>
  )
}
