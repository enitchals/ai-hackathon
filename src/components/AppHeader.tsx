import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../ThemeContext';
import ThemePickerModal from '../ThemePickerModal';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  showThemePicker?: boolean;
  children?: React.ReactNode;
  navLabels?: string[];
  tab?: number;
  onTabChange?: (index: number) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  showThemePicker = true,
  children,
  navLabels = [],
  tab = 0,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const { themeName, setThemeName } = useThemeContext();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleDrawerToggle = () => setDrawerOpen((open) => !open);
  const handleNavClick = (idx: number) => {
    setDrawerOpen(false);
    if (onTabChange) onTabChange(idx);
  };

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
          {isMobile && navLabels.length > 0 && onTabChange ? (
            <>
              <IconButton color="inherit" onClick={handleDrawerToggle} aria-label="open navigation menu">
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                PaperProps={{ sx: { minWidth: 200 } }}
              >
                <Box sx={{ width: 220, pt: 2 }} role="presentation">
                  <List>
                    {navLabels.map((label, idx) => (
                      <ListItem key={label} disablePadding>
                        <ListItemButton selected={tab === idx} onClick={() => handleNavClick(idx)}>
                          <ListItemText primary={label} sx={{ textTransform: 'capitalize' }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            children
          )}
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