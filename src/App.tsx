import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardActionArea, CardContent, GridLegacy as Grid, Button } from '@mui/material';
import { useState } from 'react';
import ADHDnDApp from './adhd-n-d/ADHDnDApp';
import SnakeGame from './snake/SnakeGame';
import WordlGame from './wordl/WordlGame';
import ThemePickerModal from './ThemePickerModal';
import { useThemeContext } from './ThemeContext';
import SpellingBeeGame from './spelling-bee/SpellingBeeGame';
import BrickBreakerGame from './brick-breaker';
import D20Image from './assets/d20.png';
import WordlImage from './assets/wordl.png';
import BrickBreakerImage from './assets/brick-breaker.png';
import SpellingBeeImage from './assets/spelling-bee.png';
import SnakeImage from './assets/snake.png';
import RacingGame from './racing-game';
import TetrisGame from './tetris';
import TetrisImage from './assets/tetris.png';
import RacingGameImage from './assets/racing-game.png';
import PacManImage from './assets/pac-man.png';
import PacMan from './pacman';
import AboutModal from './AboutModal';

function Gallery() {
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const { themeName, setThemeName } = useThemeContext();
  const PacManPreview = (
    <img src={PacManImage} alt="Pac-Man Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
  );
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          ai hackathon gallery
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          select an app below to get started!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 'bold', px: 4, fontSize: '1.1rem' }}
            onClick={() => setThemeModalOpen(true)}
          >
            choose theme
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 'bold', px: 4, fontSize: '1.1rem' }}
            onClick={() => setAboutModalOpen(true)}
          >
            about
          </Button>
        </Box>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        {[{
          title: 'ADHDnD',
          description: 'a d&d-inspired to-do adventure',
          to: '/adhd-n-d',
          preview: <img src={D20Image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Snake',
          description: 'classic snake game with modern controls',
          to: '/snake',
          preview: <img src={SnakeImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Wordl',
          description: 'a word-guessing game with color-coded feedback',
          to: '/wordl',
          preview: <img src={WordlImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Busy Bee',
          description: 'make as many words as you can from 7 letters. find the pangram!',
          to: '/spelling-bee',
          preview: <img src={SpellingBeeImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Brick Breaker',
          description: 'break all the bricks! classic arcade fun.',
          to: '/brick-breaker',
          preview: <img src={BrickBreakerImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Racing Game',
          description: 'dodge obstacles and race for a high score! emoji-powered fun.',
          to: '/racing-game',
          preview: <img src={RacingGameImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Tetris',
          description: 'classic falling blocks with a pastel twist!',
          to: '/tetris',
          preview: <img src={TetrisImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />,
        }, {
          title: 'Pac-Man',
          description: 'the classic maze chase game, faithfully recreated!',
          to: '/pacman',
          preview: PacManPreview,
        }].map((app) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={app.title} display="flex" justifyContent="center">
            <Card sx={{ width: 280, minWidth: 240, height: 340, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 3 }}>
              <CardActionArea component={Link} to={app.to} sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', p: 1 }}>
                <Box sx={{ width: 150, height: 150, mt: 0, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {app.preview}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', px: 0.5, py: 0 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ textTransform: 'lowercase' }}>
                    {app.title.toLowerCase()}
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
      <AboutModal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
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
        <Route path="/wordl" element={<WordlGame />} />
        <Route path="/spelling-bee" element={<SpellingBeeGame />} />
        <Route path="/brick-breaker" element={<BrickBreakerGame />} />
        <Route path="/racing-game" element={<RacingGame />} />
        <Route path="/tetris" element={<TetrisGame />} />
        <Route path="/pacman" element={<PacMan />} />
      </Routes>
    </Router>
  );
}

export default App;
