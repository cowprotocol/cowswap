import { useAtomValue, useSetAtom } from 'jotai'
import { IconType, removeSnackbarAtom, snackbarsAtom } from '../../state/snackbarsAtom'
import styled from 'styled-components/macro'
import { SnackbarPopup } from '../../pure/SnackbarPopup'
import ms from 'ms.macro'
import { AlertCircle, CheckCircle } from 'react-feather'
import { ReactElement, useCallback, useMemo } from 'react'
import { transparentize } from 'polished'
import { useResetAtom } from 'jotai/utils'

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  background: ${({ theme }) => transparentize(0.2, theme.bg1)};
`

const List = styled.div`
  position: relative;
  z-index: 5;
`

const Host = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 6;
  min-width: 300px;
  max-width: 800px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;

    ${Overlay} {
      display: block;
    }
  `}
`

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.green1};
`

const AlertIcon = styled(AlertCircle)`
  color: ${({ theme }) => theme.red1};
`

const DEFAULT_DURATION = ms`6s`

const icons: Record<IconType, ReactElement | undefined> = {
  success: <SuccessIcon size={24} />,
  alert: <AlertIcon size={24} />,
  custom: undefined,
}

export function SnackbarsWidget() {
  const snackbarsState = useAtomValue(snackbarsAtom)
  const resetSnackbarsState = useResetAtom(snackbarsAtom)
  const removeSnackbar = useSetAtom(removeSnackbarAtom)

  const snackbars = useMemo(() => {
    return Object.values(snackbarsState)
  }, [snackbarsState])

  const onExpire = useCallback(
    (id: string) => {
      removeSnackbar(id)
    },
    [removeSnackbar]
  )

  return (
    <Host>
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
      {snackbars.length > 0 && <Overlay onClick={resetSnackbarsState} />}
    </Host>
  )
}
