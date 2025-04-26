import { Box, Typography, Button, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AppHeader from '../components/AppHeader';

// Types
type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const CELL_SIZE = 20;
const HIGH_SCORE_KEY = 'snake-high-score';
const SPEED_KEY = 'snake-speed';
const GRID_KEY = 'snake-grid-size';

const SPEED_OPTIONS = [
  { label: 'Slow', value: 250 },
  { label: 'Normal', value: 150 },
  { label: 'Fast', value: 80 },
];
const GRID_OPTIONS = [
  { label: '10 x 10', value: 10 },
  { label: '15 x 15', value: 15 },
  { label: '20 x 20', value: 20 },
];

export default function SnakeGame() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastDirectionRef = useRef<Direction>('RIGHT');
  const [showStartModal, setShowStartModal] = useState(true);
  const [speed, setSpeed] = useState(() => {
    const stored = localStorage.getItem(SPEED_KEY);
    return stored ? parseInt(stored, 10) : 150;
  });
  const [gridSize, setGridSize] = useState(() => {
    const stored = localStorage.getItem(GRID_KEY);
    return stored ? parseInt(stored, 10) : 20;
  });

  // Update high score if needed
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  }, [score, highScore]);

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem(SPEED_KEY, String(speed));
  }, [speed]);
  useEffect(() => {
    localStorage.setItem(GRID_KEY, String(gridSize));
  }, [gridSize]);

  // Generate new food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    
    return newFood;
  }, [snake, gridSize]);

  // Check for collisions
  const checkCollision = useCallback((head: Position) => {
    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true;
    }
    
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake, gridSize]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || showStartModal) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // Move head based on direction
        switch (direction) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check for collisions
        if (checkCollision(head)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head];
        
        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 1);
          setFood(generateFood());
          // Keep the tail when food is eaten
          newSnake.push(...prevSnake);
        } else {
          // Remove tail if no food eaten
          newSnake.push(...prevSnake.slice(0, -1));
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
      }
    };
  }, [direction, food, gameOver, isPaused, checkCollision, generateFood, showStartModal, speed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      // Prevent default for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      // Pause/Resume with space
      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      // Update direction
      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
            return 'UP';
          case 'ArrowDown':
            return 'DOWN';
          case 'ArrowLeft':
            return 'LEFT';
          case 'ArrowRight':
            return 'RIGHT';
          default:
            return direction;
        }
      })();

      // Prevent 180-degree turns
      if (
        (newDirection === 'UP' && lastDirectionRef.current === 'DOWN') ||
        (newDirection === 'DOWN' && lastDirectionRef.current === 'UP') ||
        (newDirection === 'LEFT' && lastDirectionRef.current === 'RIGHT') ||
        (newDirection === 'RIGHT' && lastDirectionRef.current === 'LEFT')
      ) {
        return;
      }

      setDirection(newDirection);
      lastDirectionRef.current = newDirection;
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  // Handle touch control press
  const handleDirectionPress = useCallback((newDirection: Direction) => {
    if (gameOver || isPaused) return;

    // Prevent 180-degree turns
    if (
      (newDirection === 'UP' && lastDirectionRef.current === 'DOWN') ||
      (newDirection === 'DOWN' && lastDirectionRef.current === 'UP') ||
      (newDirection === 'LEFT' && lastDirectionRef.current === 'RIGHT') ||
      (newDirection === 'RIGHT' && lastDirectionRef.current === 'LEFT')
    ) {
      return;
    }

    setDirection(newDirection);
    lastDirectionRef.current = newDirection;
  }, [gameOver, isPaused]);

  // Render snake segments and food
  const renderGameElements = () => {
    return (
      <>
        {/* Food */}
        <Box
          sx={{
            position: 'absolute',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: theme.palette.error.main,
            borderRadius: '50%',
            boxShadow: `0 0 4px ${theme.palette.error.dark}`
          }}
        />
        
        {/* Snake */}
        {snake.map((segment, index) => (
          <Box
            key={`${segment.x}-${segment.y}`}
            sx={{
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: index === 0 ? theme.palette.primary.main : theme.palette.primary.light,
              border: `1px solid ${theme.palette.primary.dark}`,
              boxShadow: 'none'
            }}
          />
        ))}
      </>
    );
  };

  // Show start modal on game over
  useEffect(() => {
    if (gameOver) {
      setShowStartModal(true);
    }
  }, [gameOver]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default
    }}>
      <AppHeader title="snake game" />
      {/* Start Modal */}
      <Dialog
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="snake-start-title"
        aria-describedby="snake-start-desc"
      >
        <DialogTitle id="snake-start-title">welcome to snake!</DialogTitle>
        <DialogContent>
          <Typography gutterBottom id="snake-start-desc">
            use the arrow keys (or d-pad on mobile) to move the snake. eat food to grow. don't run into yourself or the wall!
          </Typography>
          <Typography gutterBottom>
            press <b>space</b> to pause/resume. try to beat your high score!
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>speed:</Typography>
            <Box display="flex" gap={1} mb={2}>
              {SPEED_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={speed === opt.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setSpeed(opt.value)}
                  aria-label={`set speed to ${opt.label.toLowerCase()}`}
                >
                  {opt.label.toLowerCase()}
                </Button>
              ))}
            </Box>
            <Typography variant="subtitle1" gutterBottom>grid size:</Typography>
            <Box display="flex" gap={1}>
              {GRID_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={gridSize === opt.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setGridSize(opt.value)}
                  aria-label={`set grid size to ${opt.label.toLowerCase()}`}
                >
                  {opt.label.toLowerCase()}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowStartModal(false);
              setSnake([{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }]);
              setDirection('RIGHT');
              setGameOver(false);
              setScore(0);
              setFood({ x: 5 % gridSize, y: 5 % gridSize });
              setIsPaused(false);
            }}
            autoFocus
          >
            start game
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2,
        backgroundColor: theme.palette.background.default
      }}>
        <Box
          role="region"
          aria-label="Snake game board"
          sx={{
            width: gridSize * CELL_SIZE,
            height: gridSize * CELL_SIZE,
            border: `2px solid ${theme.palette.divider}`,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
            mb: isMobile ? 2 : 0,
            boxShadow: theme.shadows[2]
          }}
        >
          {renderGameElements()}
          {gameOver && (
            <Box
              role="dialog"
              aria-label="game over dialog"
              aria-modal="true"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 10,
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
                game over!
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                score: {score}
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
                high score: {highScore}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSnake([{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }]);
                  setDirection('RIGHT');
                  setGameOver(false);
                  setScore(0);
                  setFood({ x: 5 % gridSize, y: 5 % gridSize });
                }}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': { backgroundColor: theme.palette.primary.dark }
                }}
              >
                play again
              </Button>
            </Box>
          )}
        </Box>

        <Typography
          variant="h6"
          sx={{ mb: 2, color: theme.palette.text.primary }}
          aria-live="polite"
        >
          score: {score} &nbsp; | &nbsp; high score: {highScore}
        </Typography>

        {/* Mobile Controls */}
        {isMobile && (
          <Box sx={{
            display: 'grid',
            gridTemplateAreas: `
              ". up ."
              "left . right"
              ". down ."
            `,
            gridTemplateColumns: 'repeat(3, 60px)',
            gridTemplateRows: 'repeat(3, 60px)',
            gap: 1,
            mt: 2,
            justifyContent: 'center'
          }}>
            <IconButton
              onClick={() => handleDirectionPress('UP')}
              sx={{
                gridArea: 'up',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <ArrowUpwardIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={() => handleDirectionPress('LEFT')}
              sx={{
                gridArea: 'left',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={() => handleDirectionPress('RIGHT')}
              sx={{
                gridArea: 'right',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={() => handleDirectionPress('DOWN')}
              sx={{
                gridArea: 'down',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              <ArrowDownwardIcon fontSize="large" />
            </IconButton>
          </Box>
        )}

        {isPaused && !gameOver && (
          <Box
            role="dialog"
            aria-label="Pause dialog"
            aria-modal="true"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
              Paused
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Press Space to resume
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
} 