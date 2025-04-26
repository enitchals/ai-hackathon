import React, { useEffect, useRef, useState, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import { Box, Paper, Typography, Button, Stack, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { tetrisTheme, TetrominoType } from './tetrisTheme';
import { tetrominoShapes } from './tetrominoShapes';
import { Playfield, Tetromino, GameStatus, GameState } from './types';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 28; // px, can adjust for responsive
const GRAVITY_INTERVAL = 600; // ms, will decrease with level

const SCORE_TABLE = [0, 100, 300, 500, 800]; // lines cleared: 1,2,3,4
const LINES_PER_LEVEL = 10;
const HIGH_SCORE_KEY = 'tetris-high-score';

function createEmptyPlayfield(): Playfield {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ type: null, filled: false }))
  );
}

function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    rotation: 0,
    row: 0,
    col: 3, // spawn near center
    shape: tetrominoShapes[type][0],
  };
}

function canMove(playfield: Playfield, tetromino: Tetromino, dRow: number, dCol: number, rotationDelta = 0): boolean {
  const nextRotation = (tetromino.rotation + rotationDelta + 4) % 4;
  const shape = tetrominoShapes[tetromino.type][nextRotation];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r][c]) continue;
      const newRow = tetromino.row + dRow + r;
      const newCol = tetromino.col + dCol + c;
      if (
        newRow < 0 ||
        newRow >= BOARD_HEIGHT ||
        newCol < 0 ||
        newCol >= BOARD_WIDTH ||
        (playfield[newRow][newCol].filled)
      ) {
        return false;
      }
    }
  }
  return true;
}

function lockTetromino(playfield: Playfield, tetromino: Tetromino): Playfield {
  const newField = playfield.map(row => row.map(cell => ({ ...cell })));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (tetromino.shape[r][c]) {
        const row = tetromino.row + r;
        const col = tetromino.col + c;
        if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
          newField[row][col] = { type: tetromino.type, filled: true };
        }
      }
    }
  }
  return newField;
}

function clearLines(playfield: Playfield): { newField: Playfield; linesCleared: number } {
  const newField: Playfield = [];
  let linesCleared = 0;
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (playfield[row].every(cell => cell.filled)) {
      linesCleared++;
    } else {
      newField.push(playfield[row]);
    }
  }
  // Add empty rows at the top
  while (newField.length < BOARD_HEIGHT) {
    newField.unshift(Array.from({ length: BOARD_WIDTH }, () => ({ type: null, filled: false })));
  }
  return { newField, linesCleared };
}

function renderMiniTetromino(type: TetrominoType | null, size = 18) {
  if (!type) return <Box sx={{ width: size * 4, height: size * 4 }} />;
  const shape = tetrominoShapes[type][0];
  return (
    <Box sx={{ width: size * 4, height: size * 4, display: 'flex', flexWrap: 'wrap', position: 'relative' }}>
      {shape.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <Box
              key={`${r}-${c}`}
              sx={{
                width: size,
                height: size,
                position: 'absolute',
                left: c * size,
                top: r * size,
                bgcolor: tetrisTheme[type].main,
                border: `2px solid ${tetrisTheme[type].border}`,
                borderRadius: 1,
                boxShadow: `inset 2px 2px 6px #fff6, inset -2px -2px 8px #0002`,
              }}
            />
          ) : null
        )
      )}
    </Box>
  );
}

// Find ghost piece row
function getGhostRow(playfield: Playfield, tetromino: Tetromino): number {
  let ghostRow = tetromino.row;
  while (canMove(playfield, { ...tetromino, row: ghostRow + 1 }, 0, 0)) {
    ghostRow++;
  }
  return ghostRow;
}

