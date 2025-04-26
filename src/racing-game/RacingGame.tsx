import React, { useState, useEffect, useCallback, useRef } from 'react';
import CarImage from '../assets/racing/car.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useMediaQuery } from '@mui/material';
import AppHeader from '../components/AppHeader';

const LANES = 3;
const CAR_WIDTH = 64;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const OBSTACLE_SIZE = 64;
const OBSTACLE_EMOJIS = ['🪨', '🐄'];
const COIN_EMOJIS = ['🪙', '💰']; // gold coin and money bag
const OBSTACLE_SPEED = 4; // px per frame
const OBSTACLE_INTERVAL = 60; // frames between spawns
const COIN_INTERVAL = 90; // frames between coin spawns

const getLaneLeft = (lane: number) => {
  // Evenly space lanes across the game width
  const laneWidth = GAME_WIDTH / LANES;
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

  // Lane marker rendering (now animated)
  const laneMarkers = [];
  for (let i = 1; i < LANES; i++) {
    const left = (GAME_WIDTH / LANES) * i;
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
      <AppHeader title="Racing Game" showBackButton showThemePicker />
      <div
        style={{
          width: '100vw',
          maxWidth: isMobile ? '100vw' : 400,
          margin: '0 auto',
          padding: isMobile ? 0 : 16,
          height: isMobile ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'flex-start',
          background: isMobile ? '#222' : undefined,
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff', fontSize: 24, marginBottom: 8 }}>
          Score: {score}
        </div>
        <div
          style={{
            width: isMobile ? '100vw' : GAME_WIDTH,
            height: isMobile ? '100vh' : GAME_HEIGHT,
            maxWidth: isMobile ? '100vw' : GAME_WIDTH,
            maxHeight: isMobile ? '100vh' : GAME_HEIGHT,
            background: '#222',
            borderRadius: isMobile ? 0 : 16,
            position: 'relative',
            overflow: 'hidden',
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
                left: getLaneLeft(o.lane),
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
              left: getLaneLeft(lane),
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
                left: getLaneLeft(lane) + CAR_WIDTH / 2 - 32,
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
          {/* Start overlay - remove repeated title, keep instructions */}
          {!started && !gameOver && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
              onClick={() => setStarted(true)}
            >
              <div style={{ fontSize: 20, marginBottom: 24 }}>Press <b>Space</b> or tap to start!</div>
              <button
                style={{
                  fontSize: 20,
                  padding: '10px 32px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'gold',
                  color: '#222',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                onClick={(e) => { e.stopPropagation(); setStarted(true); }}
              >
                Start
              </button>
            </div>
          )}
          {/* Mobile controls: left/right buttons, only on small screens, semi-transparent, positioned beside car */}
          {isMobile && started && !gameOver && (
            <>
              <button
                aria-label="Move Left"
                style={{
                  position: 'absolute',
                  left: Math.max(getLaneLeft(lane) - 80, 8),
                  bottom: 24,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(40,40,40,0.5)',
                  color: '#fff',
                  fontSize: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  cursor: lane === 0 ? 'not-allowed' : 'pointer',
                  zIndex: 20,
                  opacity: 0.7,
                  transition: 'left 0.15s cubic-bezier(.4,2,.6,1)',
                }}
                onClick={() => setLane((prev) => Math.max(0, prev - 1))}
                disabled={lane === 0}
              >
                <ArrowBackIcon fontSize="inherit" />
              </button>
              <button
                aria-label="Move Right"
                style={{
                  position: 'absolute',
                  left: Math.min(getLaneLeft(lane) + CAR_WIDTH + 24, GAME_WIDTH - 56 - 8),
                  bottom: 24,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(40,40,40,0.5)',
                  color: '#fff',
                  fontSize: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  cursor: lane === LANES - 1 ? 'not-allowed' : 'pointer',
                  zIndex: 20,
                  opacity: 0.7,
                  transition: 'left 0.15s cubic-bezier(.4,2,.6,1)',
                }}
                onClick={() => setLane((prev) => Math.min(LANES - 1, prev + 1))}
                disabled={lane === LANES - 1}
              >
                <ArrowForwardIcon fontSize="inherit" />
              </button>
            </>
          )}
        </div>
        <p style={{ color: '#aaa', marginTop: 16 }}>
          Use left/right arrow keys to move the car! Dodge the obstacles, collect coins!
        </p>
        {gameOver && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 32, color: '#fff', display: 'block', marginBottom: 12 }}>Game Over!</span>
            <button
              style={{
                fontSize: 20,
                padding: '10px 32px',
                borderRadius: 8,
                border: 'none',
                background: 'gold',
                color: '#222',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onClick={restartGame}
            >
              Restart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RacingGame; 