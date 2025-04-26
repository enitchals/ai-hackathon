import { TetrominoType } from './tetrisTheme';

export type PlayfieldCell = {
  type: TetrominoType | null;
  filled: boolean;
  ghost?: boolean;
};

export type Playfield = PlayfieldCell[][]; // [row][col]

export interface Tetromino {
  type: TetrominoType;
  rotation: number; // 0-3
  row: number;
  col: number;
  shape: number[][]; // 4x4 matrix (1 = filled, 0 = empty)
}

export enum GameStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  GameOver = 'gameover',
}

export interface GameState {
  playfield: Playfield;
  activeTetromino: Tetromino;
  nextTetrominoes: TetrominoType[];
  holdTetromino: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
  highScore: number;
} 