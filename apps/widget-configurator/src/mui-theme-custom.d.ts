import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    cow: {
      background: string // You can use Palette['primary'] if it shares the same shape
      gradient: string
    }
  }

  interface PaletteOptions {
    cow?: {
      background: string // You can use PaletteOptions['primary'] if it shares the same shape
      gradient: string
    }
  }
}
