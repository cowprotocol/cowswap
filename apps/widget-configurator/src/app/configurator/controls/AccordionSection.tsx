import { ReactNode } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface AccordionSectionProps {
  title: string
  defaultExpanded?: boolean
  children: ReactNode
}

export function AccordionSection({ title, defaultExpanded = false, children }: AccordionSectionProps): ReactNode {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      elevation={0}
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '1.2rem',
        overflow: 'hidden',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: '4.8rem',
          '& .MuiAccordionSummary-content': {
            margin: '1rem 0',
          },
        }}
      >
        <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingTop: 0 }}>
        <Stack spacing={1.6}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  )
}
