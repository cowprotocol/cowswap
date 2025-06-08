import React, { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import HTMLIcon from '@cowprotocol/assets/cow-swap/html.svg'
import JSIcon from '@cowprotocol/assets/cow-swap/js.svg'
import ReactIcon from '@cowprotocol/assets/cow-swap/react.svg'
import TSIcon from '@cowprotocol/assets/cow-swap/ts.svg'
import { Command } from '@cowprotocol/types'
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

import { vanillaNoDepsExample } from './utils/htmlExample'
import { jsExample } from './utils/jsExample'
import { reactTsExample } from './utils/reactTsExample'
import { tsExample } from './utils/tsExample'

import { AnalyticsCategory } from '../../common/analytics/types'
import { ColorPalette } from '../configurator/types'

interface TabInfo {
  id: number
  label: string
  language: string
  snippetFromParams(params: CowSwapWidgetProps['params'], defaultPalette: ColorPalette): string
  icon: string
}

const TABS: TabInfo[] = [
  {
    id: 0,
    label: 'React Typescript',
    language: 'typescript',
    snippetFromParams: reactTsExample,
    icon: ReactIcon,
  },
  {
    id: 1,
    label: 'Typescript',
    language: 'typescript',
    snippetFromParams: tsExample,
    icon: TSIcon,
  },
  {
    id: 2,
    label: 'Javascript',
    language: 'javascript',
    snippetFromParams: jsExample,
    icon: JSIcon,
  },
  {
    id: 3,
    label: 'Pure HTML',
    language: 'html',
    snippetFromParams: vanillaNoDepsExample,
    icon: HTMLIcon,
  },
]

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function a11yProps(id: number) {
  return {
    id: `simple-tab-${id}`,
    'aria-controls': `simple-tabpanel-${id}`,
  }
}

export interface EmbedDialogProps {
  params: CowSwapWidgetProps['params']
  defaultPalette: ColorPalette
  open: boolean
  handleClose: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function EmbedDialog({ params, open, handleClose, defaultPalette }: EmbedDialogProps) {
  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')
  const [tabInfo, setCurrentTabInfo] = useState<TabInfo>(TABS[0])
  const { id, language, snippetFromParams } = tabInfo
  const descriptionElementRef = useRef<HTMLElement>(null)
  const cowAnalytics = useCowAnalytics()

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCopyClick = () => {
    navigator.clipboard.writeText(code)
    cowAnalytics.sendEvent({
      category: AnalyticsCategory.WIDGET_CONFIGURATOR,
      action: 'Copy code',
    })
    setSnackbarOpen(true)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  useEffect(() => {
    if (open) {
      setScroll('paper')
      cowAnalytics.sendEvent({
        category: AnalyticsCategory.WIDGET_CONFIGURATOR,
        action: 'View code',
      })
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open, cowAnalytics])

  const code = useMemo(() => {
    return snippetFromParams(params, defaultPalette)
  }, [snippetFromParams, params, defaultPalette])

  const onChangeTab = useCallback((_event: SyntheticEvent, newValue: TabInfo) => setCurrentTabInfo(newValue), [])

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
              value={tabInfo}
              onChange={onChangeTab}
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
              {TABS.map((info) => {
                return (
                  <Tab
                    key={info.id}
                    label={info.label}
                    icon={<SVG src={info.icon} />}
                    value={info}
                    {...a11yProps(info.id)}
                  />
                )
              })}
            </Tabs>
          </Box>

          <div role="tabpanel" id={`simple-tabpanel-${id}`} aria-labelledby={`simple-tab-${id}`}>
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
          <Button onClick={handleCopyClick}>Copy</Button>
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