const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => {
    const playfield = createEmptyPlayfield();
    const activeTetromino = createTetromino(getRandomTetrominoType());
    const highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    return {
      playfield,
      activeTetromino,
      nextTetrominoes: [getRandomTetrominoType(), getRandomTetrominoType(), getRandomTetrominoType()],
      holdTetromino: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      status: GameStatus.Idle,
      highScore,
    };
  });
  const lastDropTime = useRef(performance.now());
  const [showPause, setShowPause] = useState(false);
  const onboardingButtonRef = useRef<HTMLButtonElement>(null);

  // Onboarding/Instructions Overlay
  const handleStart = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.Running }));
    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.focus();
    }, 0);
  };

  useEffect(() => {
    if (gameState.status === GameStatus.Idle && onboardingButtonRef.current) {
      onboardingButtonRef.current.focus();
    }
  }, [gameState.status]);

  // Draw playfield and active tetromino
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw playfield
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const cell = gameState.playfield[row][col];
        if (cell.filled && cell.type) {
          // 3D effect: light top/left, dark bottom/right
          ctx.fillStyle = tetrisTheme[cell.type].main;
          ctx.strokeStyle = tetrisTheme[cell.type].border;
          ctx.lineWidth = 2;
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          // 3D shading
          ctx.save();
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = '#fff'; // light highlight
          ctx.beginPath();
          ctx.moveTo(col * CELL_SIZE, row * CELL_SIZE + CELL_SIZE);
          ctx.lineTo(col * CELL_SIZE, row * CELL_SIZE);
          ctx.lineTo(col * CELL_SIZE + CELL_SIZE, row * CELL_SIZE);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = '#000'; // shadow
          ctx.beginPath();
          ctx.moveTo(col * CELL_SIZE, row * CELL_SIZE + CELL_SIZE);
          ctx.lineTo(col * CELL_SIZE + CELL_SIZE, row * CELL_SIZE + CELL_SIZE);
          ctx.lineTo(col * CELL_SIZE + CELL_SIZE, row * CELL_SIZE);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#f8f8fa';
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    // Draw ghost piece
    const { activeTetromino } = gameState;
    const ghostRow = getGhostRow(gameState.playfield, activeTetromino);
    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (activeTetromino.shape[r][c]) {
          const drawRow = ghostRow + r;
          const drawCol = activeTetromino.col + c;
          if (
            drawRow >= 0 &&
            drawRow < BOARD_HEIGHT &&
            drawCol >= 0 &&
            drawCol < BOARD_WIDTH
          ) {
            ctx.fillStyle = tetrisTheme[activeTetromino.type].main;
            ctx.strokeStyle = tetrisTheme[activeTetromino.type].border;
            ctx.lineWidth = 2;
            ctx.fillRect(drawCol * CELL_SIZE, drawRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(drawCol * CELL_SIZE, drawRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
    ctx.restore();
    // Draw active tetromino (on top of ghost)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (activeTetromino.shape[r][c]) {
          const drawRow = activeTetromino.row + r;
          const drawCol = activeTetromino.col + c;
          if (
            drawRow >= 0 &&
            drawRow < BOARD_HEIGHT &&
            drawCol >= 0 &&
            drawCol < BOARD_WIDTH
          ) {
            ctx.fillStyle = tetrisTheme[activeTetromino.type].main;
            ctx.strokeStyle = tetrisTheme[activeTetromino.type].border;
            ctx.lineWidth = 2;
            ctx.fillRect(drawCol * CELL_SIZE, drawRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(drawCol * CELL_SIZE, drawRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            // 3D shading
            ctx.save();
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(drawCol * CELL_SIZE, drawRow * CELL_SIZE + CELL_SIZE);
            ctx.lineTo(drawCol * CELL_SIZE, drawRow * CELL_SIZE);
            ctx.lineTo(drawCol * CELL_SIZE + CELL_SIZE, drawRow * CELL_SIZE);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(drawCol * CELL_SIZE, drawRow * CELL_SIZE + CELL_SIZE);
            ctx.lineTo(drawCol * CELL_SIZE + CELL_SIZE, drawRow * CELL_SIZE + CELL_SIZE);
            ctx.lineTo(drawCol * CELL_SIZE + CELL_SIZE, drawRow * CELL_SIZE);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }
  }, [gameState]);

  // Game loop: gravity
  useEffect(() => {
    if (gameState.status !== GameStatus.Running) return;
    let animationId: number;
    const loop = (now: number) => {
      if (now - lastDropTime.current > GRAVITY_INTERVAL) {
        lastDropTime.current = now;
        setGameState(prev => {
          const { playfield, activeTetromino, nextTetrominoes, score, lines } = prev;
          if (canMove(playfield, activeTetromino, 1, 0)) {
            // Move down
            const nextTetromino = { ...activeTetromino, row: activeTetromino.row + 1 };
            nextTetromino.shape = tetrominoShapes[nextTetromino.type][nextTetromino.rotation];
            return { ...prev, activeTetromino: nextTetromino };
          } else {
            // Lock piece
            let newField = lockTetromino(playfield, activeTetromino);
            // Clear lines
            const { newField: clearedField, linesCleared } = clearLines(newField);
            newField = clearedField;
            // Scoring
            const newScore = score + SCORE_TABLE[linesCleared];
            const newLines = lines + linesCleared;
            const newLevel = 1 + Math.floor(newLines / LINES_PER_LEVEL);
            // Spawn new tetromino
            const nextType = nextTetrominoes[0];
            const newActive = createTetromino(nextType);
            const newNext = [...nextTetrominoes.slice(1), getRandomTetrominoType()];
            // Check for game over
            if (!canMove(newField, newActive, 0, 0)) {
              return { ...prev, playfield: newField, status: GameStatus.GameOver, score: newScore, lines: newLines, level: newLevel };
            }
            return {
              ...prev,
              playfield: newField,
              activeTetromino: newActive,
              nextTetrominoes: newNext,
              canHold: true,
              score: newScore,
              lines: newLines,
              level: newLevel,
            };
          }
        });
      }
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
    // eslint-disable-next-line
  }, [gameState.status]);

  // Hold piece logic
  const doHold = useCallback(() => {
    setGameState(prev => {
      if (!prev.canHold) return prev;
      let { holdTetromino, activeTetromino, nextTetrominoes } = prev;
      let newActive: Tetromino;
      let newHold: TetrominoType;
      let newNext = nextTetrominoes;
      if (holdTetromino) {
        // Swap
        newActive = createTetromino(holdTetromino);
        newHold = activeTetromino.type;
      } else {
        // Hold for first time
        newActive = createTetromino(nextTetrominoes[0]);
        newHold = activeTetromino.type;
        newNext = [...nextTetrominoes.slice(1), getRandomTetrominoType()];
      }
      return {
        ...prev,
        activeTetromino: newActive,
        holdTetromino: newHold,
        nextTetrominoes: newNext,
        canHold: false,
      };
    });
  }, []);

  // Pause logic
  const doPause = useCallback(() => {
    setGameState(prev =>
      prev.status === GameStatus.Running
        ? { ...prev, status: GameStatus.Paused }
        : prev
    );
    setShowPause(true);
  }, []);
  const doResume = useCallback(() => {
    setGameState(prev =>
      prev.status === GameStatus.Paused
        ? { ...prev, status: GameStatus.Running }
        : prev
    );
    setShowPause(false);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.status === GameStatus.Idle && (e.key === ' ' || e.key === 'Enter')) {
      handleStart();
      return;
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (gameState.status === GameStatus.Running) doPause();
      else if (gameState.status === GameStatus.Paused) doResume();
      return;
    }
    if (gameState.status !== GameStatus.Running) return;
    if (e.key === 'h' || e.key === 'H') {
      doHold();
      return;
    }
    setGameState(prev => {
      let { activeTetromino, playfield, nextTetrominoes, score, lines } = prev;
      let moved = false;
      if (e.key === 'ArrowLeft') {
        if (canMove(playfield, activeTetromino, 0, -1)) {
          activeTetromino = { ...activeTetromino, col: activeTetromino.col - 1 };
          moved = true;
        }
      } else if (e.key === 'ArrowRight') {
        if (canMove(playfield, activeTetromino, 0, 1)) {
          activeTetromino = { ...activeTetromino, col: activeTetromino.col + 1 };
          moved = true;
        }
      } else if (e.key === 'ArrowDown') {
        if (canMove(playfield, activeTetromino, 1, 0)) {
          activeTetromino = { ...activeTetromino, row: activeTetromino.row + 1 };
          moved = true;
        }
      } else if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') {
        // Rotate clockwise
        const nextRotation = (activeTetromino.rotation + 1) % 4;
        const rotated = { ...activeTetromino, rotation: nextRotation, shape: tetrominoShapes[activeTetromino.type][nextRotation] };
        if (canMove(playfield, rotated, 0, 0)) {
          activeTetromino = rotated;
          moved = true;
        }
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        // Hard drop
        let dropRow = activeTetromino.row;
        while (canMove(playfield, { ...activeTetromino, row: dropRow + 1 }, 0, 0)) {
          dropRow++;
        }
        activeTetromino = { ...activeTetromino, row: dropRow };
        moved = true;
        // Lock immediately after hard drop
        let newField = lockTetromino(playfield, activeTetromino);
        // Clear lines
        const { newField: clearedField, linesCleared } = clearLines(newField);
        newField = clearedField;
        // Scoring
        const newScore = score + SCORE_TABLE[linesCleared];
        const newLines = lines + linesCleared;
        const newLevel = 1 + Math.floor(newLines / LINES_PER_LEVEL);
        // Spawn new tetromino
        const nextType = nextTetrominoes[0];
        const newActive = createTetromino(nextType);
        const newNext = [...nextTetrominoes.slice(1), getRandomTetrominoType()];
        if (!canMove(newField, newActive, 0, 0)) {
          return { ...prev, playfield: newField, status: GameStatus.GameOver, score: newScore, lines: newLines, level: newLevel };
        }
        return {
          ...prev,
          playfield: newField,
          activeTetromino: newActive,
          nextTetrominoes: newNext,
          canHold: true,
          score: newScore,
          lines: newLines,
          level: newLevel,
        };
      }
      if (moved) {
        activeTetromino.shape = tetrominoShapes[activeTetromino.type][activeTetromino.rotation];
        return { ...prev, activeTetromino };
      }
      return prev;
    });
    // eslint-disable-next-line
  }, [gameState.status, doHold, doPause, doResume]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update high score in localStorage
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      localStorage.setItem(HIGH_SCORE_KEY, String(gameState.score));
      setGameState(prev => ({ ...prev, highScore: prev.score }));
    }
  }, [gameState.score, gameState.highScore]);

  // Game over overlay
  const handleRestart = () => {
    setGameState(_ => {
      const playfield = createEmptyPlayfield();
      const activeTetromino = createTetromino(getRandomTetrominoType());
      const highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
      return {
        playfield,
        activeTetromino,
        nextTetrominoes: [getRandomTetrominoType(), getRandomTetrominoType(), getRandomTetrominoType()],
        holdTetromino: null,
        canHold: true,
        score: 0,
        level: 1,
        lines: 0,
        status: GameStatus.Running,
        highScore,
      };
    });
    setShowPause(false);
  };

  const GameOverOverlay = (
    <Dialog open={gameState.status === GameStatus.GameOver}>
      <DialogTitle>Game Over</DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Score: {gameState.score}</Typography>
        <Typography variant="body1">Lines: {gameState.lines}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>High Score: {gameState.highScore}</Typography>
        <Button variant="contained" onClick={handleRestart}>Restart</Button>
      </DialogContent>
    </Dialog>
  );

  // Side panel UI
  const SidePanel = (
    <Paper elevation={2} sx={{ p: 2, minWidth: 120, bgcolor: 'background.paper', borderRadius: 3, mb: 2 }} aria-label="Tetris sidebar" role="complementary">
      <Stack spacing={2} alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Hold</Typography>
          {renderMiniTetromino(gameState.holdTetromino)}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Next</Typography>
          {gameState.nextTetrominoes.slice(0, 3).map((type, i) => (
            <Box key={i} sx={{ mb: 0.5 }}>{renderMiniTetromino(type)}</Box>
          ))}
        </Box>
        <Box aria-live="polite" aria-atomic="true">
          <Typography variant="subtitle2" color="text.secondary">Score</Typography>
          <Typography variant="h6">{gameState.score}</Typography>
        </Box>
        <Box aria-live="polite" aria-atomic="true">
          <Typography variant="subtitle2" color="text.secondary">Level</Typography>
          <Typography variant="h6">{gameState.level}</Typography>
        </Box>
        <Box aria-live="polite" aria-atomic="true">
          <Typography variant="subtitle2" color="text.secondary">Lines</Typography>
          <Typography variant="h6">{gameState.lines}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">High Score</Typography>
          <Typography variant="h6">{gameState.highScore}</Typography>
        </Box>
      </Stack>
    </Paper>
  );

  // On-screen controls for mobile (4-button keypad layout)
  const Controls = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }} aria-label="Tetris controls" role="group">
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 1 }}>
        <Button variant="contained" size="small" aria-label="Rotate" onClick={() => setGameState(prev => {
          if (prev.status !== GameStatus.Running) return prev;
          let { activeTetromino, playfield } = prev;
          // Rotate clockwise
          const nextRotation = (activeTetromino.rotation + 1) % 4;
          const rotated = { ...activeTetromino, rotation: nextRotation, shape: tetrominoShapes[activeTetromino.type][nextRotation] };
          if (canMove(playfield, rotated, 0, 0)) {
            return { ...prev, activeTetromino: rotated };
          }
          return prev;
        })}>⟳</Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <Button variant="contained" size="small" aria-label="Left" onClick={() => setGameState(prev => {
          if (prev.status !== GameStatus.Running) return prev;
          let { activeTetromino, playfield } = prev;
          if (canMove(playfield, activeTetromino, 0, -1)) {
            activeTetromino = { ...activeTetromino, col: activeTetromino.col - 1 };
            activeTetromino.shape = tetrominoShapes[activeTetromino.type][activeTetromino.rotation];
            return { ...prev, activeTetromino };
          }
          return prev;
        })}>◀️</Button>
        <Button variant="contained" size="small" aria-label="Down" onClick={() => setGameState(prev => {
          if (prev.status !== GameStatus.Running) return prev;
          let { activeTetromino, playfield } = prev;
          if (canMove(playfield, activeTetromino, 1, 0)) {
            activeTetromino = { ...activeTetromino, row: activeTetromino.row + 1 };
            activeTetromino.shape = tetrominoShapes[activeTetromino.type][activeTetromino.rotation];
            return { ...prev, activeTetromino };
          }
          return prev;
        })}>▼</Button>
        <Button variant="contained" size="small" aria-label="Right" onClick={() => setGameState(prev => {
          if (prev.status !== GameStatus.Running) return prev;
          let { activeTetromino, playfield } = prev;
          if (canMove(playfield, activeTetromino, 0, 1)) {
            activeTetromino = { ...activeTetromino, col: activeTetromino.col + 1 };
            activeTetromino.shape = tetrominoShapes[activeTetromino.type][activeTetromino.rotation];
            return { ...prev, activeTetromino };
          }
          return prev;
        })}>▶️</Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1 }}>
        <Button variant="contained" size="small" aria-label="Hard Drop" color="secondary" onClick={() => setGameState(prev => {
          if (prev.status !== GameStatus.Running) return prev;
          let { activeTetromino, playfield, nextTetrominoes, score, lines } = prev;
          let dropRow = activeTetromino.row;
          while (canMove(playfield, { ...activeTetromino, row: dropRow + 1 }, 0, 0)) {
            dropRow++;
          }
          activeTetromino = { ...activeTetromino, row: dropRow };
          // Lock immediately after hard drop
          let newField = lockTetromino(playfield, activeTetromino);
          // Clear lines
          const { newField: clearedField, linesCleared } = clearLines(newField);
          newField = clearedField;
          // Scoring
          const newScore = score + SCORE_TABLE[linesCleared];
          const newLines = lines + linesCleared;
          const newLevel = 1 + Math.floor(newLines / LINES_PER_LEVEL);
          // Spawn new tetromino
          const nextType = nextTetrominoes[0];
          const newActive = createTetromino(nextType);
          const newNext = [...nextTetrominoes.slice(1), getRandomTetrominoType()];
          if (!canMove(newField, newActive, 0, 0)) {
            return { ...prev, playfield: newField, status: GameStatus.GameOver, score: newScore, lines: newLines, level: newLevel };
          }
          return {
            ...prev,
            playfield: newField,
            activeTetromino: newActive,
            nextTetrominoes: newNext,
            canHold: true,
            score: newScore,
            lines: newLines,
            level: newLevel,
          };
        })}>⏬</Button>
        <Button variant="contained" size="small" aria-label="Hold" onClick={doHold} disabled={!gameState.canHold}>Hold</Button>
        <Button variant="contained" size="small" aria-label="Pause" onClick={doPause}><PauseIcon /></Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        Controls: ← → ▼ ⟳ (rotate) ⏬ (hard drop) Hold (H) Pause (P/Esc)
      </Typography>
    </Box>
  );

  // Pause overlay
  const PauseOverlay = (
    <Dialog open={showPause || gameState.status === GameStatus.Paused} onClose={doResume}>
      <DialogTitle>Paused</DialogTitle>
      <DialogContent>
        <Button variant="contained" onClick={doResume} startIcon={<PlayArrowIcon />}>Resume</Button>
      </DialogContent>
    </Dialog>
  );

  // Onboarding/Instructions Overlay
  const OnboardingOverlay = (
    <Dialog
      open={gameState.status === GameStatus.Idle}
      aria-labelledby="tetris-onboarding-title"
      aria-describedby="tetris-onboarding-desc"
      disableEscapeKeyDown
    >
      <DialogTitle id="tetris-onboarding-title">Welcome to Tetris!</DialogTitle>
      <DialogContent>
        <Typography id="tetris-onboarding-desc" sx={{ mb: 2 }}>
          <b>How to play:</b><br />
          - Move: <b>← →</b> (arrows or on-screen buttons)<br />
          - Rotate: <b>↑</b> or <b>X</b> (or ⟳ button)<br />
          - Soft Drop: <b>↓</b> (or ▼ button)<br />
          - Hard Drop: <b>Space</b> (or ⏬ button)<br />
          - Hold: <b>H</b> (or Hold button)<br />
          - Pause: <b>P</b> or <b>Esc</b><br />
          <br />
          <b>Goal:</b> Clear lines for points. Game speeds up as you level up!
        </Typography>
        <Button
          ref={onboardingButtonRef}
          variant="contained"
          color="primary"
          onClick={handleStart}
          aria-label="Start Tetris"
        >
          Press to Start
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          (You can also press <b>Space</b> or <b>Enter</b> to start)
        </Typography>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'auto' }}>
      <AppHeader title="Tetris" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          mt: 2,
          minWidth: 400,
          width: '100%',
          overflowX: 'auto',
        }}
      >
        {SidePanel}
        <Box sx={{ mx: { xs: 0, sm: 4 }, my: { xs: 2, sm: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            id="tetris-canvas"
            width={BOARD_WIDTH * CELL_SIZE}
            height={BOARD_HEIGHT * CELL_SIZE}
            style={{ border: '2px solid #ccc', background: '#fff', borderRadius: 8 }}
            tabIndex={0}
            aria-label="Tetris playfield"
            role="region"
          />
          {Controls}
        </Box>
      </Box>
      {OnboardingOverlay}
      {PauseOverlay}
      {GameOverOverlay}
    </Box>
  );
};

export default TetrisGame; 