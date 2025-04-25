import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

const THEMES = [
  {
    name: 'Bold Classic',
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      russianViolet: '#241E4E',
      pennRed: '#960200',
      sunglow: '#FFD046',
      processCyan: '#30BCED',
    },
  },
];

export interface ThemePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTheme: (themeName: string) => void;
  selectedTheme: string;
}

const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ open, onClose, onSelectTheme, selectedTheme }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Theme</DialogTitle>
      <DialogContent>
        {THEMES.map((theme) => (
          <Box
            key={theme.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2,
              border: theme.name === selectedTheme ? '2px solid #241E4E' : '1px solid #ccc',
              mb: 2,
              background: theme.colors.white,
            }}
          >
            <Box>
              <Typography variant="h6">{theme.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {Object.values(theme.colors).map((color) => (
                  <Box key={color} sx={{ width: 24, height: 24, bgcolor: color, borderRadius: '50%', border: '1px solid #ccc' }} />
                ))}
              </Box>
            </Box>
            <Button
              variant={theme.name === selectedTheme ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => onSelectTheme(theme.name)}
              disabled={theme.name === selectedTheme}
            >
              {theme.name === selectedTheme ? 'Selected' : 'Select'}
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