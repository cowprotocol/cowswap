import type { ChangeEvent, ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { jsonHelperText } from '../../utils/jsonFieldParsing'

import type { JsonState, OnJsonStateChange } from '../../hooks/useJsonState'
import type * as CSS from 'csstype'

export interface AppearanceStyleControlsProps {
  iframeStyleJson: JsonState<CSS.Properties>
  onIframeStyleJson: OnJsonStateChange
  appWrapperStyleJson: JsonState<CSS.Properties>
  onAppWrapperStyleJson: OnJsonStateChange
  bodyWrapperStyleJson: JsonState<CSS.Properties>
  onBodyWrapperStyleJson: OnJsonStateChange
  cardStyleJson: JsonState<CSS.Properties>
  onCardStyleJson: OnJsonStateChange
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

  const handlePresentNone = (): void => {
    onIframeStyleJson(null, JSON.stringify({}))
  }
  const handlePresentBottomRightPopup = (): void => {
    onIframeStyleJson(
      null,
      JSON.stringify(
        {
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          boxShadow: '0 0 32px 0 black',
          borderRadius: '8px',
          width: '420px',
          maxHeight: 'calc(100lvh - 48px)',
        },
        null,
        2,
      ),
    )

    onBodyWrapperStyleJson(
      null,
      JSON.stringify(
        {
          padding: '0',
        },
        null,
        2,
      ),
    )

    onCardStyleJson(
      null,
      JSON.stringify(
        {
          borderRadius: '0',
        },
        null,
        2,
      ),
    )
  }
  const handlePresentRightSidebar = (): void => {
    onIframeStyleJson(
      null,
      JSON.stringify(
        {
          position: 'fixed',
          top: '0',
          bottom: '0',
          right: '0',
          boxShadow: '0 0 32px 0 black',
          borderRadius: '0',
          width: '420px',
          height: '100dvh',
        },
        null,
        2,
      ),
    )

    onBodyWrapperStyleJson(
      null,
      JSON.stringify(
        {
          padding: '0',
        },
        null,
        2,
      ),
    )

    onCardStyleJson(
      null,
      JSON.stringify(
        {
          borderRadius: '0',
        },
        null,
        2,
      ),
    )
  }
  const handlePresentModal = (): void => {
    onIframeStyleJson(null, JSON.stringify({}))
  }
  const handlePresentFullScreen = (): void => {
    onIframeStyleJson(null, JSON.stringify({}))
  }
  const handlePresentFullSizeBlock = (): void => {
    onIframeStyleJson(null, JSON.stringify({}))
  }

  return (
    <Stack spacing={2.4}>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Presents
        </Typography>

        <Button variant="contained" color="primary" onClick={handlePresentNone}>
          None
        </Button>
        <Button variant="contained" color="primary" onClick={handlePresentBottomRightPopup}>
          Bottom right popup
        </Button>
        <Button variant="contained" color="primary" onClick={handlePresentRightSidebar}>
          Right sidebar
        </Button>
        <Button variant="contained" color="primary" onClick={handlePresentModal}>
          Modal
        </Button>
        <Button variant="contained" color="primary" onClick={handlePresentFullScreen}>
          Full-screen
        </Button>
        <Button variant="contained" color="primary" onClick={handlePresentFullSizeBlock}>
          Full-size block
        </Button>

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
