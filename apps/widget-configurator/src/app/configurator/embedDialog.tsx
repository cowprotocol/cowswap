import { useEffect, useRef, useState } from 'react'

import { CowSwapWidgetParams, CowSwapWidgetSettings } from '@cowprotocol/widget-lib'

import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const CodeStyles = {
  whiteSpace: 'break-spaces',
  fontSize: '13px',
}

export interface EmbedDialogProps {
  params: CowSwapWidgetParams
  settings: CowSwapWidgetSettings
}

export function EmbedDialog({ params, settings }: EmbedDialogProps) {
  const [open, setOpen] = useState(false)
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true)
    setScroll(scrollType)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const descriptionElementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  const paramsSanitized = {
    ...params,
    container: `<YOUR_CONTAINER>`,
    provider: `<eip-1193 provider>`,
  }

  const code = `
import { CowSwapWidgetParams, CowSwapWidgetSettings, cowSwapWidget } from '@cowprotocol/widget-lib'

const params: CowSwapWidgetParams = ${JSON.stringify(paramsSanitized, null, 4)}

const settings: CowSwapWidgetSettings = ${JSON.stringify(settings, null, 4)}

const updateWidget = cowSwapWidget(params, settings)
  `

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen('paper')}>{`View Embed Code </>`}</Button>
      {/* <Button onClick={handleClickOpen('body')}>scroll=body</Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">CoW Widget Embed</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText id="scroll-dialog-description" ref={descriptionElementRef} tabIndex={-1}>
            <code style={CodeStyles}>{code}</code>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCopy}>Copy</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
