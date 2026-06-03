import { ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import svgHtmlSrc from '@cowprotocol/assets/cow-swap/html.svg'
import svgJsSrc from '@cowprotocol/assets/cow-swap/js.svg'
import svgReactSrc from '@cowprotocol/assets/cow-swap/react.svg'
import svgTsSrc from '@cowprotocol/assets/cow-swap/ts.svg'
import { useCopyClipboard } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'
import { CowSwapWidgetProps } from '@cowprotocol/widget-react'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { Check, Copy } from 'react-feather'
import SVG from 'react-inlinesvg'
import SyntaxHighlighter from 'react-syntax-highlighter'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { idea, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { vanillaNoDepsExample } from './code-example-templates/htmlExample'
import { jsExample } from './code-example-templates/jsExample'
import { reactTsExample } from './code-example-templates/reactTsExample'
import { tsExample } from './code-example-templates/tsExample'
import { withPaperBackground } from './snippet.utils'

import { AnalyticsCategory } from '../../common/analytics/types'
import { ColorPalette } from '../../configurator.types'
import { Button } from '../ui/buttons/button/Button.component'
import { BASE_INPUT_FONT_SIZE } from '../ui/inputs/BaseTextInput/BaseTextInput.component'
import { ModalFooter } from '../ui/surface/modal/footer/ModalFooter.component'
import { ModalHeader } from '../ui/surface/modal/header/ModalHeader.component'
import { ModalTabPanel } from '../ui/surface/modal/tabs/ModalTabPanel.component'
import { ModalIconTabInfo, ModalTabs } from '../ui/surface/modal/tabs/ModalTabs.component'

type SnippetTabId = 'react' | 'typescript' | 'javascript' | 'html'

type SnippetGenerator = (params: CowSwapWidgetProps['params'], defaultPalette: ColorPalette) => string

const SNIPPET_TABS_ID_PREFIX = 'simple'

const SNIPPET_TABS = [
  {
    value: 'react',
    tooltip: 'React Typescript',
    icon: <SVG src={svgReactSrc} />,
  },
  {
    value: 'typescript',
    tooltip: 'Typescript',
    icon: <SVG src={svgTsSrc} />,
  },
  {
    value: 'javascript',
    tooltip: 'Javascript',
    icon: <SVG src={svgJsSrc} />,
  },
  {
    value: 'html',
    tooltip: 'Pure HTML',
    icon: <SVG src={svgHtmlSrc} />,
  },
] as const satisfies ModalIconTabInfo<SnippetTabId>[]

const DEFAULT_SNIPPET_TAB_ID = SNIPPET_TABS[0].value

const SNIPPET_TAB_CONFIG = {
  react: { language: 'typescript', snippetFromParams: reactTsExample },
  typescript: { language: 'typescript', snippetFromParams: tsExample },
  javascript: { language: 'javascript', snippetFromParams: jsExample },
  html: { language: 'html', snippetFromParams: vanillaNoDepsExample },
} as const satisfies Record<
  SnippetTabId,
  {
    language: string
    snippetFromParams: SnippetGenerator
  }
>

const COPY_FEEDBACK_MS = 3000

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
  const [activeTabId, setActiveTabId] = useState<SnippetTabId>(DEFAULT_SNIPPET_TAB_ID)
  const { language, snippetFromParams } = SNIPPET_TAB_CONFIG[activeTabId]
  const cowAnalytics = useCowAnalytics()

  const [isCopied, copyToClipboard] = useCopyClipboard(COPY_FEEDBACK_MS)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCopyClick = () => {
    copyToClipboard(code)
    cowAnalytics.sendEvent({
      category: AnalyticsCategory.WIDGET_CONFIGURATOR,
      action: 'Copy code',
    })
  }

  useEffect(() => {
    if (open) {
      cowAnalytics.sendEvent({
        category: AnalyticsCategory.WIDGET_CONFIGURATOR,
        action: 'View code',
      })
    }
  }, [open, cowAnalytics])

  const syntaxHighlighterStyle = useMemo(() => {
    const baseStyle = theme.palette.mode === 'dark' ? vs2015 : idea

    return withPaperBackground(baseStyle, theme.palette.background.paper)
  }, [theme.palette.background.paper, theme.palette.mode])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const code = useMemo(() => {
    return snippetFromParams(params, defaultPalette).trim()
  }, [snippetFromParams, params, defaultPalette])

  const onChangeTab = useCallback((_event: SyntheticEvent, newValue: SnippetTabId) => {
    setActiveTabId(newValue)
  }, [])

  return (
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
      >
        <ModalTabs
          tabs={SNIPPET_TABS}
          value={activeTabId}
          onChange={onChangeTab}
          ariaLabel="languages"
          idPrefix={SNIPPET_TABS_ID_PREFIX}
          sx={{ px: 2 }}
        />
      </ModalHeader>

      <Box
        id="scroll-dialog-description"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ModalTabPanel
          tabValue={activeTabId}
          value={activeTabId}
          idPrefix={SNIPPET_TABS_ID_PREFIX}
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SyntaxHighlighter
            key={activeTabId}
            showLineNumbers={true}
            children={code}
            language={language}
            style={syntaxHighlighterStyle}
            customStyle={{
              margin: 0,
              flex: 1,
              minHeight: 0,
              height: '100%',
              overflow: 'auto',
              padding: '16px',
              fontSize: BASE_INPUT_FONT_SIZE,
              backgroundColor: theme.palette.background.paper,
              boxSizing: 'border-box',
            }}
            codeTagProps={{
              style: {
                padding: 0,
                background: 'transparent',
              },
            }}
            lineNumberStyle={{
              minWidth: '2.25em',
              paddingRight: '1em',
              paddingLeft: 0,
              marginRight: 0,
              userSelect: 'none',
              fontSize: BASE_INPUT_FONT_SIZE,
            }}
          />
        </ModalTabPanel>
      </Box>

      <ModalFooter>
        <Button
          label={isCopied ? 'Copied' : 'Copy'}
          onClick={handleCopyClick}
          disabled={isCopied}
          endIcon={isCopied ? Check : Copy}
        />
      </ModalFooter>
    </Box>
  )
}
