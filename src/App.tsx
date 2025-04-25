import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardActionArea, CardContent, GridLegacy as Grid, Button } from '@mui/material';
import { useState } from 'react';
import ADHDnDApp from './adhd-n-d/ADHDnDApp';
import SnakeGame from './snake/SnakeGame';
import ThemePickerModal from './ThemePickerModal';
import { useThemeContext } from './main';

function Gallery() {
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const { themeName, setThemeName } = useThemeContext();
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          AI Hackathon Gallery
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Select an app below to get started!
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 3 }}
          onClick={() => setThemeModalOpen(true)}
        >
          Choose Theme
        </Button>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              background: 'primary.light', 
              color: 'common.black', 
              boxShadow: 3,
              '&:hover': {
                background: 'primary.main'
              }
            }}>
              <CardActionArea component={Link} to="/adhd-n-d">
                <CardContent>
                  <Typography variant="h5" component="div">
                    ADHD+D
                  </Typography>
                  <Typography variant="body2">
                    A playful to-do app for focus and fun!
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              background: 'secondary.light', 
              color: 'common.black', 
              boxShadow: 3,
              '&:hover': {
                background: 'secondary.main'
              }
            }}>
              <CardActionArea component={Link} to="/snake">
                <CardContent>
                  <Typography variant="h5" component="div">
                    Snake
                  </Typography>
                  <Typography variant="body2">
                    Classic snake game with a modern twist!
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <ThemePickerModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onSelectTheme={(name) => { setThemeName(name); setThemeModalOpen(false); }}
        selectedTheme={themeName}
      />
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/adhd-n-d" element={<ADHDnDApp />} />
        <Route path="/snake" element={<SnakeGame />} />
      </Routes>
    </Router>
  );
}

export default App;
