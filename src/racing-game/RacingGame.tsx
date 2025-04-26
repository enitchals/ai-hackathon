import React, { useState, useEffect, useCallback, useRef } from 'react';
import CarImage from '../assets/racing/car.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useMediaQuery } from '@mui/material';
import AppHeader from '../components/AppHeader';
import { Box, Typography, Button } from '@mui/material';

const LANES = 3;
const CAR_WIDTH = 64;
const GAME_MAX_WIDTH = 450;
const ROAD_WIDTH = GAME_MAX_WIDTH; // max width for road/lanes
const GAME_HEIGHT = 600;
const OBSTACLE_SIZE = 64;
const OBSTACLE_EMOJIS = ['🪨', '🐄'];
const COIN_EMOJIS = ['🪙', '💰']; // gold coin and money bag
const OBSTACLE_SPEED = 4; // px per frame
const OBSTACLE_INTERVAL = 60; // frames between spawns
const COIN_INTERVAL = 90; // frames between coin spawns
const HIGH_SCORE_KEY = 'racinggame-high-score';

const getLaneLeft = (lane: number, roadWidth = ROAD_WIDTH) => {
  // Evenly space lanes across the road width
  const laneWidth = roadWidth / LANES;
  return laneWidth * lane + laneWidth / 2 - CAR_WIDTH / 2;
};

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  emoji: string;
  type: 'obstacle' | 'coin';
}

