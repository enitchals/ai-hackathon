import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardActionArea, CardContent, GridLegacy as Grid } from '@mui/material';
import ADHDnDApp from './adhd-n-d/ADHDnDApp';

function Gallery() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          AI Hackathon Gallery
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Select an app below to get started!
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardActionArea component={Link} to="/adhd-n-d">
                <CardContent>
                  <Typography variant="h5" component="div">
                    ADHD+D
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    A playful to-do app for focus and fun!
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {/* Add more app cards here as you build more apps */}
        </Grid>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/adhd-n-d" element={<ADHDnDApp />} />
      </Routes>
    </Router>
  );
}

export default App;
