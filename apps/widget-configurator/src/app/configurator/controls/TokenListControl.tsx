import React, { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react'

import {
  Checkbox,
  Button,
  OutlinedInput,
  InputLabel,
  ListItemText,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Chip,
  Box,
} from '@mui/material'

import { AddCustomListDialog } from './AddCustomListDialog'

import { TokenListItem } from '../types'

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
  tokenListsState: [TokenListItem[], Dispatch<SetStateAction<TokenListItem[]>>]
}

export const TokenListControl = ({ tokenListsState }: TokenListControlProps) => {
  const [tokenLists, setTokenLists] = tokenListsState
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const selected = event.target.value as string[]

      setTokenLists((prev) =>
        prev.map((list) => ({
          ...list,
          enabled: selected.includes(list.url),
        }))
      )
    },
    [setTokenLists]
  )

  const handleAddCustomList = useCallback(
    (newList: { url: string }) => {
      const existing = tokenLists.find((list) => list.url.toLowerCase() === newList.url.toLowerCase())

      if (existing) return

      setTokenLists((prev) => [...prev, { ...newList, enabled: true }])
    },
    [tokenLists, setTokenLists]
  )

  const tokenListOptions = useMemo(
    () =>
      tokenLists
        .sort((a, b) => {
          if (a.enabled) return -1

          return a.url.length > b.url.length ? 1 : -1
        })
        .map((list) => (
          <MenuItem key={list.url} value={list.url}>
            <Checkbox checked={list.enabled} />
            <ListItemText
              primary={list.url}
              disableTypography={true}
              style={{
                fontSize: '13px',
                whiteSpace: 'initial',
                wordBreak: 'break-word',
              }}
            />
          </MenuItem>
        )),
    [tokenLists]
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
            value={tokenLists.filter((list) => list.enabled).map((list) => list.url)}
            onChange={handleChange}
            input={<OutlinedInput label="Active Token Lists" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((url) => (
                  <Chip key={url} label={url} />
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
