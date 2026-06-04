import React, { type ReactNode, useEffect, useState } from 'react'

import { isValidTokenListSource } from '@cowprotocol/common-utils'
import { Command, TokenInfo } from '@cowprotocol/types'

import { Dialog, DialogContent } from '@mui/material'
import { Plus } from 'react-feather'

import { DEFAULT_CUSTOM_TOKENS } from '../../../../configurator.constants'
import { parseCustomTokensInput } from '../../../../utils/parse-custom-tokens-input/parseCustomTokensInput'
import { Button } from '../../../ui/buttons/button/Button.component'
import { JsonInput } from '../../../ui/inputs/JsonInput/JsonInput.component'
import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'
import { ModalFooter } from '../../../ui/surface/modal/footer/ModalFooter.component'
import { ModalHeader } from '../../../ui/surface/modal/header/ModalHeader.component'
import { configuratorDialogBackdropSx, configuratorDialogPaperSx } from '../../../ui/surface/modal/modal.styles'
import { ModalTabPanel } from '../../../ui/surface/modal/tabs/ModalTabPanel.component'
import { ModalLabelTabInfo, ModalTabs } from '../../../ui/surface/modal/tabs/ModalTabs.component'

const ADD_CUSTOM_LIST_TABS_ID_PREFIX = 'add-custom-list'

type AddCustomListTabId = 'url' | 'json'

const ADD_CUSTOM_LIST_TABS = [
  { label: 'URL', value: 'url' },
  { label: 'JSON', value: 'json' },
] as const satisfies ModalLabelTabInfo<AddCustomListTabId>[]

const DEFAULT_ADD_CUSTOM_LIST_TAB_ID = ADD_CUSTOM_LIST_TABS[0].value

interface AddCustomListDialogProps {
  open: boolean
  onClose: Command
  customTokens: TokenInfo[]
  onAddListUrl: (newListUrl: string) => void
  onAddCustomTokens: (tokens: TokenInfo[]) => void
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function AddCustomTokensDialog({
  open,
  onClose,
  onAddListUrl,
  onAddCustomTokens,
  customTokens: customTokensDefault,
}: AddCustomListDialogProps): ReactNode {
  const [customListUrl, setCustomListUrl] = useState<string>('')
  const [hasErrors, setHasErrors] = useState(false)
  const [hasJsonErrors, setHasJsonErrors] = useState(false)
  const [customTokensJson, setCustomTokensJson] = useState<string | null>('')

  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([])

  const [tabValue, setTabValue] = useState<AddCustomListTabId>(DEFAULT_ADD_CUSTOM_LIST_TAB_ID)

  const resetForm = (): void => {
    // Reset custom URL
    setCustomListUrl('')
    setHasErrors(false)

    // Reset custom tokens
    setCustomTokens([])
    setHasJsonErrors(false)
    setCustomTokensJson('')
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: AddCustomListTabId): void => {
    setTabValue(newValue)
    resetForm()
  }

  const handleUrlInputChange = (_name: string, value: string | null): void => {
    const urlValue = value ?? ''

    setCustomListUrl(urlValue)
    setHasErrors(urlValue ? !isValidTokenListSource(urlValue) : false)
  }

  const handleJsonInputChange = (_name: string, value: string | null): void => {
    setHasJsonErrors(false)
    setCustomTokensJson(value)

    if (!value?.trim()) {
      setCustomTokens([])
      return
    }

    try {
      const parsedTokens = parseCustomTokensInput(value)

      if (parsedTokens) {
        setCustomTokens(parsedTokens)
      } else {
        setHasJsonErrors(true)
      }
    } catch {
      setHasJsonErrors(true)
    }
  }

  const handleSubmit = (): void => {
    if (customListUrl) {
      onAddListUrl(customListUrl)
      resetForm()
    } else if (customTokens.length) {
      onAddCustomTokens(customTokens)
    }

    onClose()
  }

  const addJsonExample = (): void => {
    setCustomTokensJson(JSON.stringify(DEFAULT_CUSTOM_TOKENS, null, 2))
    setCustomTokens(DEFAULT_CUSTOM_TOKENS)
    setHasJsonErrors(false)
  }

  useEffect(() => {
    if (customTokensDefault.length) {
      setCustomTokens(customTokensDefault)
    }
  }, [customTokensDefault])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-custom-token-list-title"
      PaperProps={{ sx: configuratorDialogPaperSx }}
      slotProps={{ backdrop: { sx: configuratorDialogBackdropSx } }}
    >
      <ModalHeader titleId="add-custom-token-list-title" title="Add Custom Token List" onClose={onClose}>
        <ModalTabs
          tabs={ADD_CUSTOM_LIST_TABS}
          value={tabValue}
          onChange={handleTabChange}
          ariaLabel="Add custom token list input type"
          idPrefix={ADD_CUSTOM_LIST_TABS_ID_PREFIX}
          sx={{ px: 2 }}
        />
      </ModalHeader>

      <DialogContent sx={{ px: 2, pt: 2, pb: 2 }}>
        <ModalTabPanel tabValue={tabValue} value="url" idPrefix={ADD_CUSTOM_LIST_TABS_ID_PREFIX}>
          <TextInput
            name="listUrl"
            label="List URL"
            type="url"
            value={customListUrl}
            onChange={handleUrlInputChange}
            error={hasErrors}
            helperText={hasErrors ? 'Enter a valid URL' : undefined}
            required
            autoComplete="off"
          />
        </ModalTabPanel>
        <ModalTabPanel tabValue={tabValue} value="json" idPrefix={ADD_CUSTOM_LIST_TABS_ID_PREFIX}>
          <JsonInput
            name="customTokensJson"
            label="Custom tokens JSON"
            value={customTokensJson}
            onChange={handleJsonInputChange}
            error={hasJsonErrors}
            helperText={hasJsonErrors ? 'Enter a token array or token list JSON' : undefined}
          />
          <Button label="Add an example" onClick={addJsonExample} sx={{ mt: 1 }} />
        </ModalTabPanel>
      </DialogContent>

      <ModalFooter>
        <Button label="Add" disabled={hasErrors || hasJsonErrors} onClick={handleSubmit} endIcon={Plus} />
      </ModalFooter>
    </Dialog>
  )
}