const RacingGame: React.FC = () => {
  const [lane, setLane] = useState(1); // 0 = left, 1 = center, 2 = right
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [boom, setBoom] = useState(false);
  const [started, setStarted] = useState(false);
  const frameRef = useRef(0);
  const nextId = useRef(1);
  const [laneLineOffset, setLaneLineOffset] = useState(0); // for moving dashed lines
  const isMobile = useMediaQuery('(max-width: 600px)');
  const headerHeight = isMobile ? 56 : 64;
  const [highScore, setHighScore] = useState(() => {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  });

  // Restart game state
  const restartGame = useCallback(() => {
    setLane(1);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setBoom(false);
    setStarted(false);
    frameRef.current = 0;
    nextId.current = 1;
  }, []);

  // Handle car movement and restart/start
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!started) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        setStarted(true);
      }
      return;
    }
    if (gameOver) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        restartGame();
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      setLane((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setLane((prev) => Math.min(LANES - 1, prev + 1));
    }
  }, [started, gameOver, restartGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Game loop for obstacles and coins
  useEffect(() => {
    if (!started || gameOver) return;
    let anim: number;
    function loop() {
      frameRef.current++;
      setObstacles((prev) => {
        // Move obstacles/coins down
        let next = prev.map((o) => ({ ...o, y: o.y + OBSTACLE_SPEED }));
        // Remove off-screen
        next = next.filter((o) => o.y < GAME_HEIGHT);
        // Spawn new obstacle
        if (frameRef.current % OBSTACLE_INTERVAL === 0) {
          const laneIdx = Math.floor(Math.random() * LANES);
          const emoji = OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)];
          next.push({
            id: nextId.current++,
            lane: laneIdx,
            y: -OBSTACLE_SIZE,
            emoji,
            type: 'obstacle',
          });
        }
        // Spawn new coin
        if (frameRef.current % COIN_INTERVAL === 0) {
          const laneIdx = Math.floor(Math.random() * LANES);
          const emoji = COIN_EMOJIS[Math.floor(Math.random() * COIN_EMOJIS.length)];
          next.push({
            id: nextId.current++,
            lane: laneIdx,
            y: -OBSTACLE_SIZE,
            emoji,
            type: 'coin',
          });
        }
        return next;
      });
      anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [started, gameOver]);

  // Collision detection
  useEffect(() => {
    if (!started || gameOver) return;
    setObstacles((prev) => {
      let changed = false;
      let newScore = score;
      let newObstacles = prev.filter((o) => {
        // Check for collision (same lane, y overlap near car)
        const carY = GAME_HEIGHT - 16 - 96; // bottom: 16, car height: 96
        const overlap =
          o.lane === lane &&
          o.y + OBSTACLE_SIZE > carY + 16 &&
          o.y < carY + 96 - 16;
        if (overlap) {
          if (o.type === 'obstacle') {
            setBoom(true);
            setGameOver(true);
            changed = true;
            return false; // remove obstacle
          } else if (o.type === 'coin') {
            newScore += 1;
            changed = true;
            return false; // remove coin
          }
        }
        return true;
      });
      if (changed) setScore(newScore);
      return newObstacles;
    });
  }, [started, lane, obstacles, gameOver, score]);

  // Animate lane line offset for moving dashed lines
  useEffect(() => {
    if (!started || gameOver) return;
    let anim: number;
    function animateLines() {
      setLaneLineOffset((prev) => (prev + OBSTACLE_SPEED) % 32); // 32px dash cycle, match obstacle speed
      anim = requestAnimationFrame(animateLines);
    }
    anim = requestAnimationFrame(animateLines);
    return () => cancelAnimationFrame(anim);
  }, [started, gameOver]);

  // High score update
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  }, [score, highScore]);

  // Lane marker rendering (now animated)
  const laneMarkers = [];
  for (let i = 1; i < LANES; i++) {
    const left = (ROAD_WIDTH / LANES) * i;
    laneMarkers.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: left - 2,
          top: 0,
          width: 4,
          height: '100%',
          background: `repeating-linear-gradient( to bottom, yellow 0 16px, transparent 16px 32px )`,
          backgroundPositionY: laneLineOffset,
          opacity: 0.7,
          zIndex: 1,
        }}
      />
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <AppHeader title="racing game" showBackButton showThemePicker />
        <Box
          sx={{
            flex: 1,
            width: '100vw',
            maxWidth: '100vw',
            margin: '0 auto',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.primary', fontSize: 24, mb: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>score: {score}</Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>high: {highScore}</Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              maxWidth: GAME_MAX_WIDTH,
              height: `calc(100vh - ${headerHeight}px)`,
              maxHeight: GAME_HEIGHT,
              bgcolor: '#222',
              borderRadius: { xs: 0, sm: 2 },
              position: 'relative',
              overflow: 'hidden',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              touchAction: 'none',
            }}
          >
            {/* Lane markers */}
            {laneMarkers}
            {/* Obstacles and coins */}
            {obstacles.map((o) => (
              <span
                key={o.id}
                style={{
                  position: 'absolute',
                  left: getLaneLeft(o.lane, ROAD_WIDTH),
                  top: o.y,
                  width: OBSTACLE_SIZE,
                  height: OBSTACLE_SIZE,
                  fontSize: 48,
                  zIndex: 2,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {o.emoji}
              </span>
            ))}
            {/* Car image at bottom, in selected lane */}
            <img
              src={CarImage}
              alt="Car"
              style={{
                width: CAR_WIDTH,
                height: 96,
                position: 'absolute',
                left: getLaneLeft(lane, ROAD_WIDTH),
                bottom: 16,
                transition: 'left 0.15s cubic-bezier(.4,2,.6,1)',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 3,
              }}
            />
            {/* Boom effect on collision */}
            {boom && (
              <span
                style={{
                  position: 'absolute',
                  left: getLaneLeft(lane, ROAD_WIDTH) + CAR_WIDTH / 2 - 32,
                  bottom: 16 + 32,
                  fontSize: 64,
                  zIndex: 4,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  transition: 'opacity 0.5s',
                }}
              >
                💥
              </span>
            )}
            {/* Start overlay - now with extra note and MUI */}
            {!started && !gameOver && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
                onClick={() => setStarted(true)}
                role="dialog"
                aria-modal="true"
                aria-label="start game"
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>press <b>space</b> or tap to start!</Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#fff' }}>
                  use <b>arrow keys</b> to move / collect <span role="img" aria-label="coin">💰</span> and <span role="img" aria-label="coin">🪙</span> / avoid <span role="img" aria-label="rock">🪨</span> and <span role="img" aria-label="cow">🐄</span>
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  sx={{ fontSize: 20, px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 3 }}
                  onClick={e => { e.stopPropagation(); setStarted(true); }}
                  aria-label="start game"
                >
                  start
                </Button>
              </Box>
            )}
            {/* Mobile controls: left/right buttons, fixed in left/right lanes */}
            {isMobile && started && !gameOver && (
              <>
                <Button
                  aria-label="Move Left"
                  variant="contained"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    left: 16,
                    bottom: 24,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    fontSize: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2,
                    zIndex: 20,
                    opacity: 0.85,
                  }}
                  onClick={() => setLane((prev) => Math.max(0, prev - 1))}
                  disabled={lane === 0}
                >
                  <ArrowBackIcon fontSize="inherit" />
                </Button>
                <Button
                  aria-label="Move Right"
                  variant="contained"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    right: 16,
                    bottom: 24,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    fontSize: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2,
                    zIndex: 20,
                    opacity: 0.85,
                  }}
                  onClick={() => setLane((prev) => Math.min(LANES - 1, prev + 1))}
                  disabled={lane === LANES - 1}
                >
                  <ArrowForwardIcon fontSize="inherit" />
                </Button>
              </>
            )}
          </Box>
          {/* Game Over Overlay */}
          {gameOver && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0,0,0,0.7)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'center',
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Game Over"
            >
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 8, p: 4, minWidth: 260, maxWidth: 340, mx: 'auto' }}>
                <Typography variant="h4" sx={{ color: 'error.main', mb: 2 }}>game over!</Typography>
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>score: {score}</Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>high: {highScore}</Typography>
                <Button
                  variant="contained"
                  color="warning"
                  sx={{ fontSize: 20, px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 3 }}
                  onClick={restartGame}
                  aria-label="restart game"
                >
                  restart
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default RacingGame; 