import React, { useState, useCallback, useMemo } from 'react'

import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  OutlinedInput,
  InputLabel,
  ListItemText,
  MenuItem,
  FormControl,
  Select,
  TextField,
  SelectChangeEvent,
  Chip,
  Box,
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
  initialSelectedTokenLists: string[]
}

type CustomList = {
  name: string
  url: string
}

type AddCustomListDialogProps = {
  open: boolean
  onClose: () => void
  onAdd: (newList: CustomList) => void
}

const AddCustomListDialog = ({ open, onClose, onAdd }: AddCustomListDialogProps) => {
  const [customList, setCustomList] = useState<CustomList>({ name: '', url: '' })
  const [errors, setErrors] = useState({ name: false, url: false })

  const validateName = (name: string) => {
    return name.trim() !== ''
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

    if (id === 'name') {
      setErrors({ ...errors, name: !validateName(value) })
    } else if (id === 'url') {
      setErrors({ ...errors, url: !validateURL(value) })
    }
  }

  const handleAdd = () => {
    const isNameValid = validateName(customList.name)
    const isUrlValid = validateURL(customList.url)

    setErrors({
      name: !isNameValid,
      url: !isUrlValid,
    })

    if (isNameValid && isUrlValid) {
      onAdd(customList)
      setCustomList({ name: '', url: '' }) // Reset the custom list
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Token List</DialogTitle>
      <DialogContent>
        <TextField
          error={errors.name}
          autoFocus
          margin="dense"
          id="name"
          label="List Name"
          type="text"
          fullWidth
          variant="outlined"
          value={customList.name}
          onChange={handleInputChange}
          helperText={errors.name && 'Name cannot be empty'}
          required
        />
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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}

export const TokenListControl = ({ onTokenListSelect, initialSelectedTokenLists }: TokenListControlProps) => {
  const [selectedTokenLists, setSelectedTokenLists] = useState<string[]>(initialSelectedTokenLists)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value as string[]
      setSelectedTokenLists(value)
      onTokenListSelect(value)
    },
    [onTokenListSelect]
  )

  const handleAddCustomList = useCallback(
    (newList: CustomList) => {
      if (!TOKEN_LISTS.some((list) => list.url === newList.url)) {
        TOKEN_LISTS.push(newList)
        setSelectedTokenLists((prev) => [...prev, newList.url])
        onTokenListSelect([...selectedTokenLists, newList.url])
      }
    },
    [selectedTokenLists, onTokenListSelect]
  )

  const tokenListOptions = useMemo(
    () =>
      TOKEN_LISTS.map((list) => (
        <MenuItem key={list.url} value={list.url}>
          <Checkbox checked={selectedTokenLists.includes(list.url)} />
          <ListItemText primary={list.name} />
        </MenuItem>
      )),
    [selectedTokenLists]
  )

  return (
    <>
      <div>
        <FormControl sx={{ width: '100%' }}>
          <InputLabel id="token-list-chip-label">Active Token Lists</InputLabel>
          <Select
            labelId="token-list-chip-label"
            id="token-list-chip-select"
            multiple
            value={selectedTokenLists}
            onChange={handleChange}
            input={<OutlinedInput label="Active Token Lists" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((url) => (
                  <Chip key={url} label={TOKEN_LISTS.find((list) => list.url === url)?.name || url} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {tokenListOptions}
          </Select>
        </FormControl>

        <AddCustomListDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={handleAddCustomList} />
      </div>
      <Button sx={{ width: '100%' }} variant="outlined" onClick={() => setDialogOpen(true)}>
        Add Custom List
      </Button>
    </>
  )
}
