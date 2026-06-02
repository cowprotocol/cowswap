import React, { ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import svgHtmlSrc from '@cowprotocol/assets/cow-swap/html.svg'
import svgJsSrc from '@cowprotocol/assets/cow-swap/js.svg'
import svgReactSrc from '@cowprotocol/assets/cow-swap/react.svg'
import svgTsSrc from '@cowprotocol/assets/cow-swap/ts.svg'
import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import { Tab } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import { useTheme } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import { Copy } from 'react-feather'
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
import { Button } from '../ui/buttons/button/Button.component'
import { ModalFooter } from '../ui/surface/modal/footer/ModalFooter.component'
import { ModalHeader } from '../ui/surface/modal/header/ModalHeader.component'

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
    icon: svgReactSrc,
  },
  {
    id: 1,
    label: 'Typescript',
    language: 'typescript',
    snippetFromParams: tsExample,
    icon: svgTsSrc,
  },
  {
    id: 2,
    label: 'Javascript',
    language: 'javascript',
    snippetFromParams: jsExample,
    icon: svgJsSrc,
  },
  {
    id: 3,
    label: 'Pure HTML',
    language: 'html',
    snippetFromParams: vanillaNoDepsExample,
    icon: svgHtmlSrc,
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

const SNIPPET_CONTENT_PADDING = 16

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function Snippet({ params, open, handleClose, defaultPalette }: SnippetProps): ReactNode {
  const theme = useTheme()
  const [tabInfo, setCurrentTabInfo] = useState<TabInfo>(TABS[0])
  const { id, language, snippetFromParams } = tabInfo
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
          overflow: 'hidden',
          minHeight: 0,
          backgroundColor: (t) => t.palette.background.paper,
        }}
      >
        <ModalHeader
          titleId="scroll-dialog-title"
          title="Snippet for CoW Widget"
          onClose={handleClose}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            backgroundColor: (t) => t.palette.background.paper,
          }}
          tabs={
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
          }
          tabsSx={{ px: 1 }}
        />

        <Box
          id="scroll-dialog-description"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            role="tabpanel"
            id={`simple-tabpanel-${id}`}
            aria-labelledby={`simple-tab-${id}`}
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SyntaxHighlighter
              showLineNumbers={true}
              children={code}
              language={language}
              style={nightOwl}
              customStyle={{
                margin: 0,
                flex: 1,
                minHeight: 0,
                height: '100%',
                overflow: 'auto',
                padding: SNIPPET_CONTENT_PADDING,
                fontSize: '0.8em',
                backgroundColor: theme.palette.background.paper,
                boxSizing: 'border-box',
              }}
            />
          </Box>
        </Box>

        <ModalFooter>
          <Button label="Copy" onClick={handleCopyClick} endIcon={Copy} />
        </ModalFooter>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Successfully copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
