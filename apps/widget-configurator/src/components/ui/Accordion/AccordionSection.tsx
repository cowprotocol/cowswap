import { ReactNode, PropsWithChildren } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface AccordionSectionProps extends PropsWithChildren {
  title: string
  expanded: boolean
  onChange: (expanded: boolean) => void
}

export function AccordionSection({ title, expanded, onChange, children }: AccordionSectionProps): ReactNode {
  return (
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={(_event, isExpanded) => onChange(isExpanded)}
      elevation={0}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '0 !important',
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
      <AccordionDetails sx={{ paddingTop: '8px' }}>
        <Stack spacing={1.6}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  )
}
