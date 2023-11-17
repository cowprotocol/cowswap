import React, { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'

import HTMLIcon from '@cowprotocol/assets/cow-swap/html.svg'
import JSIcon from '@cowprotocol/assets/cow-swap/js.svg'
import ReactIcon from '@cowprotocol/assets/cow-swap/react.svg'
import TSIcon from '@cowprotocol/assets/cow-swap/ts.svg'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import { Tab } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Tabs from '@mui/material/Tabs'
import SVG from 'react-inlinesvg'
import SyntaxHighlighter from 'react-syntax-highlighter'
// eslint-disable-next-line no-restricted-imports
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { jsExample } from './utils/jsExample'
import { reactTsExample } from './utils/reactTsExample'
import { tsExample } from './utils/tsExample'
import { vanillaNoDepsExample } from './utils/vanillaNoDepsExample'

import { copyEmbedCodeGA, viewEmbedCodeGA } from '../analytics'

interface TabInfo {
  label: string
  language: string
  snippetFromParams(params: CowSwapWidgetProps['params']): string
  icon: string
}

const TABS: TabInfo[] = [
  {
    label: 'React Typescript',
    language: 'typescript',
    snippetFromParams: reactTsExample,
    icon: ReactIcon,
  },
  {
    label: 'Typescript',
    language: 'typescript',
    snippetFromParams: tsExample,
    icon: TSIcon,
  },
  {
    label: 'Javascript',
    language: 'javascript',
    snippetFromParams: jsExample,
    icon: JSIcon,
  },
  {
    label: 'Pure HTML',
    language: 'html',
    snippetFromParams: vanillaNoDepsExample,
    icon: HTMLIcon,
  },
]

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export interface EmbedDialogProps {
  params: CowSwapWidgetProps['params']
  open: boolean
  handleClose: () => void
}

export function EmbedDialog({ params, open, handleClose }: EmbedDialogProps) {
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')
  const [{ label, language, snippetFromParams }, setCurrentTab] = useState<TabInfo>(TABS[1])
  const descriptionElementRef = useRef<HTMLElement>(null)

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    copyEmbedCodeGA()
    setSnackbarOpen(true)
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  useEffect(() => {
    if (open) {
      setScroll('paper')
      viewEmbedCodeGA()
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  const code = useMemo(() => {
    return snippetFromParams(params)
  }, [snippetFromParams, params])

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="lg"
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle id="scroll-dialog-title">Snippet for CoW Widget</DialogTitle>

        <DialogContent dividers={scroll === 'paper'}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={label}
              onChange={(event: SyntheticEvent, newValue: TabInfo) => setCurrentTab(newValue)}
              aria-label="languages"
              sx={{
                '& .MuiTab-iconWrapper': {
                  height: '16px',
                  width: '16px',
                  opacity: 0.75,
                },
                '& .Mui-selected .MuiTab-iconWrapper': {
                  opacity: 1,
                },
              }}
            >
              {TABS.map((tabInfo, index) => {
                return (
                  <Tab label={tabInfo.label} icon={<SVG src={tabInfo.icon} />} value={tabInfo} {...a11yProps(index)} />
                )
              })}
            </Tabs>
          </Box>

          <div role="tabpanel" id={`simple-tabpanel-${label}`} aria-labelledby={`simple-tab-${label}`}>
            <SyntaxHighlighter
              showLineNumbers={true}
              children={code}
              language={language}
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

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Successfully copied to clipboard!
        </Alert>
      </Snackbar>
    </div>
  )
}
