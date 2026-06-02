import React, { ReactNode, useEffect, useState } from 'react'

import { isValidTokenListSource } from '@cowprotocol/common-utils'
import { Command, TokenInfo } from '@cowprotocol/types'

import { Dialog, DialogContent, Tab, Tabs } from '@mui/material'
import { Plus } from 'react-feather'

import { DEFAULT_CUSTOM_TOKENS } from '../../configurator.constants'
import { parseCustomTokensInput } from '../../utils/parseCustomTokensInput'
import { Button } from '../ui/buttons/button/Button.component'
import { JsonInput } from '../ui/inputs/JsonInput/JsonInput.component'
import { TextInput } from '../ui/inputs/TextInput/TextInput.component'
import { ModalFooter } from '../ui/surface/modal/footer/ModalFooter.component'
import { ModalHeader } from '../ui/surface/modal/header/ModalHeader.component'
import { configuratorDialogPaperSx } from '../ui/surface/modal/modal.styles'

type AddCustomListDialogProps = {
  open: boolean
  onClose: Command
  customTokens: TokenInfo[]
  onAddListUrl: (newListUrl: string) => void
  onAddCustomTokens: (tokens: TokenInfo[]) => void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AddCustomListDialog({
  open,
  onClose,
  onAddListUrl,
  onAddCustomTokens,
  customTokens: customTokensDefault,
}: AddCustomListDialogProps) {
  const [customListUrl, setCustomListUrl] = useState<string>('')
  const [hasErrors, setHasErrors] = useState(false)
  const [hasJsonErrors, setHasJsonErrors] = useState(false)
  const [customTokensJson, setCustomTokensJson] = useState<string | null>('')

  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([])

  const [tabIndex, setTabIndex] = useState(0)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const resetForm = () => {
    // Reset custom URL
    setCustomListUrl('')
    setHasErrors(false)

    // Reset custom tokens
    setCustomTokens([])
    setHasJsonErrors(false)
    setCustomTokensJson('')
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
    resetForm()
  }

  // TODO: Add proper return type annotation

  const handleUrlInputChange = (_name: string, value: string | null): void => {
    const urlValue = value ?? ''

    setCustomListUrl(urlValue)
    setHasErrors(urlValue ? !isValidTokenListSource(urlValue) : false)
  }

  // TODO: Add proper return type annotation

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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = () => {
    if (customListUrl) {
      onAddListUrl(customListUrl)
      resetForm()
    } else if (customTokens.length) {
      onAddCustomTokens(customTokens)
    }

    onClose()
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addJsonExample = () => {
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
    >
      <ModalHeader
        titleId="add-custom-token-list-title"
        title="Add Custom Token List"
        onClose={onClose}
        tabs={
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="Add custom token list input type"
            sx={{ minHeight: 48 }}
          >
            <Tab label="URL" id="add-custom-list-tab-0" aria-controls="add-custom-list-tabpanel-0" />
            <Tab label="JSON" id="add-custom-list-tab-1" aria-controls="add-custom-list-tabpanel-1" />
          </Tabs>
        }
      />

      <DialogContent sx={{ px: 2, pt: 2, pb: 2 }}>
        <CustomTabPanel value={tabIndex} index={0}>
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
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={1}>
          <JsonInput
            name="customTokensJson"
            label="Custom tokens JSON"
            value={customTokensJson}
            onChange={handleJsonInputChange}
            error={hasJsonErrors}
            helperText={hasJsonErrors ? 'Enter a token array or token list JSON' : undefined}
          />
          <Button label="Add an example" onClick={addJsonExample} sx={{ mt: 1 }} />
        </CustomTabPanel>
      </DialogContent>

      <ModalFooter>
        <Button label="Add" disabled={hasErrors || hasJsonErrors} onClick={handleSubmit} endIcon={Plus} />
      </ModalFooter>
    </Dialog>
  )
}

interface TabPanelProps {
  children?: ReactNode
  index: number
  value: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`add-custom-list-tabpanel-${index}`}
      aria-labelledby={`add-custom-list-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}
