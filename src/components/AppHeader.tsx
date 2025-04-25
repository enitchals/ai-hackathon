import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../main';
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
  const [themeModalOpen, setThemeModalOpen] = React.useState(false);
  const { themeName, setThemeName } = useThemeContext();

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

        {children}

        {showThemePicker && (
          <>
            <IconButton
              color="inherit"
              onClick={() => setThemeModalOpen(true)}
            >
              <ColorLensIcon />
            </IconButton>
            <ThemePickerModal
              open={themeModalOpen}
              onClose={() => setThemeModalOpen(false)}
              onSelectTheme={(name) => {
                setThemeName(name);
                setThemeModalOpen(false);
              }}
              selectedTheme={themeName}
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 