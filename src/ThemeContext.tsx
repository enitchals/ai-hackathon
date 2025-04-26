import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, createTheme, PaletteMode } from '@mui/material';

// Theme names
export const themes = [
  'boring',
  'bold classic',
  'serene',
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
  'boring': {
    palette: {
      mode: 'light',
      primary: { main: '#000000' }, // dark color
      secondary: { main: '#044389' }, // accent color
      background: { default: '#FFFFFF', paper: '#FFFFFF' },
      text: { primary: '#000000', secondary: '#000000' },
      info: { main: '#044389' },
      warning: { main: '#B80C09' },
      error: { main: '#FFD046' },
      success: { main: '#157F1F' },
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
  'Bold Classic': {
    palette: {
      mode: 'light',
      primary: { main: '#241E4E' }, // dark color
      secondary: { main: '#960200' }, // accent color
      background: { default: '#FFFFFF', paper: '#F8F8F8' },
      text: { primary: '#1A1A1A', secondary: '#241E4E' },
      info: { main: '#30BCED' },
      warning: { main: '#FFD046' },
      error: { main: '#960200' },
      success: { main: '#2E7D32' },
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
      primary: { main: '#002642' }, // dark color
      secondary: { main: '#7798AB' }, // accent color
      background: { default: '#FFFFFF', paper: 'beige' },
      text: { primary: '#000000', secondary: '#002642' },
      info: { main: '#1F415A' },
      warning: { main: '#EE7B30' },
      error: { main: '#650D1B' },
      success: { main: '#646536' },
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