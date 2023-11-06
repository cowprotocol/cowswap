import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'

import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import SyntaxHighlighter from 'react-syntax-highlighter'
// eslint-disable-next-line no-restricted-imports
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { reactExample } from './utils/reactExample'
import { vanilaNpmExample } from './utils/vanilaNpmExample'
import { vanillaNoDepsExample } from './utils/vanillaNoDepsExample'

import { copyEmbedCode, viewEmbedCode } from '../analytics'

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export interface EmbedDialogProps {
  params: CowSwapWidgetProps['params']
}

export function EmbedDialog({ params }: EmbedDialogProps) {
  const [open, setOpen] = useState(false)
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')

  const [currentTab, setCurrentTab] = useState(0)

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true)
    setScroll(scrollType)
    viewEmbedCode()
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

  const code = useMemo(() => {
    if (currentTab === 0) return vanilaNpmExample(params)
    if (currentTab === 1) return reactExample(params)
    if (currentTab === 2) return vanillaNoDepsExample(params)

    return ''
  }, [currentTab, params])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    copyEmbedCode()
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={(event: SyntheticEvent, newValue: number) => setCurrentTab(newValue)}
              aria-label="basic tabs example"
            >
              <Tab label="Vanilla (NPM)" {...a11yProps(0)} />
              <Tab label="React" {...a11yProps(1)} />
              <Tab label="Pure HTML" {...a11yProps(2)} />
            </Tabs>
          </Box>

          <div role="tabpanel" id={`simple-tabpanel-${currentTab}`} aria-labelledby={`simple-tab-${currentTab}`}>
            <SyntaxHighlighter
              showLineNumbers={true}
              children={code}
              language={currentTab === 2 ? 'html' : 'typescript'}
              style={nightOwl}
              customStyle={{ fontSize: '0.8em' }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCopy}>Copy</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
