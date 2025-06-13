import React, { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react'

import { TokenInfo } from '@cowprotocol/types'

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
  tokenListUrlsState: [TokenListItem[], Dispatch<SetStateAction<TokenListItem[]>>]
  customTokensState: [TokenInfo[], Dispatch<SetStateAction<TokenInfo[]>>]
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export const TokenListControl = ({ tokenListUrlsState, customTokensState }: TokenListControlProps) => {
  const [tokenListUrls, setTokenListUrls] = tokenListUrlsState
  const [customTokens, setCustomTokens] = customTokensState

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const selected = event.target.value as string[]

      setTokenListUrls((prev) =>
        prev.map((list) => ({
          ...list,
          enabled: selected.includes(list.url),
        }))
      )
    },
    [setTokenListUrls]
  )

  const handleAddListUrl = useCallback(
    (newListUrl: string) => {
      const existing = tokenListUrls.find((list) => list.url.toLowerCase() === newListUrl.toLowerCase())

      if (existing) return

      setTokenListUrls((prev) => [...prev, { url: newListUrl, enabled: true }])
    },
    [tokenListUrls, setTokenListUrls]
  )

  const handleAddCustomTokens = useCallback(
    (tokens: TokenInfo[]) => {
      setCustomTokens(tokens)
    },
    [setCustomTokens]
  )

  const tokenListOptions = useMemo(
    () =>
      tokenListUrls
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
    [tokenListUrls]
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
            value={tokenListUrls.filter((list) => list.enabled).map((list) => list.url)}
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

        <AddCustomListDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          customTokens={customTokens}
          onAddListUrl={handleAddListUrl}
          onAddCustomTokens={handleAddCustomTokens}
        />
      </div>
      <Button sx={{ width: '100%' }} variant="outlined" onClick={() => setDialogOpen(true)}>
        Add Custom List
      </Button>
    </>
  )
}
