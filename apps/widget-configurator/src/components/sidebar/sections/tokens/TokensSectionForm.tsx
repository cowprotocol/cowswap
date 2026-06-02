import { type ReactNode, useCallback, useState } from 'react'

import { Box } from '@mui/material'
import { Plus } from 'react-feather'

import { TOKEN_LIST_MENU_PROPS, TOKEN_LIST_SELECT_CONFIG } from './TokensSectionForm.constants'
import {
  appendTokenListUrl,
  getSelectedTokenListUrls,
  getTokenListOptions,
  updateTokenListScope,
  type TokenListScope,
} from './TokensSectionForm.utils'

import { AddCustomListDialog } from '../../../controls/AddCustomListDialog'
import { LinkButton } from '../../../ui/buttons/link/LinkButton.component'
import { CurrencyInputControl } from '../../../ui/inputs/CurrencyInput/CurrencyInputControl'
import { MultiSelectInput } from '../../../ui/inputs/Select/multi/MultiSelectInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface TokensSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function TokensSectionForm({ values, onChange }: TokensSectionFormProps): ReactNode {
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

      <AddCustomListDialog
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
