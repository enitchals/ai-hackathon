import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AppHeader from '../components/AppHeader';
import wordList from './words-5.json';

// Types
type LetterState = 'correct' | 'present' | 'absent' | 'empty';
type WordState = LetterState[];

interface GameState {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  gameOver: boolean;
  won: boolean;
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const validWords: string[] = wordList.map(w => w.toUpperCase());

export default function WordleGame() {
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    targetWord: '',
    gameOver: false,
    won: false,
  });

  // Initialize the game with a random word
  useEffect(() => {
    const randomWord = validWords[Math.floor(Math.random() * validWords.length)].toUpperCase();
    setGameState(prev => ({ ...prev, targetWord: randomWord }));
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      if (e.key === 'Enter' && gameState.currentGuess.length === WORD_LENGTH) {
        // Submit guess
        if (validWords.includes(gameState.currentGuess)) {
          const newGuesses = [...gameState.guesses, gameState.currentGuess];
          const won = gameState.currentGuess === gameState.targetWord;
          setGameState(prev => ({
            ...prev,
            guesses: newGuesses,
            currentGuess: '',
            gameOver: won || newGuesses.length >= MAX_GUESSES,
            won,
          }));
        }
      } else if (e.key === 'Backspace') {
        // Delete last letter
        setGameState(prev => ({
          ...prev,
          currentGuess: prev.currentGuess.slice(0, -1),
        }));
      } else if (
        /^[A-Za-z]$/.test(e.key) &&
        gameState.currentGuess.length < WORD_LENGTH
      ) {
        // Add letter
        setGameState(prev => ({
          ...prev,
          currentGuess: prev.currentGuess + e.key.toUpperCase(),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Calculate letter states for a guess
  const getLetterStates = (guess: string): WordState => {
    const states: WordState = Array(WORD_LENGTH).fill('empty');
    const targetLetters = gameState.targetWord.split('');
    const guessLetters = guess.split('');

    // First pass: mark correct letters
    guessLetters.forEach((letter, i) => {
      if (letter === targetLetters[i]) {
        states[i] = 'correct';
        targetLetters[i] = ''; // Mark as used
      }
    });

    // Second pass: mark present letters
    guessLetters.forEach((letter, i) => {
      if (states[i] === 'empty') {
        const targetIndex = targetLetters.indexOf(letter);
        if (targetIndex !== -1) {
          states[i] = 'present';
          targetLetters[targetIndex] = ''; // Mark as used
        } else {
          states[i] = 'absent';
        }
      }
    });

    return states;
  };

  // Render a single letter tile
  const renderLetterTile = (letter: string, state: LetterState) => {
    const colors = {
      correct: '#6AAA64',
      present: '#C9B458',
      absent: '#787C7E',
      empty: '#FFFFFF',
    };

    return (
      <Box
        sx={{
          width: 50,
          height: 50,
          border: '2px solid #D3D6DA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          backgroundColor: colors[state],
          color: state === 'empty' ? '#000000' : '#FFFFFF',
        }}
      >
        {letter}
      </Box>
    );
  };

  // Render a row of letter tiles
  const renderRow = (word: string, states?: WordState) => {
    const letters = word.split('');
    const letterStates = states || Array(WORD_LENGTH).fill('empty');

    return (
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        {Array(WORD_LENGTH)
          .fill(0)
          .map((_, i) => renderLetterTile(letters[i] || '', letterStates[i]))}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Wordle" />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ mb: 4 }}>
          {gameState.guesses.map((guess) => renderRow(guess, getLetterStates(guess)))}
          {!gameState.gameOver && renderRow(gameState.currentGuess)}
          {Array(MAX_GUESSES - gameState.guesses.length - (gameState.gameOver ? 0 : 1))
            .fill(0)
            .map((_, i) => renderRow(''))}
        </Box>

        {gameState.gameOver && (
          <Typography variant="h5" sx={{ mb: 2 }}>
            {gameState.won ? 'You won! 🎉' : `Game Over! The word was ${gameState.targetWord}`}
          </Typography>
        )}

        {/* QWERTY Keyboard */}
        <Box sx={{ mt: 2, userSelect: 'none' }}>
          {(() => {
            // QWERTY layout
            const rows = [
              'QWERTYUIOP'.split(''),
              'ASDFGHJKL'.split(''),
              'ZXCVBNM'.split(''),
            ];

            // Build a map of letter -> best status
            const letterStatus: Record<string, LetterState> = {};
            for (const guess of gameState.guesses) {
              const states = getLetterStates(guess);
              for (let i = 0; i < guess.length; i++) {
                const letter = guess[i];
                const state = states[i];
                // Only upgrade status (empty < absent < present < correct)
                const prev = letterStatus[letter];
                if (
                  !prev ||
                  (prev === 'empty' && state !== 'empty') ||
                  (prev === 'absent' && (state === 'present' || state === 'correct')) ||
                  (prev === 'present' && state === 'correct')
                ) {
                  letterStatus[letter] = state;
                }
              }
            }

            const colors = {
              correct: '#6AAA64',
              present: '#C9B458',
              absent: '#787C7E',
              empty: '#D3D6DA',
            };

            return rows.map((row, rowIdx) => (
              <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {row.map((letter) => (
                  <Box
                    key={letter}
                    sx={{
                      width: 40,
                      height: 58,
                      m: 0.5,
                      borderRadius: 1,
                      backgroundColor: colors[letterStatus[letter] || 'empty'],
                      color: letterStatus[letter] && letterStatus[letter] !== 'empty' ? '#fff' : '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      cursor: 'default',
                      userSelect: 'none',
                    }}
                  >
                    {letter}
                  </Box>
                ))}
              </Box>
            ));
          })()}
        </Box>
      </Box>
    </Box>
  );
} 