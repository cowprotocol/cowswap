import { TypographyOptions } from '@mui/material/styles/createTypography'

export const commonTypography: TypographyOptions = {
  fontFamily: '"Inter var", "Inter", sans-serif',
  htmlFontSize: 10,
  button: {
    textTransform: 'none' as const,
  },
}
