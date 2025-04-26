import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardActionArea, CardContent, GridLegacy as Grid, Button } from '@mui/material';
import { useState } from 'react';
import ADHDnDApp from './adhd-n-d/ADHDnDApp';
import SnakeGame from './snake/SnakeGame';
import WordleGame from './wordle/WordleGame';
import ThemePickerModal from './ThemePickerModal';
import { useThemeContext } from './ThemeContext';
import SpellingBeeGame from './spelling-bee/SpellingBeeGame';
import BrickBreakerGame from './brick-breaker';
import D20Image from './assets/d20.png';
import WordleImage from './assets/wordle.png';
import BrickBreakerImage from './assets/brick-breaker.png';
import SpellingBeeImage from './assets/spelling-bee.png';
import SnakeImage from './assets/snake.png';
import RacingGame from './racing-game';

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
      <Grid container spacing={4} justifyContent="center">
        {[{
          title: 'ADHDnD',
          description: 'A D&D-inspired to-do adventure',
          to: '/adhd-n-d',
          preview: <img src={D20Image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Snake',
          description: 'Classic snake game with modern controls',
          to: '/snake',
          preview: <img src={SnakeImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Wordle',
          description: 'A word-guessing game with color-coded feedback',
          to: '/wordle',
          preview: <img src={WordleImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Spelling Bee',
          description: 'Make as many words as you can from 7 letters. Find the pangram!',
          to: '/spelling-bee',
          preview: <img src={SpellingBeeImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Brick Breaker',
          description: 'Break all the bricks! Classic arcade fun.',
          to: '/brick-breaker',
          preview: <img src={BrickBreakerImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Racing Game',
          description: 'Dodge obstacles and race for a high score! Emoji-powered fun.',
          to: '/racing-game',
          preview: <span style={{ fontSize: 80, display: 'block', textAlign: 'center' }}>🏎️</span>,
        }].map((app) => (
          <Grid item xs={12} sm={6} md={4} key={app.title} display="flex" justifyContent="center">
            <Card sx={{ width: 340, height: 340, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 3 }}>
              <CardActionArea component={Link} to={app.to} sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', p: 1 }}>
                <Box sx={{ width: 150, height: 150, mt: 0, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {app.preview}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', px: 0.5, py: 0 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {app.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
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
        <Route path="/brick-breaker" element={<BrickBreakerGame />} />
        <Route path="/racing-game" element={<RacingGame />} />
      </Routes>
    </Router>
  );
}

export default App;
