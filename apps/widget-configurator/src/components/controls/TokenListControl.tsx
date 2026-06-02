import { ReactNode, useCallback, useMemo, useState } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import { Box } from '@mui/material'
import { Plus } from 'react-feather'

import { AddCustomListDialog } from './AddCustomListDialog'

import { TokenListItem } from '../../configurator.types'
import { LinkButton } from '../ui/buttons/link/LinkButton.component'
import { BASE_SELECT_OPTION_HEIGHT } from '../ui/inputs/Select/base/BaseSelectInput.styles'
import { MultiSelectInput } from '../ui/inputs/Select/multi/MultiSelectInput.component'

import type { ConfiguratorFormChangeHandler } from '../sidebar/sections/section.types'

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

interface TokenListControlProps {
  tokenListUrls: TokenListItem[]
  customTokens: TokenInfo[]
  onChange: ConfiguratorFormChangeHandler
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
    <MultiSelectInput
      name={name}
      label={label}
      value={selectedUrls}
      options={options}
      withSeparator={false}
      menuProps={MENU_PROPS}
      onChange={(scope, value) => onChange(scope as TokenListScope, value)}
    />
  )
}

function TokenListSelections({ tokenListUrls, onChangeByScope }: TokenListSelectionsProps): ReactNode {
  return (
    <>
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
    </>
  )
}

export const TokenListControl = ({ tokenListUrls, customTokens, onChange }: TokenListControlProps): ReactNode => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const setTokenListScope = useCallback(
    (scope: TokenListScope, selectedUrls: string[]) => {
      onChange(
        'tokenListUrls',
        tokenListUrls.map((list) => ({ ...list, [scope]: selectedUrls.includes(list.url) })),
      )
    },
    [onChange, tokenListUrls],
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

      onChange('tokenListUrls', [
        ...tokenListUrls,
        { url: newListUrl, enabled: true, enabledForSell: false, enabledForBuy: false },
      ])
    },
    [onChange, tokenListUrls],
  )

  return (
    <>
      <TokenListSelections tokenListUrls={tokenListUrls} onChangeByScope={onChangeByScope} />

      <AddCustomListDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customTokens={customTokens}
        onAddListUrl={handleAddListUrl}
        onAddCustomTokens={(tokens) => onChange('customTokens', tokens)}
      />

      <Box>
        <LinkButton label="Add Custom List" endIcon={Plus} onClick={() => setDialogOpen(true)} />
      </Box>
    </>
  )
}
