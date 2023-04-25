import { useCallback, useContext, useEffect } from 'react'
import { X } from 'react-feather'
import { animated, useSpring } from '@react-spring/web'
import styled, { FlattenInterpolation, ThemeContext, ThemeProps, DefaultTheme } from 'styled-components/macro'

import { useRemovePopup } from 'state/application/hooks'
import { PopupContent } from 'state/application/reducer'
import FailedNetworkSwitchPopup from 'components/Popups/FailedNetworkSwitchPopup'
import TransactionPopup from './TransactionPopupMod'

// MOD imports
import { WarningPopup } from 'components/Popups/WarningPopup'

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;

  :hover {
    cursor: pointer;
  }
`
export const Popup = styled.div<{ css?: FlattenInterpolation<ThemeProps<DefaultTheme>> }>`
  display: inline-block;
  width: 100%;
  //padding: 1em;
  background-color: ${({ theme }) => theme.bg1};
  position: relative;
  border-radius: 10px;
  padding: 20px;
  padding-right: 35px;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 290px;
    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `}

  ${({ css }) => css && css}
`
export const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.bg3};
`

const AnimatedFader = animated(Fader)

export default function PopupItem({
  removeAfterMs,
  content,
  popKey,
  className, // mod
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
  className?: string
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

  // mod
  const isTxn = 'txn' in content
  const isUnsupportedNetwork = 'unsupportedNetwork' in content
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
      metatxn: { id, success, summary },
    } = content
    popupContent = <TransactionPopup hash={id} success={success} summary={summary} />
  } else if (isUnsupportedNetwork) {
    popupContent = <FailedNetworkSwitchPopup chainId={content.failedSwitchNetwork} isUnsupportedNetwork />
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
    <Popup className={className} css={content.styles}>
      <StyledClose stroke={isUnsupportedNetwork ? theme.black : theme.text2} onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </Popup>
  )
}
