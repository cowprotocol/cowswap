import { useEffect, useRef, useState } from 'react'

import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import SyntaxHighlighter from 'react-syntax-highlighter'
// eslint-disable-next-line no-restricted-imports
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export interface EmbedDialogProps {
  params: CowSwapWidgetProps['params']
  settings: CowSwapWidgetProps['settings']
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
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Snippet for CoW Widget</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <SyntaxHighlighter
            showLineNumbers={true}
            children={code}
            language="typescript"
            style={nightOwl}
            customStyle={{ fontSize: '0.8em' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCopy}>Copy</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
