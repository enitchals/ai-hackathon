import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { THEMES } from './ThemeContext';

export interface ThemePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTheme: (themeName: string) => void;
  selectedTheme: string;
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
}

const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ open, onClose, onSelectTheme, selectedTheme }) => {
  const handleThemeSelect = (name: string) => {
    console.log('Selecting theme:', name);
    console.log('Current selected theme:', selectedTheme);
    console.log('Available themes:', Object.keys(THEMES));
    onSelectTheme(name);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Theme</DialogTitle>
      <DialogContent>
        {Object.entries(THEMES).map(([name, theme]) => (
          <Box
            key={name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2,
              border: name === selectedTheme ? '2px solid #241E4E' : '1px solid #ccc',
              mb: 2,
              background: '#FFFFFF',
            }}
          >
            <Box>
              <Typography variant="h6">{name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {Object.values((theme as ThemeConfig).palette).map((value: any) => 
                  typeof value === 'object' && value.main ? (
                    <Box 
                      key={value.main} 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: value.main, 
                        borderRadius: '50%', 
                        border: '1px solid #ccc' 
                      }} 
                    />
                  ) : null
                )}
              </Box>
            </Box>
            <Button
              variant={name === selectedTheme ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleThemeSelect(name)}
              disabled={name === selectedTheme}
            >
              {name === selectedTheme ? 'Selected' : 'Select'}
            </Button>
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