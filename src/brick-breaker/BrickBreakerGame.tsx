import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import { Box, Button, Typography, IconButton } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
const HIGH_SCORE_KEY = 'brickbreaker-high-score';

const BrickBreakerGame: React.FC = () => {
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

  // High score state
  const [highScore, setHighScore] = useState(() => {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => sessionStorage.getItem('brickbreaker-onboarding-shown') !== '1');
  const [showGameOver, setShowGameOver] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const onboardingRef = useRef<HTMLDivElement>(null);
  const gameOverRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const [mobilePress, setMobilePress] = useState<'left' | 'right' | null>(null);

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

  // High score update
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  }, [score, highScore]);

  // Show game over overlay
  useEffect(() => {
    if (lives <= 0) {
      setShowGameOver(true);
      setTimeout(() => {
        setShowGameOver(false);
        setShowStart(true);
      }, 1200);
    }
  }, [lives]);

  // Focus trap for overlays
  useEffect(() => {
    if (showOnboarding && onboardingRef.current) onboardingRef.current.focus();
    else if (showGameOver && gameOverRef.current) gameOverRef.current.focus();
    else if (showStart && startRef.current) startRef.current.focus();
  }, [showOnboarding, showGameOver, showStart]);

  // Hide start button when running
  useEffect(() => {
    if (ball.moving) setShowStart(false);
  }, [ball.moving]);

  // Continuous press for mobile controls
  useEffect(() => {
    if (!mobilePress) return;
    let raf: number;
    let last = performance.now();
    const step = (now: number) => {
      const delta = now - last;
      last = now;
      if (mobilePress === 'left') movePaddle('left');
      else if (mobilePress === 'right') movePaddle('right');
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mobilePress]);

  // Start game button
  const handleStart = () => {
    setShowStart(false);
    setShowGameOver(false);
    if (!ball.moving) setBall(b => ({ ...b, moving: true }));
  };

  // Onboarding overlay
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('brickbreaker-onboarding-shown', '1');
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
        {/* Onboarding/Instructions Overlay */}
        {showOnboarding && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            onClick={handleCloseOnboarding}
            role="dialog"
            aria-modal="true"
            aria-label="How to Play Instructions"
          >
            <Box ref={onboardingRef} tabIndex={-1} sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320, maxWidth: 400, boxShadow: 8 }} onClick={e => e.stopPropagation()}>
              <Typography variant="h5" sx={{ mb: 2 }}><InfoOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />How to Play</Typography>
              <Typography sx={{ mb: 2 }}>
                Break all the bricks!<br /><br />
                Move the paddle left and right to bounce the ball and keep it in play.<br /><br />
                <b>Controls:</b><br />
                - <b>Arrow keys</b> or <b>on-screen buttons</b> to move<br />
                - <b>Spacebar</b> or <b>Start</b> to launch the ball<br /><br />
                Lose a life if you miss the ball. Game resets after 3 misses.<br /><br />
                <b>Tip:</b> Hold down the on-screen buttons for smooth paddle movement on mobile!
              </Typography>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <button onClick={handleCloseOnboarding} style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }} aria-label="Start Playing">Start Playing</button>
              </Box>
            </Box>
          </Box>
        )}
        {/* Start Overlay */}
        {showStart && !showOnboarding && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            onClick={handleStart}
            role="dialog"
            aria-modal="true"
            aria-label="Start Game"
          >
            <Box ref={startRef} tabIndex={-1} sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320, maxWidth: 400, boxShadow: 8 }} onClick={e => e.stopPropagation()}>
              <Typography variant="h5" sx={{ mb: 2 }}>Brick Breaker</Typography>
              <Typography sx={{ mb: 2 }}>Tap or press <b>Start</b> to begin!</Typography>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <button onClick={handleStart} style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }} aria-label="Start Game">Start</button>
              </Box>
            </Box>
          </Box>
        )}
        {/* Game Over Overlay */}
        {showGameOver && !showOnboarding && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            role="dialog"
            aria-modal="true"
            aria-label="Game Over"
          >
            <Box ref={gameOverRef} tabIndex={-1} sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320, maxWidth: 400, boxShadow: 8 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>Game Over</Typography>
              <Typography sx={{ mb: 2 }}>Your score: <b>{score}</b></Typography>
              <Typography sx={{ mb: 2 }}>High score: <b>{highScore}</b></Typography>
              <Typography sx={{ mb: 2 }}>Tap anywhere to play again!</Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>Score: {score}</Typography>
          <Typography variant="h6" sx={{ mr: 2 }}>High: {highScore}</Typography>
          {Array.from({ length: lives }).map((_, i) => (
            <FavoriteIcon key={i} sx={{ color: 'error.main', fontSize: 28, mx: 0.5 }} aria-label="Life" />
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
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 4, mt: 1, mb: 2, justifyContent: 'center' }}>
          <IconButton
            onMouseDown={() => setMobilePress('left')}
            onMouseUp={() => setMobilePress(null)}
            onMouseLeave={() => setMobilePress(null)}
            onTouchStart={() => setMobilePress('left')}
            onTouchEnd={() => setMobilePress(null)}
            size="large"
            color="primary"
            sx={{ width: 72, height: 72, borderRadius: '50%', background: 'primary.main', color: '#fff', fontSize: 40, boxShadow: 2 }}
            aria-label="Move Left"
          >
            <ArrowLeftIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <IconButton
            onMouseDown={() => setMobilePress('right')}
            onMouseUp={() => setMobilePress(null)}
            onMouseLeave={() => setMobilePress(null)}
            onTouchStart={() => setMobilePress('right')}
            onTouchEnd={() => setMobilePress(null)}
            size="large"
            color="primary"
            sx={{ width: 72, height: 72, borderRadius: '50%', background: 'primary.main', color: '#fff', fontSize: 40, boxShadow: 2 }}
            aria-label="Move Right"
          >
            <ArrowRightIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
        {/* How to Play button */}
        <Box sx={{ textAlign: 'right', width: '100%', maxWidth: 400, mb: 1 }}>
          <button onClick={() => setShowOnboarding(true)} style={{ fontSize: '0.95rem', padding: '4px 12px', borderRadius: 6, border: 'none', background: '#0288d1', color: '#fff', cursor: 'pointer' }} aria-label="How to Play">How to Play</button>
        </Box>
      </Box>
    </Box>
  );
};

export default BrickBreakerGame; 