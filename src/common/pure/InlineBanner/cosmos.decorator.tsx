import React, { useCallback, useContext, ReactNode } from 'react'
import { ThemeContext } from 'styled-components/macro'
import { useDarkModeManager } from 'state/user/hooks'

const DarkModeToggle = ({ children }: { children?: ReactNode }) => {
  const theme = useContext(ThemeContext)
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAux()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDarkModeAux, darkMode])

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={toggleDarkMode}>Toggle DarkMode =&gt; {theme.darkMode ? 'ON' : 'OFF'}</button>
      {children}
    </ThemeContext.Provider>
  );
};

export default DarkModeToggle;
