import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ORIGINAL_MAZE, MazeTile } from './mazeData';
import { PacMan, Ghost, GhostName, Position } from './types';
import { Card, CardContent, Typography, Box, Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import './PacManGame.css'; // For grid and cell styles
import useMediaQuery from '@mui/material/useMediaQuery';

// Starting positions (classic)
const PACMAN_START: Position = { row: 11, col: 9 };
const GHOST_STARTS: Record<GhostName, Position> = {
  blinky: { row: 7, col: 8 }, // Red, left in ghost house
  pinky:  { row: 7, col: 9 }, // Pink, left-center in ghost house
  inky:   { row: 7, col: 10 }, // Blue, right-center in ghost house
  clyde:  { row: 7, col: 11 }, // Orange, right in ghost house
};

// Dynamic tile size based on viewport
const MAZE_ROWS = ORIGINAL_MAZE.length;
const MAZE_COLS = ORIGINAL_MAZE[0].length;

function useDynamicTileSize() {
  const isMobile = useMediaQuery('(max-width:600px)');
  // Use window size to determine tile size
  const [tileSize, setTileSize] = useState(24);
  useEffect(() => {
    function updateTileSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Leave some margin for UI, header, etc.
      const maxWidth = isMobile ? vw - 32 : Math.min(vw - 64, 900);
      const maxHeight = isMobile ? vh - 220 : vh - 300;
      const sizeByWidth = Math.floor(maxWidth / MAZE_COLS);
      const sizeByHeight = Math.floor(maxHeight / MAZE_ROWS);
      setTileSize(Math.max(12, Math.min(sizeByWidth, sizeByHeight)));
    }
    updateTileSize();
    window.addEventListener('resize', updateTileSize);
    return () => window.removeEventListener('resize', updateTileSize);
  }, [isMobile]);
  return tileSize;
}

const HIGH_SCORE_KEY = 'pacman-high-score';

const STRAWBERRY_SCORE = 100;

