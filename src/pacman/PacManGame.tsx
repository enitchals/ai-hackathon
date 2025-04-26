import React, { useEffect, useRef, useState } from 'react';
import { ORIGINAL_MAZE, MazeTile } from './mazeData';
import { PacMan, Ghost, GhostName, Position } from './types';
import { Card, CardContent, Typography, Box } from '@mui/material';
import './PacManGame.css'; // For grid and cell styles

// Starting positions (classic)
const PACMAN_START: Position = { row: 11, col: 9 };
const GHOST_STARTS: Record<GhostName, Position> = {
  blinky: { row: 7, col: 8 }, // Red, left in ghost house
  pinky:  { row: 7, col: 9 }, // Pink, left-center in ghost house
  inky:   { row: 7, col: 10 }, // Blue, right-center in ghost house
  clyde:  { row: 7, col: 11 }, // Orange, right in ghost house
};

const TILE_SIZE = 24; // px
const WALL_COLOR = '#1976D2'; // Bright blue
const PATH_COLOR = '#000'; // Black
const GHOST_HOUSE_STROKE = '#B0B6FF'; // Light blue/gray for ghost house outline

const ghostColors: Record<GhostName, string> = {
  blinky: '#FF0000', // Red
  pinky: '#FFB8FF',  // Pink
  inky: '#00FFFF',   // Cyan
  clyde: '#FFB852',  // Orange
};

// Ghost house rectangle (hardcoded for now, based on classic maze)
const GHOST_HOUSE_RECT = {
  x: 6 * TILE_SIZE,
  y: 7 * TILE_SIZE,
  width: 7 * TILE_SIZE,
  height: 1 * TILE_SIZE,
};

