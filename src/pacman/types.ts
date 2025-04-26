// Shared types for Pac-Man app

import type { MazeTile } from './mazeData';

export type Direction = 'up' | 'down' | 'left' | 'right' | null;

export interface Position {
  row: number;
  col: number;
  // For smooth movement, allow sub-tile offset (0-1)
  xOffset?: number;
  yOffset?: number;
}

export interface PacMan {
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  lives: number;
  isDying: boolean;
}

export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten';

export interface Ghost {
  name: GhostName;
  position: Position;
  direction: Direction;
  mode: GhostMode;
  scatterTarget: Position;
  isReturning: boolean;
}

export interface GameState {
  maze: MazeTile[][];
  pacman: PacMan;
  ghosts: Ghost[];
  score: number;
  level: number;
  pelletsLeft: number;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  frightenedTimer: number;
  scatterChaseTimer: number;
} 