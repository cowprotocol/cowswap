// Define our theme properties
interface ThemeProperties {
  darkMode: boolean
  mode: string
  primary: string
  background: string
}

// Augment the DefaultTheme interface
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeProperties {}
}

// Export the theme type for use in other files
export type Theme = ThemeProperties
