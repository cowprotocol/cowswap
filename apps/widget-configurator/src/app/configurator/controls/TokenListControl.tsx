import React, { useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
  TextField,
  SelectChangeEvent,
} from '@mui/material'

import { TOKEN_LISTS } from '../consts'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

type TokenListControlProps = {
  onTokenListSelect: (selectedUrls: string[]) => void
}

export const TokenListControl = ({ onTokenListSelect }: TokenListControlProps) => {
  const [selectedTokenLists, setSelectedTokenLists] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customList, setCustomList] = useState({ name: '', url: '' })

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    setSelectedTokenLists(value)
    onTokenListSelect(value)
  }

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleAddCustomList = () => {
    if (customList.name && customList.url && !TOKEN_LISTS.some((list) => list.url === customList.url)) {
      const newList = { name: customList.name, url: customList.url }
      TOKEN_LISTS.push(newList)
      setSelectedTokenLists([...selectedTokenLists, newList.url])
      onTokenListSelect([...selectedTokenLists, newList.url])
      setCustomList({ name: '', url: '' })
    }
    handleDialogClose()
  }

  return (
    <div>
      <FormControl sx={{ width: '100%' }}>
        <InputLabel id="token-list-checkbox-label">Token Lists</InputLabel>
        <Select
          labelId="token-list-checkbox-label"
          id="token-list-checkbox-select"
          multiple
          value={selectedTokenLists}
          onChange={handleChange}
          input={<OutlinedInput label="Token Lists" />}
          renderValue={(selected) =>
            selected.map((url) => TOKEN_LISTS.find((list) => list.url === url)?.name || url).join(', ')
          }
          MenuProps={MenuProps}
          size="small"
        >
          {TOKEN_LISTS.map((list) => (
            <MenuItem key={list.url} value={list.url}>
              <Checkbox checked={selectedTokenLists.indexOf(list.url) > -1} />
              <ListItemText primary={list.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button onClick={handleDialogOpen}>Add Custom List</Button>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add Custom Token List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="List Name"
            type="text"
            fullWidth
            variant="outlined"
            value={customList.name}
            onChange={(e) => setCustomList({ ...customList, name: e.target.value })}
          />
          <TextField
            margin="dense"
            id="url"
            label="List URL"
            type="url"
            fullWidth
            variant="outlined"
            value={customList.url}
            onChange={(e) => setCustomList({ ...customList, url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddCustomList}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
