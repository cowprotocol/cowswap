import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo, useState } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import { Box, ListItemText } from '@mui/material'
import { Plus } from 'react-feather'

import { AddCustomListDialog } from './AddCustomListDialog'

import { TokenListItem } from '../../configurator.types'
import { LinkButton } from '../ui/buttons/link/LinkButton.component'
import { BASE_SELECT_OPTION_HEIGHT, SelectInput } from '../ui/inputs/Select/SelectInput'
import { multiSelectValueItemSx, selectMultipleSelectedValueSx } from '../ui/inputs/Select/SelectInput.styles'

const ITEM_PADDING_TOP = 8

const MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: BASE_SELECT_OPTION_HEIGHT * 4.5 + ITEM_PADDING_TOP,
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
  name: TokenListScope
  selectedUrls: string[]
  options: { label: string; value: string }[]
  onChange(scope: TokenListScope, selectedUrls: string[]): void
}

interface TokenListSelectionsProps {
  tokenListUrls: TokenListItem[]
  onChangeByScope: Record<TokenListScope, (scope: TokenListScope, selectedUrls: string[]) => void>
}

const TOKEN_LIST_SELECT_CONFIG: { label: string; scope: TokenListScope }[] = [
  { label: 'Active Token Lists', scope: 'enabled' },
  { label: 'Sell Token Lists', scope: 'enabledForSell' },
  { label: 'Buy Token Lists', scope: 'enabledForBuy' },
]

const getSelectedTokenListUrls = (tokenListUrls: TokenListItem[], scope: TokenListScope): string[] => {
  return tokenListUrls.filter((list) => list[scope]).map((list) => list.url)
}

const getTokenListOptions = (
  tokenListUrls: TokenListItem[],
  scope: TokenListScope,
): { label: string; value: string }[] => {
  return [...tokenListUrls]
    .sort((a, b) => {
      if (a[scope] === b[scope]) {
        return a.url.localeCompare(b.url)
      }

      return a[scope] ? -1 : 1
    })
    .map((list) => ({ label: list.url, value: list.url }))
}

function TokenListSelect({ label, name, selectedUrls, options, onChange }: TokenListSelectProps): ReactNode {
  return (
    <SelectInput
      name={name}
      label={label}
      multiple
      multilineSelectedValue
      value={selectedUrls}
      options={options}
      menuProps={MENU_PROPS}
      onChange={(scope, value) => {
        if (!Array.isArray(value)) return
        onChange(scope as TokenListScope, value as string[])
      }}
      renderOptionLabel={(option) => (
        <ListItemText
          primary={option.label}
          disableTypography={true}
          style={{
            fontSize: '13px',
            whiteSpace: 'initial',
            wordBreak: 'break-word',
          }}
        />
      )}
      renderValue={(selected) => (
        <Box sx={selectMultipleSelectedValueSx}>
          {(Array.isArray(selected) ? selected : []).map((url) => (
            <Box key={url} component="span" sx={multiSelectValueItemSx}>
              {url}
            </Box>
          ))}
        </Box>
      )}
    />
  )
}

function TokenListSelections({ tokenListUrls, onChangeByScope }: TokenListSelectionsProps): ReactNode {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {TOKEN_LIST_SELECT_CONFIG.map(({ label, scope }) => (
        <TokenListSelect
          key={scope}
          label={label}
          name={scope}
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
      enabled: (_: TokenListScope, selectedUrls: string[]) => setTokenListScope('enabled', selectedUrls),
      enabledForSell: (_: TokenListScope, selectedUrls: string[]) => setTokenListScope('enabledForSell', selectedUrls),
      enabledForBuy: (_: TokenListScope, selectedUrls: string[]) => setTokenListScope('enabledForBuy', selectedUrls),
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

        <LinkButton label="Add Custom List" endIcon={Plus} onClick={() => setDialogOpen(true)} />
      </Box>
    </>
  )
}
