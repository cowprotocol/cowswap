import React, { ReactNode, useEffect, useState } from 'react'

import { isValidTokenListSource } from '@cowprotocol/common-utils'
import { Command, TokenInfo } from '@cowprotocol/types'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, TextField } from '@mui/material'
import Tabs from '@mui/material/Tabs'

import { DEFAULT_CUSTOM_TOKENS } from '../../configurator.constants'
import { parseCustomTokensInput } from '../../utils/parseCustomTokensInput'
import { JsonInput } from '../ui/inputs/JsonInput/JsonInput.component'

type AddCustomListDialogProps = {
  open: boolean
  onClose: Command
  customTokens: TokenInfo[]
  onAddListUrl: (newListUrl: string) => void
  onAddCustomTokens: (tokens: TokenInfo[]) => void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AddCustomListDialog({
  open,
  onClose,
  onAddListUrl,
  onAddCustomTokens,
  customTokens: customTokensDefault,
}: AddCustomListDialogProps) {
  const [customListUrl, setCustomListUrl] = useState<string>('')
  const [hasErrors, setHasErrors] = useState(false)
  const [hasJsonErrors, setHasJsonErrors] = useState(false)
  const [customTokensJson, setCustomTokensJson] = useState<string | null>('')

  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([])

  const [tabIndex, setTabIndex] = useState(0)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const resetForm = () => {
    // Reset custom URL
    setCustomListUrl('')
    setHasErrors(false)

    // Reset custom tokens
    setCustomTokens([])
    setHasJsonErrors(false)
    setCustomTokensJson('')
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
    resetForm()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setCustomListUrl(value)

    setHasErrors(value ? !isValidTokenListSource(value) : false)
  }

  // TODO: Add proper return type annotation

  const handleJsonInputChange = (_name: string, value: string | null): void => {
    setHasJsonErrors(false)
    setCustomTokensJson(value)

    if (!value?.trim()) {
      setCustomTokens([])
      return
    }

    try {
      const parsedTokens = parseCustomTokensInput(value)

      if (parsedTokens) {
        setCustomTokens(parsedTokens)
      } else {
        setHasJsonErrors(true)
      }
    } catch {
      setHasJsonErrors(true)
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = () => {
    if (customListUrl) {
      onAddListUrl(customListUrl)
      resetForm()
    } else if (customTokens.length) {
      onAddCustomTokens(customTokens)
    }

    onClose()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addJsonExample = () => {
    setCustomTokensJson(JSON.stringify(DEFAULT_CUSTOM_TOKENS, null, 2))
    setCustomTokens(DEFAULT_CUSTOM_TOKENS)
    setHasJsonErrors(false)
  }

  useEffect(() => {
    if (customTokensDefault.length) {
      setCustomTokens(customTokensDefault)
    }
  }, [customTokensDefault])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Token List</DialogTitle>
      <DialogContent sx={{ minWidth: '600px' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="URL" />
            <Tab label="JSON" />
          </Tabs>
        </Box>
        <CustomTabPanel value={tabIndex} index={0}>
          <TextField
            error={hasErrors}
            margin="dense"
            id="url"
            label="List URL"
            type="url"
            fullWidth
            variant="outlined"
            value={customListUrl}
            onChange={handleUrlInputChange}
            helperText={hasErrors && 'Enter a valid URL'}
            required
            autoComplete="off"
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={1}>
          <JsonInput
            name="customTokensJson"
            label="Custom tokens JSON"
            value={customTokensJson}
            onChange={handleJsonInputChange}
            error={hasJsonErrors}
            helperText={hasJsonErrors ? 'Enter a token array or token list JSON' : undefined}
          />
          <Button onClick={addJsonExample}>Add an example</Button>
        </CustomTabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={hasErrors || hasJsonErrors} onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface TabPanelProps {
  children?: ReactNode
  index: number
  value: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}
