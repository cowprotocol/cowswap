import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo, useState } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material'

import { AddCustomListDialog } from './AddCustomListDialog'

import { TokenListItem } from '../../configurator.types'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

type TokenListScope = 'enabled' | 'enabledForSell' | 'enabledForBuy'

type TokenListControlProps = {
  tokenListUrlsState: [TokenListItem[], Dispatch<SetStateAction<TokenListItem[]>>]
  customTokensState: [TokenInfo[], Dispatch<SetStateAction<TokenInfo[]>>]
}

interface TokenListSelectProps {
  label: string
  labelId: string
  selectedUrls: string[]
  options: ReactNode
  onChange(event: SelectChangeEvent<string[]>): void
}

interface TokenListSelectionsProps {
  tokenListUrls: TokenListItem[]
  onChangeByScope: Record<TokenListScope, (event: SelectChangeEvent<string[]>) => void>
}

const TOKEN_LIST_SELECT_CONFIG: { label: string; labelId: string; scope: TokenListScope }[] = [
  { label: 'Active Token Lists', labelId: 'token-list-chip-label', scope: 'enabled' },
  { label: 'Sell Token Lists', labelId: 'sell-token-list-chip-label', scope: 'enabledForSell' },
  { label: 'Buy Token Lists', labelId: 'buy-token-list-chip-label', scope: 'enabledForBuy' },
]

const getSelectedTokenListUrls = (tokenListUrls: TokenListItem[], scope: TokenListScope): string[] => {
  return tokenListUrls.filter((list) => list[scope]).map((list) => list.url)
}

const getTokenListOptions = (tokenListUrls: TokenListItem[], scope: TokenListScope): ReactNode[] => {
  return [...tokenListUrls]
    .sort((a, b) => {
      if (a[scope] === b[scope]) {
        return a.url.localeCompare(b.url)
      }

      return a[scope] ? -1 : 1
    })
    .map((list) => (
      <MenuItem key={`${scope}-${list.url}`} value={list.url}>
        <Checkbox checked={list[scope]} />
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
    ))
}

function TokenListSelect({ label, labelId, selectedUrls, options, onChange }: TokenListSelectProps): ReactNode {
  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={selectedUrls}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((url) => (
              <Chip key={url} label={url} />
            ))}
          </Box>
        )}
        MenuProps={MENU_PROPS}
      >
        {options}
      </Select>
    </FormControl>
  )
}

function TokenListSelections({ tokenListUrls, onChangeByScope }: TokenListSelectionsProps): ReactNode {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {TOKEN_LIST_SELECT_CONFIG.map(({ label, labelId, scope }) => (
        <TokenListSelect
          key={scope}
          label={label}
          labelId={labelId}
          selectedUrls={getSelectedTokenListUrls(tokenListUrls, scope)}
          options={getTokenListOptions(tokenListUrls, scope)}
          onChange={onChangeByScope[scope]}
        />
      ))}
    </Box>
  )
}

export const TokenListControl = ({ tokenListUrlsState, customTokensState }: TokenListControlProps): ReactNode => {
  const [tokenListUrls, setTokenListUrls] = tokenListUrlsState
  const [customTokens, setCustomTokens] = customTokensState
  const [dialogOpen, setDialogOpen] = useState(false)

  const setTokenListScope = useCallback(
    (scope: TokenListScope, selectedUrls: string[]) => {
      setTokenListUrls((prev) => prev.map((list) => ({ ...list, [scope]: selectedUrls.includes(list.url) })))
    },
    [setTokenListUrls],
  )

  const onChangeByScope = useMemo(
    () => ({
      enabled: (event: SelectChangeEvent<string[]>) => setTokenListScope('enabled', event.target.value as string[]),
      enabledForSell: (event: SelectChangeEvent<string[]>) =>
        setTokenListScope('enabledForSell', event.target.value as string[]),
      enabledForBuy: (event: SelectChangeEvent<string[]>) =>
        setTokenListScope('enabledForBuy', event.target.value as string[]),
    }),
    [setTokenListScope],
  )

  const handleAddListUrl = useCallback(
    (newListUrl: string) => {
      const existing = tokenListUrls.find((list) => list.url.toLowerCase() === newListUrl.toLowerCase())

      if (existing) return

      setTokenListUrls((prev) => [
        ...prev,
        { url: newListUrl, enabled: true, enabledForSell: false, enabledForBuy: false },
      ])
    },
    [tokenListUrls, setTokenListUrls],
  )

  return (
    <>
      <TokenListSelections tokenListUrls={tokenListUrls} onChangeByScope={onChangeByScope} />

      <Box sx={{ mt: 2 }}>
        <AddCustomListDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          customTokens={customTokens}
          onAddListUrl={handleAddListUrl}
          onAddCustomTokens={setCustomTokens}
        />

        <Button sx={{ width: '100%' }} variant="outlined" onClick={() => setDialogOpen(true)}>
          Add Custom List
        </Button>
      </Box>
    </>
  )
}
