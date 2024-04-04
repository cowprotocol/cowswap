import React, { ReactNode, useState } from 'react'

import { Command, TokenInfo } from '@cowprotocol/types'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Tab,
  TextField,
} from '@mui/material'
import Tabs from '@mui/material/Tabs'

import { validateURL } from '../utils/validateURL'

const jsonTextAreaStyles = {
  fontFamily: 'monospace',
  width: '100%',
  height: '200px',
  resize: 'none',
  marginTop: '10px',
}

type AddCustomListDialogProps = {
  open: boolean
  onClose: Command
  onAddListUrl: (newListUrl: string) => void
  onAddCustomTokens: (tokens: TokenInfo[]) => void
}

export function AddCustomListDialog({ open, onClose, onAddListUrl, onAddCustomTokens }: AddCustomListDialogProps) {
  const [customListUrl, setCustomListUrl] = useState<string>('')
  const [hasErrors, setHasErrors] = useState(false)
  const [hasJsonErrors, setHasJsonErrors] = useState(false)

  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([])

  const [tabIndex, setTabIndex] = useState(0)

  const resetForm = () => {
    // Reset custom URL
    setCustomListUrl('')
    setHasErrors(false)

    // Reset custom tokens
    setCustomTokens([])
    setHasJsonErrors(false)
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
    resetForm()
  }

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setCustomListUrl(value)

    setHasErrors(value ? !validateURL(value) : false)
  }

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasJsonErrors(false)

    if (!e.target.value) return

    try {
      const parsedTokens = JSON.parse(e.target.value)

      if (Array.isArray(parsedTokens)) {
        setCustomTokens(parsedTokens)
      } else {
        setHasJsonErrors(true)
      }
    } catch {
      setHasJsonErrors(true)
    }
  }

  const handleSubmit = () => {
    if (customListUrl) {
      onAddListUrl(customListUrl)
    } else if (customTokens.length) {
      onAddCustomTokens(customTokens)
    }

    resetForm()
    onClose()
  }

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
          <textarea style={jsonTextAreaStyles} onChange={handleJsonInputChange}></textarea>
          {hasJsonErrors && <FormHelperText error>Enter valid JSON</FormHelperText>}
        </CustomTabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!hasErrors && !hasJsonErrors} onClick={handleSubmit}>
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
