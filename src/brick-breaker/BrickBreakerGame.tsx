import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import { useThemeContext } from '../ThemeContext';
import { Box, Button, Typography, IconButton } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const BOARD_WIDTH = 320;
const BOARD_HEIGHT = 480;
const PADDLE_WIDTH = 64;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 12;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_WIDTH = (BOARD_WIDTH - 16) / BRICK_COLS; // 16px padding
const BRICK_HEIGHT = 20;
const PADDLE_Y = BOARD_HEIGHT - 32;
const PADDLE_SPEED = 24; // px per key press or button tap
const BALL_SPEED = 4; // px per frame

const BrickBreakerGame: React.FC = () => {
  const { themeName } = useThemeContext();
  const [paddleX, setPaddleX] = useState((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const [paddleTargetX, setPaddleTargetX] = useState((BOARD_WIDTH - PADDLE_WIDTH) / 2);
  const paddleXRef = useRef(paddleX);
  useEffect(() => { paddleXRef.current = paddleX; }, [paddleX]);
  const paddleTargetXRef = useRef(paddleTargetX);
  useEffect(() => { paddleTargetXRef.current = paddleTargetX; }, [paddleTargetX]);
  const [ball, setBall] = useState({
    x: (BOARD_WIDTH - BALL_SIZE) / 2,
    y: PADDLE_Y - BALL_SIZE - 8,
    vx: BALL_SPEED,
    vy: -BALL_SPEED,
    moving: false,
  });
  const boardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Bricks state
  const [bricks, setBricks] = useState(() => {
    const arr = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        arr.push({ row, col, alive: true });
      }
    }
    return arr;
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const lifeLostRef = useRef(false);

  // Smooth paddle movement (run once, always animate toward latest target)
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();
    const animate = (now: number) => {
      if (!running) return;
      const delta = Math.min(now - lastTime, 40);
      lastTime = now;
      setPaddleX(x => {
        const target = paddleTargetXRef.current;
        if (Math.abs(x - target) < 1) return target;
        const speed = 400; // px per second
        const step = speed * (delta / 1000);
        if (x < target) return Math.min(x + step, target);
        else return Math.max(x - step, target);
      });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { running = false; };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPaddleTargetX(x => {
          const newX = Math.max(0, x - PADDLE_SPEED);
          paddleTargetXRef.current = newX;
          return newX;
        });
      } else if (e.key === 'ArrowRight') {
        setPaddleTargetX(x => {
          const newX = Math.min(BOARD_WIDTH - PADDLE_WIDTH, x + PADDLE_SPEED);
          paddleTargetXRef.current = newX;
          return newX;
        });
      } else if (e.key === ' ' && !ball.moving) {
        setBall(b => ({ ...b, moving: true }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ball.moving]);

  // Mobile button controls
  const movePaddle = (dir: 'left' | 'right') => {
    setPaddleTargetX(x => {
      let newX;
      if (dir === 'left') newX = Math.max(0, x - PADDLE_SPEED);
      else newX = Math.min(BOARD_WIDTH - PADDLE_WIDTH, x + PADDLE_SPEED);
      paddleTargetXRef.current = newX;
      return newX;
    });
  };

  // Ball movement and collision (with delta time for smoothness)
  useEffect(() => {
    if (!ball.moving) return;
    let lastTime = performance.now();
    lifeLostRef.current = false;
    const step = (now: number) => {
      const delta = Math.min(now - lastTime, 40); // cap delta to avoid jumps
      lastTime = now;
      setBall(b => {
        let { x, y, vx, vy } = b;
        const speedScale = delta / 16.67; // 16.67ms = 60fps
        x += vx * speedScale;
        y += vy * speedScale;
        // Wall collisions
        if (x <= 0) {
          x = 0;
          vx = -vx;
        } else if (x + BALL_SIZE >= BOARD_WIDTH) {
          x = BOARD_WIDTH - BALL_SIZE;
          vx = -vx;
        }
        if (y <= 0) {
          y = 0;
          vy = -vy;
        }
        // Paddle collision
        const px = paddleXRef.current;
        if (
          y + BALL_SIZE >= PADDLE_Y &&
          y + BALL_SIZE <= PADDLE_Y + PADDLE_HEIGHT &&
          x + BALL_SIZE > px &&
          x < px + PADDLE_WIDTH &&
          vy > 0
        ) {
          y = PADDLE_Y - BALL_SIZE;
          vy = -vy;
        }
        // Brick collision
        let hitIndex = -1;
        for (let i = 0; i < bricks.length; i++) {
          const brick = bricks[i];
          if (!brick.alive) continue;
          const bx = 8 + brick.col * BRICK_WIDTH;
          const by = 8 + brick.row * BRICK_HEIGHT;
          if (
            x + BALL_SIZE > bx &&
            x < bx + BRICK_WIDTH - 4 &&
            y + BALL_SIZE > by &&
            y < by + BRICK_HEIGHT - 4
          ) {
            hitIndex = i;
            // Simple bounce: reverse vy
            vy = -vy;
            break;
          }
        }
        if (hitIndex !== -1) {
          setBricks(prev => prev.map((b, i) => i === hitIndex ? { ...b, alive: false } : b));
          setScore(s => s + 1);
        }
        // Bottom (missed paddle)
        if (y > BOARD_HEIGHT && !lifeLostRef.current) {
          setLives(l => l - 1);
          lifeLostRef.current = true;
          // Immediately reset paddle and ball positions
          const centerPaddle = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
          setPaddleX(centerPaddle);
          setPaddleTargetX(centerPaddle);
          setBall(b => ({
            ...b,
            x: (BOARD_WIDTH - BALL_SIZE) / 2,
            y: PADDLE_Y - BALL_SIZE - 8,
            vx: BALL_SPEED,
            vy: -BALL_SPEED,
            moving: false,
          }));
          // Return the new ball state (not moving)
          return {
            ...b,
            moving: false,
          };
        }
        return { ...b, x, y, vx, vy };
      });
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [ball.moving]);

  // Reset game if lives reach 0
  useEffect(() => {
    if (lives <= 0) {
      setTimeout(() => {
        setBricks(() => {
          const arr = [];
          for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
              arr.push({ row, col, alive: true });
            }
          }
          return arr;
        });
        setScore(0);
        setLives(3);
        const centerPaddle = (BOARD_WIDTH - PADDLE_WIDTH) / 2;
        setPaddleX(centerPaddle);
        setPaddleTargetX(centerPaddle);
        setBall({
          x: (BOARD_WIDTH - BALL_SIZE) / 2,
          y: PADDLE_Y - BALL_SIZE - 8,
          vx: BALL_SPEED,
          vy: -BALL_SPEED,
          moving: false,
        });
      }, 1000);
    }
  }, [lives]);

  // Start game button
  const handleStart = () => {
    if (!ball.moving) setBall(b => ({ ...b, moving: true }));
  };

  // Render bricks
  const brickBoxes = bricks.filter(b => b.alive).map(brick => (
    <Box
      key={`brick-${brick.row}-${brick.col}`}
      sx={{
        position: 'absolute',
        left: 8 + brick.col * BRICK_WIDTH,
        top: 8 + brick.row * BRICK_HEIGHT,
        width: BRICK_WIDTH - 4,
        height: BRICK_HEIGHT - 4,
        bgcolor: 'primary.main',
        borderRadius: 1,
        boxShadow: 1,
        border: '2px solid',
        borderColor: 'primary.dark',
      }}
    />
  ));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppHeader title="Brick Breaker" showBackButton />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Brick Breaker
        </Typography>
        <Typography variant="h6" gutterBottom>
          Score: {score}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {Array.from({ length: lives }).map((_, i) => (
            <Box key={i} sx={{ color: 'info.main', fontSize: 28, mx: 0.5 }}>
              {'💙'}
            </Box>
          ))}
        </Box>
        <Box
          ref={boardRef}
          sx={{
            position: 'relative',
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            bgcolor: 'grey.200',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            mb: 2,
            maxWidth: '100vw',
            touchAction: 'none',
          }}
        >
          {/* Bricks */}
          {brickBoxes}
          {/* Paddle (movable) */}
          <Box
            sx={{
              position: 'absolute',
              left: paddleX,
              top: PADDLE_Y,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              bgcolor: 'secondary.main',
              borderRadius: 2,
              boxShadow: 2,
              transition: 'left 0.08s',
            }}
          />
          {/* Ball (moving) */}
          <Box
            sx={{
              position: 'absolute',
              left: ball.x,
              top: ball.y,
              width: BALL_SIZE,
              height: BALL_SIZE,
              bgcolor: 'warning.main',
              borderRadius: '50%',
              boxShadow: 2,
              transition: ball.moving ? 'none' : 'left 0.08s, top 0.08s',
            }}
          />
        </Box>
        {/* Mobile controls */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 2, mt: 1 }}>
          <IconButton onClick={() => movePaddle('left')} size="large" color="primary">
            <ArrowLeftIcon />
          </IconButton>
          <IconButton onClick={() => movePaddle('right')} size="large" color="primary">
            <ArrowRightIcon />
          </IconButton>
        </Box>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleStart}>
          {ball.moving ? 'Game Running' : 'Start Game'}
        </Button>
      </Box>
    </Box>
  );
};

export default BrickBreakerGame; 