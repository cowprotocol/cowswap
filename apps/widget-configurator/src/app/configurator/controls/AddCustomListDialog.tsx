import React, { ReactNode, useState } from 'react'

import { Command } from '@cowprotocol/types'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, TextField } from '@mui/material'
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
  onAdd: (newList: string) => void
}

export function AddCustomListDialog({ open, onClose, onAdd }: AddCustomListDialogProps) {
  const [customListUrl, setCustomListUrl] = useState<string>('')
  const [hasErrors, setHasErrors] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)

    // Reset the custom list
    setCustomListUrl('')
    setHasErrors(false)
  }

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomListUrl(e.target.value)

    setHasErrors(!validateURL(e.target.value))
  }

  const handleAdd = () => {
    const isUrlValid = validateURL(customListUrl)

    setHasErrors(!isUrlValid)

    if (isUrlValid) {
      onAdd(customListUrl)
      setCustomListUrl('') // Reset the custom list
      onClose()
    }
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
          <textarea style={jsonTextAreaStyles}></textarea>
        </CustomTabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd}>Add</Button>
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
