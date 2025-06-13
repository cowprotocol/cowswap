import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { ReactElement, useCallback, useEffect, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, UI } from '@cowprotocol/ui'

import ms from 'ms.macro'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { useAnchorPosition } from '../../hooks/useAnchorPosition'
import { SnackbarPopup } from '../../pure/SnackbarPopup'
import { IconType, removeSnackbarAtom, snackbarsAtom } from '../../state/snackbarsAtom'

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  background: var(${UI.COLOR_PAPER_DARKEST});
`

const List = styled.div`
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Host = styled.div<{ hidden$: boolean; top$: number }>`
  position: fixed;
  top: ${({ top$ }) => top$ + 'px'};
  right: ${({ hidden$ }) => (hidden$ ? '-9999px' : '20px')};
  z-index: 6;
  min-width: 300px;
  max-width: 800px;

  ${Media.upToSmall()} {
    width: 90%;
    left: 0;
    right: ${({ hidden$ }) => (hidden$ ? '-9999px' : '0')};
    margin: auto;

    ${Overlay} {
      display: block;
    }
  }
`

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.green1};
`

const AlertIcon = styled(AlertCircle)`
  color: ${({ theme }) => theme.danger};
`

const DEFAULT_DURATION = ms`8s`

const icons: Record<IconType, ReactElement | undefined> = {
  success: <SuccessIcon size={24} />,
  alert: <AlertIcon size={24} />,
  custom: undefined,
}

const WIDGET_DEFAULT_TOP_POSITION = 80

interface SnackbarsWidgetProps {
  /**
   * This prop might seem a bit hacky and this is true
   * The problem in `OrderNotification` and `getToastMessageCallback` functions
   * In widget mode with `disableToastMessages` option we want to display notifications on the integrator side
   * To do that, we need to render `OrderNotification` but not display it in the widget
   * Having this, we use this flag to artificially hide the widget
   */
  hidden?: boolean
  /**
   * Id of a DOM element to which the snackbars should be anchored (displayed under)
   * In CoW Swap the element is the header menu
   */
  anchorElementId?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SnackbarsWidget({ hidden, anchorElementId }: SnackbarsWidgetProps) {
  const snackbarsState = useAtomValue(snackbarsAtom)
  const resetSnackbarsState = useResetAtom(snackbarsAtom)
  const removeSnackbar = useSetAtom(removeSnackbarAtom)

  const { top, height } = useAnchorPosition(anchorElementId)
  const widgetTop = top + height || WIDGET_DEFAULT_TOP_POSITION

  const snackbars = useMemo(() => {
    return Object.values(snackbarsState)
  }, [snackbarsState])

  const onExpire = useCallback(
    (id: string) => {
      removeSnackbar(id)
    },
    [removeSnackbar],
  )

  const isUpToSmall = useMediaQuery(Media.upToSmall(false))
  const isOverlayDisplayed = snackbars.length > 0 && !hidden && isUpToSmall

  useEffect(() => {
    document.body.style.overflow = isOverlayDisplayed ? 'hidden' : ''
  }, [isOverlayDisplayed])

  return (
    <Host hidden$={!!hidden} top$={widgetTop}>
      <List>
        {snackbars.map((snackbar) => {
          const icon = snackbar.icon
            ? snackbar.icon === 'custom'
              ? snackbar.customIcon
              : icons[snackbar.icon]
            : undefined

          const duration = snackbar.duration ?? DEFAULT_DURATION

          return (
            <SnackbarPopup key={snackbar.id} id={snackbar.id} icon={icon} duration={duration} onExpire={onExpire}>
              {snackbar.content}
            </SnackbarPopup>
          )
        })}
      </List>
      {isOverlayDisplayed && <Overlay onClick={resetSnackbarsState} />}
    </Host>
  )
}
