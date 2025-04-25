import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../ThemeContext';
import ThemePickerModal from '../ThemePickerModal';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  showThemePicker?: boolean;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  showThemePicker = true,
  children
}) => {
  const navigate = useNavigate();
  const { themeName, setThemeName } = useThemeContext();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {children}
          {showThemePicker && (
            <>
              <IconButton
                color="inherit"
                onClick={() => setThemeModalOpen(true)}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.dark',
                  }}
                />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
      <ThemePickerModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onSelectTheme={setThemeName}
        selectedTheme={themeName}
      />
    </AppBar>
  );
};

export default AppHeader; 