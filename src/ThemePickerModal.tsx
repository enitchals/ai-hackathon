import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { THEMES, Theme } from './ThemeContext';

export interface ThemePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTheme: (themeName: Theme) => void;
  selectedTheme: Theme;
}

interface ThemeConfig {
  palette: {
    mode: string;
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

const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ open, onClose, onSelectTheme, selectedTheme }) => {
  const handleThemeSelect = (name: string) => {
    console.log('Selecting theme:', name);
    console.log('Current selected theme:', selectedTheme);
    console.log('Available themes:', Object.keys(THEMES));
    onSelectTheme(name as Theme);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Theme</DialogTitle>
      <DialogContent>
        {Object.entries(THEMES).map(([name, theme]) => (
          <Box
            key={name}
            component="button"
            type="button"
            onClick={() => handleThemeSelect(name)}
            tabIndex={0}
            aria-pressed={name === selectedTheme}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              p: 2,
              borderRadius: 2,
              border: name === selectedTheme ? '2px solid #241E4E' : '1px solid #ccc',
              mb: 2,
              background: name === selectedTheme ? '#f0f0f0' : '#FFFFFF',
              minWidth: 0,
              maxWidth: '100%',
              gap: 2,
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s, border 0.2s',
              boxShadow: name === selectedTheme ? 2 : 0,
              '&:hover': {
                background: name === selectedTheme ? '#e0e0e0' : '#f5f5f5',
              },
              '&:focus': {
                border: '2px solid #241E4E',
                background: '#f0f0f0',
              },
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
              <Typography variant="h6" sx={{ wordBreak: 'break-word', textAlign: 'left' }}>{name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', minWidth: 0 }}>
                {Object.entries((theme as ThemeConfig).palette).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null && 'main' in value) {
                    return (
                      <Box
                        key={key}
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: (value as { main: string }).main,
                          borderRadius: '50%',
                          border: '1px solid #ccc',
                          flexShrink: 0,
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemePickerModal; 