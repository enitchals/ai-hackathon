// Pastel rainbow color palette for Tetris tetrominoes
// Each key is a tetromino type (I, O, T, S, Z, J, L)
// Colors are soft, high-contrast pastels, easy to extend for new pieces

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const tetrisTheme: Record<TetrominoType, { main: string; border: string }> = {
  I: { main: '#AEEBFF', border: '#6DD6F7' }, // Pastel cyan
  O: { main: '#FFF6A5', border: '#FFE066' }, // Pastel yellow
  T: { main: '#D1B3FF', border: '#B39DDB' }, // Pastel purple
  S: { main: '#B6F7C1', border: '#6EE7B7' }, // Pastel green
  Z: { main: '#FFB3B3', border: '#FF6F91' }, // Pastel red/pink
  J: { main: '#B3C7FF', border: '#6A89FF' }, // Pastel blue
  L: { main: '#FFD6B3', border: '#FFB26B' }, // Pastel orange
};

// For future extension, add new keys and colors here. 