import { type ReactNode, useCallback, useState } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'

import { Box } from '@mui/material'
import { Plus } from 'react-feather'

import { AddCustomTokensDialog } from './dialog/AddCustomTokensDialog.component'
import {
  PRIORITIZED_TOKENS_HELPER_TEXT,
  TOKEN_LIST_HELPER_TEXT_BY_SCOPE,
  TOKEN_LIST_MENU_PROPS,
  TOKEN_LIST_SELECT_CONFIG,
} from './TokensSectionForm.constants'
import {
  appendTokenListUrl,
  getSelectedTokenListUrls,
  getTokenListOptions,
  updateTokenListScope,
  type TokenListScope,
} from './TokensSectionForm.utils'

import { LinkButton } from '../../ui/buttons/link/LinkButton.component'
import { CurrencyInputControl } from '../../ui/inputs/CurrencyInput/CurrencyInputControl'
import { MultiSelectInput } from '../../ui/inputs/Select/multi/MultiSelectInput.component'
import { TextareaInput } from '../../ui/inputs/TextareaInput/TextareaInput.component'

import type { SidebarSectionFormProps } from '../forms.types'

export function TokensSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const [dialogOpen, setDialogOpen] = useState(false)

  const setTokenListScope = useCallback(
    (scope: TokenListScope, selectedUrls: string[]) => {
      onChange('tokenListUrls', updateTokenListScope(values.tokenListUrls, scope, selectedUrls))
    },
    [onChange, values.tokenListUrls],
  )

  const handleAddListUrl = useCallback(
    (newListUrl: string) => {
      const nextTokenListUrls = appendTokenListUrl(values.tokenListUrls, newListUrl)

      if (!nextTokenListUrls) return

      onChange('tokenListUrls', nextTokenListUrls)
    },
    [onChange, values.tokenListUrls],
  )

  return (
    <>
      <CurrencyInputControl
        label="Sell token"
        name="sellToken"
        tokenValue={values.sellToken}
        tokenAmountValue={values.sellTokenAmount}
        onChange={onChange}
      />
      <CurrencyInputControl
        label="Buy token"
        name="buyToken"
        tokenValue={values.buyToken}
        tokenAmountValue={values.buyTokenAmount}
        onChange={onChange}
      />
      <TextareaInput
        name="prioritizedTokensText"
        label={`Prioritized tokens (${CHAIN_INFO[values.chainId]?.label ?? values.chainId})`}
        placeholder="One address per line"
        helperText={PRIORITIZED_TOKENS_HELPER_TEXT}
        value={values.prioritizedTokensText[values.chainId] ?? ''}
        onChange={(_, text) =>
          onChange('prioritizedTokensText', { ...values.prioritizedTokensText, [values.chainId]: text ?? '' })
        }
      />

      {TOKEN_LIST_SELECT_CONFIG.map(({ label, scope }) => (
        <MultiSelectInput
          key={scope}
          name={scope}
          label={label}
          helperText={TOKEN_LIST_HELPER_TEXT_BY_SCOPE[scope]}
          value={getSelectedTokenListUrls(values.tokenListUrls, scope)}
          options={getTokenListOptions(values.tokenListUrls, scope)}
          withSeparator={false}
          menuProps={TOKEN_LIST_MENU_PROPS}
          onChange={(_, selectedUrls) => setTokenListScope(scope, selectedUrls)}
        />
      ))}

      <AddCustomTokensDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customTokens={values.customTokens}
        onAddListUrl={handleAddListUrl}
        onAddCustomTokens={(tokens) => onChange('customTokens', tokens)}
      />

      <Box>
        <LinkButton label="Add Custom List" endIcon={Plus} onClick={() => setDialogOpen(true)} />
      </Box>
    </>
  )
}
