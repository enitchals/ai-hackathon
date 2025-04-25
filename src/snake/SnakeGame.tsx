import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
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

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastDirectionRef = useRef<Direction>('RIGHT');

  // Generate new food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    
    return newFood;
  }, [snake]);

  // Check for collisions
  const checkCollision = useCallback((head: Position) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

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

    gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);
    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
      }
    };
  }, [direction, food, gameOver, isPaused, checkCollision, generateFood]);

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
              boxShadow: index === 0 ? `0 0 4px ${theme.palette.primary.dark}` : 'none'
            }}
          />
        ))}
      </>
    );
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default
    }}>
      <AppHeader title="Snake Game" />
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2,
        backgroundColor: theme.palette.background.default
      }}>
        <Box sx={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          border: `2px solid ${theme.palette.divider}`,
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
          mb: isMobile ? 2 : 0,
          boxShadow: theme.shadows[2]
        }}>
          {renderGameElements()}
        </Box>

        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
          Score: {score}
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

        {gameOver && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
              Game Over!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                setSnake([{ x: 10, y: 10 }]);
                setDirection('RIGHT');
                setGameOver(false);
                setScore(0);
                setFood(generateFood());
              }}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark }
              }}
            >
              Play Again
            </Button>
          </Box>
        )}

        {isPaused && !gameOver && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
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