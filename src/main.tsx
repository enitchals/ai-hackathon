import { StrictMode, useEffect, useMemo, useState, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'

const THEMES: Record<string, any> = {
  'Bold Classic': {
    palette: {
      mode: 'light',
      primary: { main: '#241E4E' }, // Russian Violet
      secondary: { main: '#960200' }, // Penn Red
      background: { default: '#FFFFFF', paper: '#FFFFFF' }, // White backgrounds
      text: { primary: '#000000', secondary: '#241E4E' }, // Black text, accent secondary
      info: { main: '#30BCED' }, // Process Cyan
      warning: { main: '#FFD046' }, // Sunglow (for highlights only)
      error: { main: '#960200' },
      success: { main: '#30BCED' },
    },
  },
}

const THEME_KEY = 'global-theme'

const ThemeContext = createContext({
  themeName: 'Bold Classic',
  setThemeName: (name: string) => {},
})

export const useThemeContext = () => useContext(ThemeContext)

function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem(THEME_KEY) || 'Bold Classic')
  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName)
  }, [themeName])
  const value = useMemo(() => ({ themeName, setThemeName }), [themeName])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function Main() {
  const { themeName } = useThemeContext()
  const theme = useMemo(() => createTheme(THEMES[themeName] as any || THEMES['Bold Classic']), [themeName])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <Main />
    </ThemeContextProvider>
  </StrictMode>,
)