const PacManGame: React.FC = () => {
  const tileSize = useDynamicTileSize();
  // Game state: 'start', 'running', 'paused', 'gameover'
  const [gameState, setGameState] = useState<'start' | 'running' | 'paused' | 'gameover'>('start');

  // Local maze state (so we can remove pellets)
  const [maze, setMaze] = useState<MazeTile[][]>(() =>
    ORIGINAL_MAZE.map(row => [...row])
  );

  // Score state
  const [score, setScore] = useState(0);

  // Pac-Man state
  const [pacman, setPacman] = useState<PacMan>({
    position: { ...PACMAN_START },
    direction: 'down', // Start moving downwards
    nextDirection: 'down',
    lives: 3,
    isDying: false,
  });
  const pacmanRef = useRef(pacman);
  useEffect(() => { pacmanRef.current = pacman; }, [pacman]);

  // Ghosts state (now in state, not static)
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { name: 'blinky', position: GHOST_STARTS.blinky, direction: 'left', mode: 'chase', scatterTarget: { row: 0, col: 25 }, isReturning: false },
    { name: 'pinky', position: GHOST_STARTS.pinky, direction: 'up', mode: 'chase', scatterTarget: { row: 0, col: 2 }, isReturning: false },
    { name: 'inky', position: GHOST_STARTS.inky, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 27 }, isReturning: false },
    { name: 'clyde', position: GHOST_STARTS.clyde, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 0 }, isReturning: false },
  ]);
  const ghostsRef = useRef(ghosts);
  useEffect(() => { ghostsRef.current = ghosts; }, [ghosts]);

  // Maze ref for latest state
  const mazeRef = useRef(maze);
  useEffect(() => { mazeRef.current = maze; }, [maze]);

  // Level state
  const [level, setLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // Death state
  const [lives, setLives] = useState(3);
  const [showDeath, setShowDeath] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // Mode timer for scatter/chase
  const [ghostMode, setGhostMode] = useState<'scatter' | 'chase'>('scatter');
  const [, setModeTimer] = useState(0);

  // Scatter/chase timing (ms, classic: 7s scatter, 20s chase, repeat)
  const SCATTER_TIME = 7000;
  const CHASE_TIME = 20000;

  // Frightened mode timer
  const [frightenedTimer, setFrightenedTimer] = useState(0);

  // Track how many ghosts eaten in current frightened mode for score multiplier
  const [ghostsEatenInFrightened, setGhostsEatenInFrightened] = useState(0);

  // High score state
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  });

  // Track strawberry position and visibility
  const [strawberry, setStrawberry] = useState<{ row: number; col: number } | null>(null);
  const [pelletsEaten, setPelletsEaten] = useState(0);

  // Movement helpers
  const directionOffsets = {
    up:    { row: -1, col: 0 },
    down:  { row: 1, col: 0 },
    left:  { row: 0, col: -1 },
    right: { row: 0, col: 1 },
  };

  // Add at the top of PacManGame component state
  const [blinkyMode, setBlinkyMode] = useState(false);
  const keyBuffer = useRef<string[]>([]);

  // Listen for 'blinky' sequence
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      keyBuffer.current.push(e.key.toLowerCase());
      if (keyBuffer.current.length > 6) keyBuffer.current.shift();
      if (keyBuffer.current.join('').includes('blinky')) {
        setBlinkyMode(true);
        keyBuffer.current = [];
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Start game handler
  const handleStart = () => {
    setGameState('running');
    setPacman((p) => ({ ...p, direction: 'down', nextDirection: 'down' }));
  };

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'start' && (e.key === ' ' || e.key === 'Spacebar')) {
        handleStart();
        return;
      }
      if (gameState !== 'running') return;
      let dir: typeof pacman.direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') dir = 'up';
      if (e.key === 'ArrowDown' || e.key === 's') dir = 'down';
      if (e.key === 'ArrowLeft' || e.key === 'a') dir = 'left';
      if (e.key === 'ArrowRight' || e.key === 'd') dir = 'right';
      if (dir) {
        setPacman((p) => ({ ...p, nextDirection: dir! }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Game loop for Pac-Man movement
  useEffect(() => {
    if (gameState !== 'running') return;
    const interval = setInterval(() => {
      setPacman((p) => {
        let { row, col } = p.position;
        let dir = p.direction;
        let nextDir = p.nextDirection;
        // Try to turn if possible
        if (nextDir && canMove(row, col, nextDir)) {
          dir = nextDir;
        }
        // Move if possible
        if (dir && canMove(row, col, dir)) {
          const offset = directionOffsets[dir];
          row += offset.row;
          col += offset.col;
          // Tunnel wrap
          if (col < 0) col = maze[0].length - 1;
          if (col >= maze[0].length) col = 0;
          if (row < 0) row = maze.length - 1;
          if (row >= maze.length) row = 0;
        }
        // Pellet/power pellet consumption
        setMaze((mz) => {
          const tile = mz[row][col];
          if (tile === '.' || tile === 'o') {
            const newMaze = mz.map(r => [...r]);
            newMaze[row][col] = ' ';
            if (tile === '.') setScore(s => s + 10);
            if (tile === 'o') {
              setScore(s => s + 50);
              // Trigger frightened mode for ghosts
              setGhosts((prevGhosts) => prevGhosts.map(g => ({ ...g, mode: 'frightened' })));
              setFrightenedTimer(60); // 60 ticks = 6 seconds (interval is 100ms)
              setGhostsEatenInFrightened(0); // Reset multiplier
            }
            return newMaze;
          }
          return mz;
        });
        return { ...p, position: { row, col }, direction: dir };
      });
      // Handle Pac-Man eating frightened ghosts
      setGhosts((prevGhosts) => {
        let eatenCount = ghostsEatenInFrightened;
        let scoreToAdd = 0;
        const updated = prevGhosts.map(g => {
          if (
            g.position.row === pacmanRef.current.position.row &&
            g.position.col === pacmanRef.current.position.col &&
            g.mode === 'frightened'
          ) {
            eatenCount += 1;
            // Classic Pac-Man: 200, 400, 800, 1600 for consecutive ghosts
            const points = 200 * Math.pow(2, eatenCount - 1);
            scoreToAdd += points;
            return {
              ...g,
              mode: 'eaten' as Ghost['mode'],
              // Send to ghost house
              position: { ...GHOST_STARTS[g.name] },
              direction: 'up' as typeof g.direction,
            };
          }
          return g;
        });
        if (scoreToAdd > 0) setScore(s => s + scoreToAdd);
        if (eatenCount !== ghostsEatenInFrightened) setGhostsEatenInFrightened(eatenCount);
        return updated;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [gameState, maze, ghostsEatenInFrightened]);

  // Frightened mode timer effect
  useEffect(() => {
    if (frightenedTimer > 0 && gameState === 'running') {
      const timer = setInterval(() => {
        setFrightenedTimer(t => {
          if (t <= 1) {
            // End frightened mode
            setGhosts((prevGhosts) => prevGhosts.map(g =>
              g.mode === 'frightened' ? { ...g, mode: ghostMode } : g
            ));
            return 0;
          }
          return t - 1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [frightenedTimer, gameState, ghostMode]);

  // Mode timer effect
  useEffect(() => {
    if (gameState !== 'running') return;
    const interval = setInterval(() => {
      setModeTimer((prev) => {
        const next = prev + 500;
        if (ghostMode === 'scatter' && next >= SCATTER_TIME) {
          setGhostMode('chase');
          return 0;
        } else if (ghostMode === 'chase' && next >= CHASE_TIME) {
          setGhostMode('scatter');
          return 0;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, ghostMode]);

  // Level completion detection
  useEffect(() => {
    if (gameState !== 'running') return;
    // Check if any pellets or power pellets remain
    const pelletsLeft = maze.flat().some(tile => tile === '.' || tile === 'o');
    if (!pelletsLeft) {
      setGameState('paused');
      setShowLevelComplete(true);
      setTimeout(() => {
        // Reset maze, Pac-Man, and hide overlay
        setMaze(ORIGINAL_MAZE.map(row => [...row]));
        setPacman({
          position: { ...PACMAN_START },
          direction: 'down',
          nextDirection: 'down',
          lives: pacman.lives,
          isDying: false,
        });
        setLevel(l => l + 1);
        setShowLevelComplete(false);
        setGameState('running');
      }, 2000);
    }
  }, [maze, gameState]);

  // Ghost collision and game over logic
  useEffect(() => {
    if (gameState !== 'running') return;
    // Check for collision with any ghost
    const deadlyCollision = !blinkyMode && ghosts.some(g =>
      g.position.row === pacman.position.row &&
      g.position.col === pacman.position.col &&
      g.mode !== 'frightened' && g.mode !== 'eaten'
    );
    if (deadlyCollision) {
      setGameState('paused');
      setShowDeath(true);
      setTimeout(() => {
        setShowDeath(false);
        if (lives - 1 <= 0) {
          setShowGameOver(true);
          setGameState('gameover');
        } else {
          setLives(l => l - 1);
          // Reset Pac-Man and ghosts
          setPacman({
            position: { ...PACMAN_START },
            direction: 'down',
            nextDirection: 'down',
            lives: lives - 1,
            isDying: false,
          });
          setGhosts([
            { name: 'blinky', position: GHOST_STARTS.blinky, direction: 'left', mode: 'chase', scatterTarget: { row: 0, col: 25 }, isReturning: false },
            { name: 'pinky', position: GHOST_STARTS.pinky, direction: 'up', mode: 'chase', scatterTarget: { row: 0, col: 2 }, isReturning: false },
            { name: 'inky', position: GHOST_STARTS.inky, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 27 }, isReturning: false },
            { name: 'clyde', position: GHOST_STARTS.clyde, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 0 }, isReturning: false },
          ]);
          setGameState('running');
        }
      }, 1500);
    }
  }, [gameState, ghosts, pacman, lives, blinkyMode]);

  // Touch/click handler for mobile start
  const handleOverlayClick = () => {
    if (gameState === 'start') handleStart();
  };

  // Helper: can Pac-Man move in a direction?
  function canMove(row: number, col: number, dir: keyof typeof directionOffsets) {
    const offset = directionOffsets[dir];
    let nRow = row + offset.row;
    let nCol = col + offset.col;
    // Tunnel wrap
    if (nCol < 0) nCol = maze[0].length - 1;
    if (nCol >= maze[0].length) nCol = 0;
    if (nRow < 0) nRow = maze.length - 1;
    if (nRow >= maze.length) nRow = 0;
    const tile = maze[nRow][nCol];
    return tile !== 'W';
  }

  // Update ghost movement effect
  useEffect(() => {
    if (gameState !== 'running') return;
    const interval = setInterval(() => {
      setGhosts((prevGhosts) => {
        const maze = mazeRef.current;
        const pacman = pacmanRef.current;
        const ghostMode = ghostModeRef.current;
        return prevGhosts.map((ghost) => {
          let { row, col } = ghost.position;
          let dir = ghost.direction ?? 'left';
          // Eaten ghosts: move up to ghost house, then revive
          if (ghost.mode === 'eaten') {
            if (maze[row][col] === 'H') {
              return {
                ...ghost,
                mode: ghostMode as Ghost['mode'],
                direction: 'up' as typeof ghost.direction,
              };
            }
            let nRow = row;
            let nCol = col;
            if (row > GHOST_STARTS[ghost.name].row) nRow--;
            else if (row < GHOST_STARTS[ghost.name].row) nRow++;
            if (col > GHOST_STARTS[ghost.name].col) nCol--;
            else if (col < GHOST_STARTS[ghost.name].col) nCol++;
            return {
              ...ghost,
              position: { row: nRow, col: nCol },
              direction: 'up' as typeof ghost.direction,
            };
          }
          // Frightened mode: scatter away from Pac-Man
          if (ghost.mode === 'frightened') {
            const possibleDirs = Object.keys(directionOffsets).filter((d) => {
              if (
                (dir === 'up' && d === 'down') ||
                (dir === 'down' && d === 'up') ||
                (dir === 'left' && d === 'right') ||
                (dir === 'right' && d === 'left')
              ) {
                return false;
              }
              const offset = directionOffsets[d as keyof typeof directionOffsets];
              let nRow = row + offset.row;
              let nCol = col + offset.col;
              if (nCol < 0) nCol = maze[0].length - 1;
              if (nCol >= maze[0].length) nCol = 0;
              if (nRow < 0) nRow = maze.length - 1;
              if (nRow >= maze.length) nRow = 0;
              const tile = maze[nRow][nCol];
              return tile !== 'W';
            });
            let chosenDir = (dir ?? 'left') as typeof ghost.direction;
            let maxDist = -1;
            possibleDirs.forEach((d) => {
              const offset = directionOffsets[d as keyof typeof directionOffsets];
              let nRow = row + offset.row;
              let nCol = col + offset.col;
              if (nCol < 0) nCol = maze[0].length - 1;
              if (nCol >= maze[0].length) nCol = 0;
              if (nRow < 0) nRow = maze.length - 1;
              if (nRow >= maze.length) nRow = 0;
              const dist = Math.abs(nRow - pacman.position.row) + Math.abs(nCol - pacman.position.col);
              if (dist > maxDist) {
                maxDist = dist;
                chosenDir = d as typeof ghost.direction;
              }
            });
            if (possibleDirs.length === 0) {
              switch (dir) {
                case 'up': chosenDir = 'down'; break;
                case 'down': chosenDir = 'up'; break;
                case 'left': chosenDir = 'right'; break;
                case 'right': chosenDir = 'left'; break;
                default: chosenDir = 'left';
              }
            }
            const offset = directionOffsets[chosenDir ?? 'left'];
            let nRow = row + offset.row;
            let nCol = col + offset.col;
            if (nCol < 0) nCol = maze[0].length - 1;
            if (nCol >= maze[0].length) nCol = 0;
            if (nRow < 0) nRow = maze.length - 1;
            if (nRow >= maze.length) nRow = 0;
            return {
              ...ghost,
              position: { row: nRow, col: nCol },
              direction: chosenDir,
            };
          }
          // Normal AI for chase/scatter
          const target = (() => {
            if (ghostMode === 'scatter') return ghost.scatterTarget;
            if (ghost.name === 'blinky') return pacman.position;
            if (ghost.name === 'pinky') {
              const offset = directionOffsets[pacman.direction || 'left'];
              return {
                row: pacman.position.row + 4 * offset.row,
                col: pacman.position.col + 4 * offset.col,
              };
            }
            if (ghost.name === 'inky') {
              const blinky = ghostsRef.current.find(g => g.name === 'blinky') || ghost;
              const offset = directionOffsets[pacman.direction || 'left'];
              const tileAhead = {
                row: pacman.position.row + 2 * offset.row,
                col: pacman.position.col + 2 * offset.col,
              };
              return {
                row: tileAhead.row + (tileAhead.row - blinky.position.row),
                col: tileAhead.col + (tileAhead.col - blinky.position.col),
              };
            }
            if (ghost.name === 'clyde') {
              const manhattan = (a: Position, b: Position) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
              if (manhattan(ghost.position, pacman.position) > 8) {
                return pacman.position;
              } else {
                return ghost.scatterTarget;
              }
            }
            return ghost.scatterTarget;
          })();
          const possibleDirs = Object.keys(directionOffsets).filter((d) => {
            if (
              (dir === 'up' && d === 'down') ||
              (dir === 'down' && d === 'up') ||
              (dir === 'left' && d === 'right') ||
              (dir === 'right' && d === 'left')
            ) {
              return false;
            }
            const offset = directionOffsets[d as keyof typeof directionOffsets];
            let nRow = row + offset.row;
            let nCol = col + offset.col;
            if (nCol < 0) nCol = maze[0].length - 1;
            if (nCol >= maze[0].length) nCol = 0;
            if (nRow < 0) nRow = maze.length - 1;
            if (nRow >= maze.length) nRow = 0;
            const tile = maze[nRow][nCol];
            return tile !== 'W';
          });
          let chosenDir = (dir ?? 'left') as typeof ghost.direction;
          let minDist = Infinity;
          possibleDirs.forEach((d) => {
            const offset = directionOffsets[d as keyof typeof directionOffsets];
            let nRow = row + offset.row;
            let nCol = col + offset.col;
            if (nCol < 0) nCol = maze[0].length - 1;
            if (nCol >= maze[0].length) nCol = 0;
            if (nRow < 0) nRow = maze.length - 1;
            if (nRow >= maze.length) nRow = 0;
            const dist = Math.abs(nRow - target.row) + Math.abs(nCol - target.col);
            if (dist < minDist) {
              minDist = dist;
              chosenDir = d as typeof ghost.direction;
            }
          });
          if (possibleDirs.length === 0) {
            switch (dir) {
              case 'up': chosenDir = 'down'; break;
              case 'down': chosenDir = 'up'; break;
              case 'left': chosenDir = 'right'; break;
              case 'right': chosenDir = 'left'; break;
              default: chosenDir = 'left';
            }
          }
          const chosenOffset = directionOffsets[chosenDir ?? 'left'];
          let chosenNRow = row + chosenOffset.row;
          let chosenNCol = col + chosenOffset.col;
          if (chosenNCol < 0) chosenNCol = maze[0].length - 1;
          if (chosenNCol >= maze[0].length) chosenNCol = 0;
          if (chosenNRow < 0) chosenNRow = maze.length - 1;
          if (chosenNRow >= maze.length) chosenNRow = 0;
          return {
            ...ghost,
            position: { row: chosenNRow, col: chosenNCol },
            direction: chosenDir,
          };
        });
      });
    }, 240);
    return () => clearInterval(interval);
  }, [gameState, ghostsEatenInFrightened, blinkyMode]);

  // Helper to render Pac-Man SVG for the maze (absolutely centered)
  function PacManMazeSVG({ direction }: { direction: 'up' | 'down' | 'left' | 'right' | null | undefined }) {
    const rotation = {
      right: 0,
      down: 90,
      left: 180,
      up: 270,
    }[direction || 'right'];
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotation}deg)`, zIndex: 2 }}
        aria-label="Pac-Man"
        role="img"
      >
        <circle cx="9" cy="9" r="9" fill="var(--pm-pacman, #FFD046)" />
        <path d="M9 9 L18 5 A9 9 0 1 1 18 13 Z" fill="var(--pm-pacman-mouth, #181818)" />
      </svg>
    );
  }

  // Helper to render Pac-Man SVG for the status bar (inline)
  function PacManStatusSVG({ direction }: { direction: 'up' | 'down' | 'left' | 'right' | null | undefined }) {
    const rotation = {
      right: 0,
      down: 90,
      left: 180,
      up: 270,
    }[direction || 'right'];
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        style={{ display: 'inline-block', verticalAlign: 'middle', transform: `rotate(${rotation}deg)` }}
        aria-label="Pac-Man"
        role="img"
      >
        <circle cx="9" cy="9" r="9" fill="var(--pm-pacman, #FFD046)" />
        <path d="M9 9 L18 5 A9 9 0 1 1 18 13 Z" fill="var(--pm-pacman-mouth, #181818)" />
      </svg>
    );
  }

  // Add GhostSVG component for classic ghost rendering
  function GhostSVG({ color, direction, mode }: { color: string; direction: 'up' | 'down' | 'left' | 'right'; mode: 'chase' | 'scatter' | 'frightened' | 'eaten' }) {
    // Classic ghost body path
    // Frightened: blue, Eaten: eyes only
    const bodyColor = mode === 'frightened' ? 'var(--pm-frightened, #1e90ff)' : (mode === 'eaten' ? 'var(--pm-ghost-eaten, #fff)' : color);
    const eyeColor = mode === 'eaten' ? 'var(--pm-ghost-eye, #181818)' : 'var(--pm-ghost-eye-white, #fff)';
    const pupilColor = 'var(--pm-frightened, #1e90ff)';
    // Eye direction offset
    const eyeOffset = {
      up: { x: 0, y: -2 },
      down: { x: 0, y: 2 },
      left: { x: -2, y: 0 },
      right: { x: 2, y: 0 },
    }[direction];
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} aria-label="Ghost" role="img">
        {/* Body */}
        {mode !== 'eaten' && (
          <path d="M2 16 Q3 14 4 16 Q5 14 6 16 Q7 14 8 16 Q9 14 10 16 Q11 14 12 16 Q13 14 14 16 Q16 16 16 8 Q16 2 9 2 Q2 2 2 8 Q2 16 2 16 Z" fill={bodyColor} stroke="#181818" strokeWidth="0.5" />
        )}
        {/* Eyes */}
        <ellipse cx="6.5" cy="8" rx="2" ry="2.2" fill={eyeColor} />
        <ellipse cx="11.5" cy="8" rx="2" ry="2.2" fill={eyeColor} />
        {/* Pupils */}
        <ellipse cx={6.5 + eyeOffset.x} cy={8 + eyeOffset.y} rx="0.7" ry="1" fill={pupilColor} />
        <ellipse cx={11.5 + eyeOffset.x} cy={8 + eyeOffset.y} rx="0.7" ry="1" fill={pupilColor} />
        {/* Frightened ghost mouth */}
        {mode === 'frightened' && (
          <rect x="7" y="13" width="4" height="1.2" rx="0.6" fill="#fff" />
        )}
        {/* Eaten ghost: just eyes */}
      </svg>
    );
  }

  // Strawberry SVG
  function StrawberrySVG() {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} aria-label="Strawberry" role="img">
        <ellipse cx="9" cy="12" rx="5" ry="4" fill="#e53935" stroke="#b71c1c" strokeWidth="1" />
        <ellipse cx="9" cy="7" rx="3" ry="1.5" fill="#43a047" />
        <circle cx="7.5" cy="12" r="0.5" fill="#fff" />
        <circle cx="10.5" cy="13" r="0.5" fill="#fff" />
        <circle cx="9" cy="10.5" r="0.5" fill="#fff" />
      </svg>
    );
  }

  // Helper to get cell content (Pac-Man, ghost, pellet, etc.)
  function getCellContent(row: number, col: number) {
    // Pac-Man
    if (pacman.position.row === row && pacman.position.col === col) {
      return <PacManMazeSVG direction={pacman.direction} />;
    }
    // Ghosts
    const ghost = ghosts.find(g => g.position.row === row && g.position.col === col);
    if (ghost) {
      // Ghost color map
      const ghostColors: Record<string, string> = {
        blinky: '#FF0000',
        pinky: '#FFB8FF',
        inky: '#00FFFF',
        clyde: '#FFB852',
      };
      let mode: 'chase' | 'scatter' | 'frightened' | 'eaten' = ghost.mode as any;
      let color = ghostColors[ghost.name] || '#fff';
      // Ensure direction is always a valid string
      const validDirection = (ghost.direction === 'up' || ghost.direction === 'down' || ghost.direction === 'left' || ghost.direction === 'right') ? ghost.direction : 'left';
      return <GhostSVG color={color} direction={validDirection} mode={mode} />;
    }
    // Pellet
    if (maze[row][col] === '.') {
      return <div className="pellet" />;
    }
    // Power pellet
    if (maze[row][col] === 'o') {
      return <div className="power-pellet" />;
    }
    // Strawberry
    if (strawberry && strawberry.row === row && strawberry.col === col) {
      return <StrawberrySVG />;
    }
    return null;
  }

  // Helper to get cell class
  function getCellClass(tile: MazeTile) {
    switch (tile) {
      case 'W': return 'cell wall';
      case '.': return 'cell path';
      case 'o': return 'cell path';
      case ' ': return 'cell path';
      case 'G': return 'cell ghost-entrance';
      case 'H': return 'cell ghost-house';
      default: return 'cell';
    }
  }

  // Handler to restart the game
  const handleRestart = () => {
    setMaze(ORIGINAL_MAZE.map(row => [...row]));
    setScore(0);
    setLevel(1);
    setLives(3);
    setShowLevelComplete(false);
    setShowDeath(false);
    setShowGameOver(false);
    setPacman({
      position: { ...PACMAN_START },
      direction: 'down',
      nextDirection: 'down',
      lives: 3,
      isDying: false,
    });
    setGhosts([
      { name: 'blinky', position: GHOST_STARTS.blinky, direction: 'left', mode: 'chase', scatterTarget: { row: 0, col: 25 }, isReturning: false },
      { name: 'pinky', position: GHOST_STARTS.pinky, direction: 'up', mode: 'chase', scatterTarget: { row: 0, col: 2 }, isReturning: false },
      { name: 'inky', position: GHOST_STARTS.inky, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 27 }, isReturning: false },
      { name: 'clyde', position: GHOST_STARTS.clyde, direction: 'down', mode: 'chase', scatterTarget: { row: 20, col: 0 }, isReturning: false },
    ]);
    setGhostMode('scatter');
    setModeTimer(0);
    setGameState('running');
  };

  // Ghost mode ref for latest state
  const ghostModeRef = useRef(ghostMode);
  useEffect(() => { ghostModeRef.current = ghostMode; }, [ghostMode]);

  // Frightened timer ref for latest state
  const frightenedTimerRef = useRef(frightenedTimer);
  useEffect(() => { frightenedTimerRef.current = frightenedTimer; }, [frightenedTimer]);

  // Update high score if needed
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  }, [score, highScore]);

  const onboardingButtonRef = useRef<HTMLButtonElement>(null);

  // Onboarding/Instructions Overlay
  const handleOnboardingStart = () => {
    handleStart();
    setTimeout(() => {
      if (onboardingButtonRef.current) onboardingButtonRef.current.blur();
    }, 0);
  };

  useEffect(() => {
    if (gameState === 'start' && onboardingButtonRef.current) {
      onboardingButtonRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    const onboardingKeyHandler = (e: KeyboardEvent) => {
      if (gameState === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        handleOnboardingStart();
      }
    };
    window.addEventListener('keydown', onboardingKeyHandler);
    return () => window.removeEventListener('keydown', onboardingKeyHandler);
  }, [gameState]);

  // Overlays as MUI Dialogs for accessibility and theming
  const StartDialog = (
    <Dialog
      open={gameState === 'start'}
      aria-labelledby="pacman-start-title"
      aria-describedby="pacman-start-desc"
      disableEscapeKeyDown
    >
      <DialogTitle id="pacman-start-title">Welcome to Pac-Man!</DialogTitle>
      <DialogContent>
        <Typography id="pacman-start-desc" sx={{ mb: 2 }}>
          Press <b>Space</b> or <b>Enter</b> or <b>Tap</b> to start.<br />
          <b>How to play:</b> Eat all pellets, avoid ghosts, use power pellets to eat ghosts for bonus points!
        </Typography>
        <Button
          ref={onboardingButtonRef}
          variant="contained"
          color="primary"
          onClick={handleOnboardingStart}
          aria-label="Start Pac-Man"
        >
          Press to Start
        </Button>
      </DialogContent>
    </Dialog>
  );

  const LevelCompleteDialog = (
    <Dialog
      open={showLevelComplete}
      aria-labelledby="pacman-level-complete-title"
      aria-describedby="pacman-level-complete-desc"
    >
      <DialogTitle id="pacman-level-complete-title">Level Complete!</DialogTitle>
      <DialogContent>
        <Typography id="pacman-level-complete-desc" sx={{ mb: 2 }}>
          Get ready for the next level!
        </Typography>
      </DialogContent>
    </Dialog>
  );

  const DeathDialog = (
    <Dialog
      open={showDeath}
      aria-labelledby="pacman-death-title"
      aria-describedby="pacman-death-desc"
    >
      <DialogTitle id="pacman-death-title">Ouch! Pac-Man was caught!</DialogTitle>
      <DialogContent>
        <Typography id="pacman-death-desc" sx={{ mb: 2 }}>
          You lost a life. Get ready!
        </Typography>
      </DialogContent>
    </Dialog>
  );

  const GameOverDialog = (
    <Dialog
      open={showGameOver}
      aria-labelledby="pacman-gameover-title"
      aria-describedby="pacman-gameover-desc"
    >
      <DialogTitle id="pacman-gameover-title">Game Over</DialogTitle>
      <DialogContent>
        <Typography id="pacman-gameover-desc" sx={{ mb: 2 }}>
          Final Score: {score.toString().padStart(5, '0')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRestart}
          aria-label="Restart Pac-Man"
        >
          Restart Game
        </Button>
      </DialogContent>
    </Dialog>
  );

  const isMobile = useMediaQuery('(max-width:600px)');

  // On-screen D-pad controls for mobile
  const handleDPad = (dir: 'up' | 'down' | 'left' | 'right') => {
    setPacman((p) => ({ ...p, nextDirection: dir }));
  };

  const DPad = isMobile && (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }} aria-label="On-screen controls" role="group">
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', mb: 1 }}>
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%', mx: 1 }}
          aria-label="Up"
          onClick={() => handleDPad('up')}
        >
          ↑
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%', mx: 1 }}
          aria-label="Left"
          onClick={() => handleDPad('left')}
        >
          ←
        </Button>
        <Box sx={{ width: 56, height: 56, mx: 1 }} />
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%', mx: 1 }}
          aria-label="Right"
          onClick={() => handleDPad('right')}
        >
          →
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', mt: 1 }}>
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 56, minHeight: 56, borderRadius: '50%', mx: 1 }}
          aria-label="Down"
          onClick={() => handleDPad('down')}
        >
          ↓
        </Button>
      </Box>
    </Box>
  );

  // Swipe gesture state
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < 24 && absDy < 24) return; // Ignore small swipes
    let dir: 'up' | 'down' | 'left' | 'right' | null = null;
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    if (dir) {
      setPacman((p) => ({ ...p, nextDirection: dir! }));
    }
    touchStart.current = null;
  }, []);

  // Helper to get all open cells
  function getOpenCells(maze: MazeTile[][]) {
    const open: { row: number; col: number }[] = [];
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === ' ' || maze[r][c] === '.' || maze[r][c] === 'o') {
          open.push({ row: r, col: c });
        }
      }
    }
    return open;
  }

  // Show strawberry after 30 pellets eaten, hide after 10 seconds or when collected
  useEffect(() => {
    if (!strawberry && pelletsEaten > 0 && pelletsEaten % 30 === 0) {
      const openCells = getOpenCells(maze);
      if (openCells.length > 0) {
        const idx = Math.floor(Math.random() * openCells.length);
        setStrawberry(openCells[idx]);
        // Hide after 10 seconds if not collected
        const timeout = setTimeout(() => setStrawberry(null), 10000);
        return () => clearTimeout(timeout);
      }
    }
  }, [pelletsEaten, strawberry, maze]);

  // Update pellet count and check for strawberry collection
  useEffect(() => {
    // Count pellets eaten
    const totalPellets = ORIGINAL_MAZE.flat().filter(t => t === '.' || t === 'o').length;
    const pelletsLeft = maze.flat().filter(t => t === '.' || t === 'o').length;
    setPelletsEaten(totalPellets - pelletsLeft);
    // Check for strawberry collection
    if (strawberry && pacman.position.row === strawberry.row && pacman.position.col === strawberry.col) {
      setScore(s => s + STRAWBERRY_SCORE);
      setStrawberry(null);
    }
  }, [maze, pacman.position, strawberry]);

  return (
    <Card
      sx={{ minWidth: 360, maxWidth: '100vw', mx: 'auto', mt: 4, boxShadow: 6, borderRadius: 3, background: '#181818', position: 'relative' }}
      role="main"
      aria-label="Pac-Man game"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Score/lives UI fixed at the top of the card */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(24,24,24,0.95)', py: 1, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 12 }} aria-label="Game status">
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Typography variant="body1" sx={{ color: '#fff' }} aria-label="Score" aria-live="polite">Score: {score.toString().padStart(5, '0')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mr: 3 }} aria-label="Lives" aria-live="polite">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} style={{ display: 'inline-block' }}>
              <PacManStatusSVG direction="right" />
            </span>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Typography variant="body1" sx={{ color: '#fff' }} aria-label="Level">Level: {level}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ color: '#FFD046' }} aria-label="High Score">High Score: {highScore.toString().padStart(5, '0')}</Typography>
        </Box>
      </Box>
      <CardContent sx={{ pt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#FFD046', fontWeight: 700 }}>
          Pac-Man
        </Typography>
        <Box display="flex" justifyContent="center" sx={{ overflowX: 'auto', position: 'relative' }}>
          {StartDialog}
          {LevelCompleteDialog}
          {DeathDialog}
          {GameOverDialog}
          <div
            className="maze-grid"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${ORIGINAL_MAZE.length}, ${tileSize}px)`,
              gridTemplateColumns: `repeat(${ORIGINAL_MAZE[0].length}, ${tileSize}px)`,
              background: '#181818',
              border: '4px solid #FFD046',
              borderRadius: 12,
              marginTop: 0,
              maxWidth: '100vw',
              overflow: 'hidden',
            }}
            role="region"
            aria-label="Pac-Man maze"
          >
            {ORIGINAL_MAZE.map((row, rIdx) =>
              row.map((tile, cIdx) => (
                <div
                  key={`cell-${rIdx}-${cIdx}`}
                  className={getCellClass(tile)}
                  style={{ width: tileSize, height: tileSize, position: 'relative' }}
                >
                  {getCellContent(rIdx, cIdx)}
                </div>
              ))
            )}
          </div>
        </Box>
        {DPad}
      </CardContent>
    </Card>
  );
};

export default PacManGame; 