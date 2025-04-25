import { StrictMode, useEffect, useMemo, useState, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'

export const THEMES: Record<string, any> = {
  'Bold Classic': {
    palette: {
      mode: 'light',
      primary: { main: '#241E4E' }, // Russian Violet - keeping this dark color for good contrast
      secondary: { main: '#960200' }, // Penn Red - vibrant accent
      background: { default: '#FFFFFF', paper: '#F8F8F8' }, // White with slightly off-white paper
      text: { primary: '#1A1A1A', secondary: '#241E4E' }, // Near-black for best readability
      info: { main: '#30BCED' }, // Process Cyan - vibrant but not harsh
      warning: { main: '#FFD046' }, // Sunglow - warm accent
      error: { main: '#960200' }, // Penn Red for errors
      success: { main: '#2E7D32' }, // Forest Green - standard success color
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: '#FFFFFF',
            },
          },
        },
      },
    },
  },
  'Serene': {
    palette: {
      mode: 'light',
      primary: { main: '#2B5876' }, // Deep Blue - darker version for better contrast
      secondary: { main: '#B7DAE8' }, // Columbia Blue - soft accent
      background: { default: '#EAFFFD', paper: '#EFEFF0' }, // Keeping Azure and Anti-flash White
      text: { primary: '#1A1A1A', secondary: '#2B5876' }, // Near-black and Deep Blue
      info: { main: '#2B5876' }, // Deep Blue for consistency
      warning: { main: '#7C677F' }, // Darker Thistle - better contrast
      error: { main: '#7C677F' }, // Darker Thistle for errors
      success: { main: '#4A7C59' }, // Sage Green - natural success color
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: '#FFFFFF',
            },
          },
        },
      },
    },
  },
}

const THEME_KEY = 'global-theme'

interface ThemeContextType {
  themeName: string;
  setThemeName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'Bold Classic',
  setThemeName: () => {},
});

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
  const theme = useMemo(() => {
    console.log('Applying theme:', themeName);
    console.log('Available themes:', Object.keys(THEMES));
    const themeConfig = THEMES[themeName];
    if (!themeConfig) {
      console.warn('Theme not found:', themeName);
      return createTheme(THEMES['Bold Classic']);
    }
    return createTheme(themeConfig);
  }, [themeName])
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
