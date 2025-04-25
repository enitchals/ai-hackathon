import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardActionArea, CardContent, GridLegacy as Grid, Button } from '@mui/material';
import { useState } from 'react';
import ADHDnDApp from './adhd-n-d/ADHDnDApp';
import SnakeGame from './snake/SnakeGame';
import WordleGame from './wordle/WordleGame';
import ThemePickerModal from './ThemePickerModal';
import { useThemeContext } from './ThemeContext';
import SpellingBeeGame from './components/SpellingBeeGame';

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
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea component={Link} to="/adhd-n-d">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ADHDnD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A D&D-inspired to-do app for people with ADHD
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea component={Link} to="/snake">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Snake Game
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Classic snake game with modern controls
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea component={Link} to="/wordle">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Wordle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A word-guessing game with color-coded feedback
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea component={Link} to="/spelling-bee">
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Spelling Bee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Make as many words as you can from 7 letters. Find the pangram!
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      <ThemePickerModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        onSelectTheme={setThemeName}
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
        <Route path="/wordle" element={<WordleGame />} />
        <Route path="/spelling-bee" element={<SpellingBeeGame />} />
      </Routes>
    </Router>
  );
}

export default App;
