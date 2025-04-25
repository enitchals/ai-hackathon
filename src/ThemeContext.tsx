import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme, PaletteMode } from '@mui/material';

// Theme names
export const themes = [
  'Bold Classic',
  'Serene',
] as const;
export type Theme = typeof themes[number];

// Define ThemeConfig type for the theme object if not already defined
interface ThemeConfig {
  palette: {
    mode: PaletteMode;
    primary: { main: string };
    secondary: { main: string };
    background: { default: string; paper: string };
    text: { primary: string; secondary: string };
    info: { main: string };
    warning: { main: string };
    error: { main: string };
    success: { main: string };
  };
  components?: any;
}

export const THEMES: Record<string, ThemeConfig> = {
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
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within a ThemeProvider');
  return context;
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeName: Theme;
  setThemeName: (themeName: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('Bold Classic');

  useEffect(() => {
    localStorage.setItem('themeName', theme);
  }, [theme]);

  const themeObj = useMemo(() => createTheme(THEMES[theme]), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeName: theme, setThemeName: setTheme }}>
      <ThemeProvider theme={themeObj}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}; 