import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>about this project</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ textTransform: 'lowercase' }}>
            <b>ai hackathon gallery</b> is a collection of simple, modern web games and playful apps, built in one day as a single react + typescript codebase. each mini-app is standalone, mobile-friendly, and shares a unified theme system. the project demonstrates rapid prototyping, code organization, and ui consistency using material ui.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'lowercase' }}>
            includes: adhd+d (d&d-inspired to-do), snake, wordle clone, busy bee, brick breaker, racing game, tetris, and pac-man. all apps are accessible from the main gallery.
          </Typography>
        </Box>
      </DialogContent>
      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mb: 0.5, textTransform: 'lowercase' }}>
          coded by <a href="https://www.cursor.so" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>cursor</a>
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ textTransform: 'lowercase' }}>
          project led by ellen nitchals |
          <a href="https://github.com/enitchals" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, marginLeft: 4, marginRight: 4 }}>github</a>|
          <a href="https://www.linkedin.com/in/enitchals/" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, marginLeft: 4 }}>linkedin</a>
        </Typography>
      </Box>
      <DialogActions>
        <Button onClick={onClose} color="primary" sx={{ textTransform: 'lowercase' }}>close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AboutModal; 