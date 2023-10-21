import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { ContentStyled, IframeInfo } from './styled'

import { EmbedDialog } from '../configurator/embedDialog'

export interface WidgetIframeProps {
  id: string
  src: string
}

export function WidgetIframe({ id, src }: WidgetIframeProps) {
  return (
    <Box sx={ContentStyled}>
      <iframe id={id} src={src} width="400px" height="640px" title="widget" />

      <Box sx={IframeInfo}>
        <Typography variant="body2">URL: {src}</Typography>
        <EmbedDialog iframeUrl={src} />
      </Box>
    </Box>
  )
}