const PacManGame: React.FC = () => {
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
  const [modeTimer, setModeTimer] = useState(0);

  // Scatter/chase timing (ms, classic: 7s scatter, 20s chase, repeat)
  const SCATTER_TIME = 7000;
  const CHASE_TIME = 20000;

  // Frightened mode timer
  const [frightenedTimer, setFrightenedTimer] = useState(0);

  // Track how many ghosts eaten in current frightened mode for score multiplier
  const [ghostsEatenInFrightened, setGhostsEatenInFrightened] = useState(0);

  // Movement helpers
  const directionOffsets = {
    up:    { row: -1, col: 0 },
    down:  { row: 1, col: 0 },
    left:  { row: 0, col: -1 },
    right: { row: 0, col: 1 },
  };

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
    }, 180);
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
    const deadlyCollision = ghosts.some(g =>
      g.position.row === pacman.position.row &&
      g.position.col === pacman.position.col &&
      g.mode !== 'frightened' && g.mode !== 'eaten'
    );
    if (deadlyCollision) {
      setGameState('paused');
      setShowDeath(true);
      setTimeout(() => {
        setShowDeath(false);
        if (lives <= 1) {
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
  }, [gameState, ghosts, pacman, lives]);

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

  // Helper: Manhattan distance
  function manhattan(a: Position, b: Position) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  // Helper: get target tile for each ghost
  function getGhostTarget(ghost: Ghost): Position {
    if (ghostMode === 'scatter') {
      // Scatter: each ghost targets its corner
      return ghost.scatterTarget;
    }
    // Chase mode
    if (ghost.name === 'blinky') {
      // Blinky: target Pac-Man's current tile
      return pacman.position;
    }
    if (ghost.name === 'pinky') {
      // Pinky: target 4 tiles ahead of Pac-Man's direction
      const offset = directionOffsets[pacman.direction || 'left'];
      return {
        row: pacman.position.row + 4 * offset.row,
        col: pacman.position.col + 4 * offset.col,
      };
    }
    if (ghost.name === 'inky') {
      // Inky: vector from Blinky through 2 tiles ahead of Pac-Man, doubled
      const blinky = ghosts.find(g => g.name === 'blinky') || ghost;
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
      // Clyde: chase Pac-Man if far, else scatter
      if (manhattan(ghost.position, pacman.position) > 8) {
        return pacman.position;
      } else {
        return ghost.scatterTarget;
      }
    }
    return ghost.scatterTarget;
  }

  // Update ghost movement effect
  useEffect(() => {
    if (gameState !== 'running') return;
    const interval = setInterval(() => {
      setGhosts((prevGhosts) => {
        const maze = mazeRef.current;
        const pacman = pacmanRef.current;
        const ghostMode = ghostModeRef.current;
        const frightenedTimer = frightenedTimerRef.current;
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
        });
      });
    }, 200);
    return () => clearInterval(interval);
  }, [gameState]);

  // Helper to get cell content (Pac-Man, ghost, pellet, etc.)
  function getCellContent(row: number, col: number) {
    // Pac-Man
    if (pacman.position.row === row && pacman.position.col === col) {
      return <div className="pacman" />;
    }
    // Ghosts
    const ghost = ghosts.find(g => g.position.row === row && g.position.col === col);
    if (ghost) {
      if (ghost.mode === 'frightened') {
        return <div className="ghost ghost-frightened" />;
      }
      if (ghost.mode === 'eaten') {
        return <div className="ghost ghost-eaten" />;
      }
      return <div className={`ghost ghost-${ghost.name}`} />;
    }
    // Pellet
    if (maze[row][col] === '.') {
      return <div className="pellet" />;
    }
    // Power pellet
    if (maze[row][col] === 'o') {
      return <div className="power-pellet" />;
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

  return (
    <Card sx={{ minWidth: 360, maxWidth: '100vw', mx: 'auto', mt: 4, boxShadow: 6, borderRadius: 3, background: '#181818' }}>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#FFD046', fontWeight: 700 }}>
          Pac-Man
        </Typography>
        {/* Score/lives UI */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <Typography variant="body1" sx={{ color: '#fff', mr: 3 }}>Score: {score.toString().padStart(5, '0')}</Typography>
          <Typography variant="body1" sx={{ color: '#fff', mr: 3 }}>Lives: {lives}</Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>Level: {level}</Typography>
        </Box>
        <Box display="flex" justifyContent="center" sx={{ overflowX: 'auto', position: 'relative' }}>
          {/* Start overlay */}
          {gameState === 'start' && (
            <div
              className="start-overlay"
              onClick={handleOverlayClick}
              style={{
                position: 'absolute',
                zIndex: 10,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD046',
                fontSize: 28,
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 12,
              }}
            >
              <div>Press <kbd>Space</kbd> or Tap to Start</div>
            </div>
          )}
          {/* Level Complete overlay */}
          {showLevelComplete && (
            <div
              className="level-complete-overlay"
              style={{
                position: 'absolute',
                zIndex: 20,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD046',
                fontSize: 32,
                fontWeight: 700,
                borderRadius: 12,
              }}
            >
              <span>Level Complete!</span>
            </div>
          )}
          {/* Death overlay */}
          {showDeath && (
            <div
              className="death-overlay"
              style={{
                position: 'absolute',
                zIndex: 30,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD046',
                fontSize: 32,
                fontWeight: 700,
                borderRadius: 12,
              }}
            >
              <span>Ouch! Pac-Man was caught!</span>
            </div>
          )}
          {/* Game Over overlay */}
          {showGameOver && (
            <div
              className="gameover-overlay"
              style={{
                position: 'absolute',
                zIndex: 40,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD046',
                fontSize: 36,
                fontWeight: 700,
                borderRadius: 12,
              }}
            >
              <span>Game Over</span>
              <span style={{ fontSize: 20, marginTop: 16 }}>Final Score: {score.toString().padStart(5, '0')}</span>
              <button
                style={{
                  marginTop: 32,
                  padding: '10px 32px',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#181818',
                  background: '#FFD046',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                onClick={handleRestart}
              >
                Restart Game
              </button>
            </div>
          )}
          <div
            className="maze-grid"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${ORIGINAL_MAZE.length}, ${TILE_SIZE}px)`,
              gridTemplateColumns: `repeat(${ORIGINAL_MAZE[0].length}, ${TILE_SIZE}px)`,
              background: '#181818',
              border: '4px solid #FFD046',
              borderRadius: 12,
              marginTop: 0,
              maxWidth: '100vw',
              overflow: 'hidden',
            }}
          >
            {ORIGINAL_MAZE.map((row, rIdx) =>
              row.map((tile, cIdx) => (
                <div
                  key={`cell-${rIdx}-${cIdx}`}
                  className={getCellClass(tile)}
                  style={{ width: TILE_SIZE, height: TILE_SIZE, position: 'relative' }}
                >
                  {getCellContent(rIdx, cIdx)}
                </div>
              ))
            )}
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PacManGame; 