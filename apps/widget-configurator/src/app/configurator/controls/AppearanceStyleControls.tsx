import type { ChangeEvent, ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { JsonState, OnJsonStateChange } from '../hooks/useJsonState'
import type * as CSS from 'csstype'

export interface AppearanceStyleControlsProps {
  iframeStyleJson: JsonState<CSS.Properties>
  onIframeStyleJson: OnJsonStateChange<CSS.Properties>
  appWrapperStyleJson: JsonState<CSS.Properties>
  onAppWrapperStyleJson: OnJsonStateChange<CSS.Properties>
  bodyWrapperStyleJson: JsonState<CSS.Properties>
  onBodyWrapperStyleJson: OnJsonStateChange<CSS.Properties>
  cardStyleJson: JsonState<CSS.Properties>
  onCardStyleJson: OnJsonStateChange<CSS.Properties>
}

function jsonHelperText(hasError: boolean): string {
  return hasError ? 'Invalid JSON.' : 'Optional. CamelCase CSS properties as JSON, e.g. {"padding": "12px"}'
}

// eslint-disable-next-line max-lines-per-function
export function AppearanceStyleControls({
  iframeStyleJson,
  onIframeStyleJson,
  appWrapperStyleJson,
  onAppWrapperStyleJson,
  bodyWrapperStyleJson,
  onBodyWrapperStyleJson,
  cardStyleJson,
  onCardStyleJson,
}: AppearanceStyleControlsProps): ReactNode {
  // Individual fields change handlers:
  const handleIframeFieldChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onIframeStyleJson(e.target.name.split('.')[1] as keyof CSS.Properties, e.target.value)
  }
  const handleAppWrapperFieldChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onAppWrapperStyleJson(e.target.name.split('.')[1] as keyof CSS.Properties, e.target.value)
  }
  const handleBodyWrapperFieldChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onBodyWrapperStyleJson(e.target.name.split('.')[1] as keyof CSS.Properties, e.target.value)
  }
  const handleCardFieldChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onCardStyleJson(e.target.name.split('.')[1] as keyof CSS.Properties, e.target.value)
  }

  // JSON fields change handlers:
  const handleIframeJsonChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onIframeStyleJson(null, e.target.value)
  }
  const handleBodyWrapperJsonChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onBodyWrapperStyleJson(null, e.target.value)
  }
  const handleAppWrapperJsonChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onAppWrapperStyleJson(null, e.target.value)
  }
  const handleCardJsonChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onCardStyleJson(null, e.target.value)
  }

  return (
    <Stack spacing={2.4}>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Iframe (host)
        </Typography>
        <Stack spacing={1.2}>
          <TextField
            fullWidth
            margin="dense"
            name="iframe.boxShadow"
            label="Iframe boxShadow"
            value={iframeStyleJson.fields.boxShadow}
            onChange={handleIframeFieldChange}
            size="medium"
            placeholder="e.g. 0 8px 24px rgba(0,0,0,0.12)"
          />
          <TextField
            fullWidth
            margin="dense"
            name="iframe.border"
            label="Iframe border"
            value={iframeStyleJson.fields.border}
            onChange={handleIframeFieldChange}
            size="medium"
            placeholder="e.g. 1px solid rgba(0,0,0,0.08)"
          />
          <TextField
            fullWidth
            margin="dense"
            name="iframe.style"
            label="Iframe styles (JSON)"
            value={iframeStyleJson.rawJsonValue}
            onChange={handleIframeJsonChange}
            size="medium"
            multiline
            minRows={4}
            error={iframeStyleJson.error}
            helperText={jsonHelperText(iframeStyleJson.error)}
          />
        </Stack>
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #appWrapper (inside iframe)
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          name="appWrapper.boxShadow"
          label="App wrapper boxShadow"
          value={appWrapperStyleJson.fields.boxShadow}
          onChange={handleAppWrapperFieldChange}
          size="medium"
          placeholder="Host-level wrapper style inside iframe app"
        />
        <TextField
          fullWidth
          margin="dense"
          name="appWrapper.border"
          label="App wrapper border"
          value={appWrapperStyleJson.fields.border}
          onChange={handleAppWrapperFieldChange}
          size="medium"
        />
        <TextField
          fullWidth
          margin="dense"
          name="appWrapper.style"
          label="App wrapper styles (JSON)"
          value={appWrapperStyleJson.rawJsonValue}
          onChange={handleAppWrapperJsonChange}
          size="medium"
          multiline
          minRows={4}
          error={appWrapperStyleJson.error}
          helperText={jsonHelperText(appWrapperStyleJson.error)}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #bodyWrapper (inside iframe)
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          name="bodyWrapper.boxShadow"
          label="Body wrapper boxShadow"
          value={bodyWrapperStyleJson.fields.boxShadow}
          onChange={handleBodyWrapperFieldChange}
          size="medium"
          placeholder="Overrides theme card shadow when set"
        />
        <TextField
          fullWidth
          margin="dense"
          name="bodyWrapper.border"
          label="Body wrapper border"
          value={bodyWrapperStyleJson.fields.border}
          onChange={handleBodyWrapperFieldChange}
          size="medium"
        />
        <TextField
          fullWidth
          margin="dense"
          name="bodyWrapper.style"
          label="Body wrapper styles (JSON)"
          value={bodyWrapperStyleJson.rawJsonValue}
          onChange={handleBodyWrapperJsonChange}
          size="medium"
          multiline
          minRows={4}
          error={bodyWrapperStyleJson.error}
          helperText={jsonHelperText(bodyWrapperStyleJson.error)}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #card (inside iframe)
        </Typography>
        <Stack spacing={1.2}>
          <TextField
            fullWidth
            margin="dense"
            name="card.boxShadow"
            label="Card boxShadow"
            value={cardStyleJson.fields.boxShadow}
            onChange={handleCardFieldChange}
            size="medium"
            placeholder="Overrides theme card shadow when set"
          />
          <TextField
            fullWidth
            margin="dense"
            name="card.border"
            label="Card border"
            value={cardStyleJson.fields.border}
            onChange={handleCardFieldChange}
            size="medium"
          />
          <TextField
            fullWidth
            margin="dense"
            name="card.style"
            label="Card styles (JSON)"
            value={cardStyleJson.rawJsonValue}
            onChange={handleCardJsonChange}
            size="medium"
            multiline
            minRows={4}
            error={cardStyleJson.error}
            helperText={jsonHelperText(cardStyleJson.error)}
          />
        </Stack>
      </Box>
    </Stack>
  )
}
