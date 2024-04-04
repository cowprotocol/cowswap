import React, { ReactNode, useState } from 'react'

import { Command } from '@cowprotocol/types'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, TextField } from '@mui/material'
import Tabs from '@mui/material/Tabs'

type CustomList = {
  url: string
}

type AddCustomListDialogProps = {
  open: boolean
  onClose: Command
  onAdd: (newList: CustomList) => void
}

export function AddCustomListDialog({ open, onClose, onAdd }: AddCustomListDialogProps) {
  const [customList, setCustomList] = useState<CustomList>({ url: '' })
  const [errors, setErrors] = useState({ url: false })
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  const validateURL = (url: string) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // fragment locator
    return !!pattern.test(url)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setCustomList({ ...customList, [id]: value })

    setErrors({ ...errors, url: !validateURL(value) })
  }

  const handleAdd = () => {
    const isUrlValid = validateURL(customList.url)

    setErrors({
      url: !isUrlValid,
    })

    if (isUrlValid) {
      onAdd(customList)
      setCustomList({ url: '' }) // Reset the custom list
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Token List</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="URL" />
            <Tab label="JSON" />
          </Tabs>
        </Box>
        <CustomTabPanel value={tabIndex} index={0}>
          <TextField
            error={errors.url}
            margin="dense"
            id="url"
            label="List URL"
            type="url"
            fullWidth
            variant="outlined"
            value={customList.url}
            onChange={handleInputChange}
            helperText={errors.url && 'Enter a valid URL'}
            required
            autoComplete="off"
          />
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={1}>
          {/*TODO: Add JSON input*/}
          <textarea></textarea>
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
