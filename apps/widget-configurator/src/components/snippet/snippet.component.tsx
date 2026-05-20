import React, { ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import HTMLIcon from '@cowprotocol/assets/cow-swap/html.svg'
import JSIcon from '@cowprotocol/assets/cow-swap/js.svg'
import ReactIcon from '@cowprotocol/assets/cow-swap/react.svg'
import TSIcon from '@cowprotocol/assets/cow-swap/ts.svg'
import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import { Tab } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import { useTheme } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import SVG from 'react-inlinesvg'
import SyntaxHighlighter from 'react-syntax-highlighter'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { vanillaNoDepsExample } from './utils/htmlExample'
import { jsExample } from './utils/jsExample'
import { reactTsExample } from './utils/reactTsExample'
import { tsExample } from './utils/tsExample'

import { AnalyticsCategory } from '../../common/analytics/types'
import { ColorPalette } from '../../configurator.types'

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

export interface SnippetProps {
  params: CowSwapWidgetProps['params']
  defaultPalette: ColorPalette
  open: boolean
  handleClose: Command
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function Snippet({ params, open, handleClose, defaultPalette }: SnippetProps): ReactNode {
  const theme = useTheme()
  const [tabInfo, setCurrentTabInfo] = useState<TabInfo>(TABS[0])
  const { id, language, snippetFromParams } = tabInfo
  const descriptionElementRef = useRef<HTMLDivElement | null>(null)
  const cowAnalytics = useCowAnalytics()

  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [, copyToClipboard] = useCopyClipboard(3000)
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCopyClick = () => {
    copyToClipboard(code)
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

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const code = useMemo(() => {
    return snippetFromParams(params, defaultPalette)
  }, [snippetFromParams, params, defaultPalette])

  const onChangeTab = useCallback((_event: SyntheticEvent, newValue: TabInfo) => setCurrentTabInfo(newValue), [])

  return (
    <>
      <Box
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          backgroundColor: (t) => t.palette.background.paper,
        }}
      >
        <Box
          ref={descriptionElementRef}
          tabIndex={-1}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            flexShrink: 0,
            backgroundColor: (t) => t.palette.background.paper,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              px: 2,
              pt: 2,
              pb: 1.5,
            }}
          >
            <Typography id="scroll-dialog-title" component="h2" variant="h6" sx={{ fontWeight: 600, m: 0 }}>
              Snippet for CoW Widget
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Button variant="outlined" color="inherit" onClick={handleClose}>
                Close
              </Button>
              <Button variant="contained" onClick={handleCopyClick}>
                Copy
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderTop: 1, borderColor: 'divider', px: 1 }}>
            <Tabs
              value={tabInfo}
              onChange={onChangeTab}
              aria-label="languages"
              sx={{
                minHeight: 48,
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
        </Box>

        <Box
          id="scroll-dialog-description"
          sx={{
            flexShrink: 0,
            px: 2,
            pb: 2,
            pt: 1,
          }}
        >
          <div role="tabpanel" id={`simple-tabpanel-${id}`} aria-labelledby={`simple-tab-${id}`}>
            <SyntaxHighlighter
              showLineNumbers={true}
              children={code}
              language={language}
              style={nightOwl}
              customStyle={{ fontSize: '0.8em', backgroundColor: theme.palette.background.paper }}
            />
          </div>
        </Box>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Successfully copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
