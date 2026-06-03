import { type ReactNode, useCallback, useState } from 'react'

import { Box } from '@mui/material'
import { Plus } from 'react-feather'

import { AddCustomTokensDialog } from './dialog/AddCustomTokensDialog.component'
import { TOKEN_LIST_MENU_PROPS, TOKEN_LIST_SELECT_CONFIG } from './TokensSectionForm.constants'
import {
  appendTokenListUrl,
  getSelectedTokenListUrls,
  getTokenListOptions,
  updateTokenListScope,
  type TokenListScope,
} from './TokensSectionForm.utils'

import { LinkButton } from '../../../ui/buttons/link/LinkButton.component'
import { CurrencyInputControl } from '../../../ui/inputs/CurrencyInput/CurrencyInputControl'
import { MultiSelectInput } from '../../../ui/inputs/Select/multi/MultiSelectInput.component'

import type { SidebarSectionFormProps } from '../section.types'

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

      {TOKEN_LIST_SELECT_CONFIG.map(({ label, scope }) => (
        <MultiSelectInput
          key={scope}
          name={scope}
          label={label}
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
