import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppHeader from '../components/AppHeader';
import { words5 as wordList } from './words-5';
import answersList from './words-5-answers.json';

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

// Standard Wordl stats type
interface WordlStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = 1 guess, index 5 = 6 guesses
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const validWords: string[] = Array.isArray(wordList) ? wordList.map(w => w.toUpperCase()) : Object.keys(wordList).map(w => w.toUpperCase());
const possibleAnswers: string[] = Array.isArray(answersList) ? answersList.map(w => w.toUpperCase()) : Object.keys(answersList).map(w => w.toUpperCase());

const STATS_KEY = 'wordl-stats-v1';

function loadStats(): WordlStats {
  const raw = localStorage.getItem(STATS_KEY);
  if (raw) return JSON.parse(raw);
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  };
}

function saveStats(stats: WordlStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export default function WordlGame() {
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    targetWord: '',
    gameOver: false,
    won: false,
  });

  const theme = useTheme();
  const [stats, setStats] = useState<WordlStats>(loadStats());
  const [showStats, setShowStats] = useState(false);
  // Onboarding overlay state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding only on first visit (per session)
    return sessionStorage.getItem('wordl-onboarding-shown') !== '1';
  });

  const onboardingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Add after theme and state declarations
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Focus trap for overlays
  useLayoutEffect(() => {
    if (showOnboarding && onboardingRef.current) {
      onboardingRef.current.focus();
    } else if (showStats && statsRef.current) {
      statsRef.current.focus();
    }
  }, [showOnboarding, showStats]);

  // Initialize the game with a random word
  useEffect(() => {
    const randomWord = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)].toUpperCase();
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

  // Listen for physical keyboard input to trigger key feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key.toUpperCase();
      if (key === 'ENTER') key = 'Enter';
      if (key === 'BACKSPACE') key = 'Backspace';
      if ((/^[A-Z]$/.test(key) || key === 'Enter' || key === 'Backspace')) {
        setActiveKey(key);
        setTimeout(() => setActiveKey(null), 120);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const renderLetterTile = (letter: string, state: LetterState, idx?: number) => {
    // The following colors are intentionally not themed, as they match the classic Wordle feedback colors
    // (green/yellow/gray) for user clarity and accessibility.
    const colors = {
      correct: '#6AAA64',
      present: '#C9B458',
      absent: '#787C7E',
      empty: theme.palette.background.paper,
    };
    return (
      <Box
        sx={{
          width: 50,
          height: 50,
          border: `2px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          backgroundColor: colors[state],
          color: state === 'empty' ? theme.palette.text.primary : '#FFFFFF',
        }}
        aria-label={letter ? `${letter}, ${state}` : 'empty'}
        role="gridcell"
        tabIndex={-1}
        key={idx}
      >
        {letter}
      </Box>
    );
  };

  // Render a row of letter tiles
  const renderRow = (word: string, states?: WordState, rowIdx?: number) => {
    const letters = word.split('');
    const letterStates = states || Array(WORD_LENGTH).fill('empty');
    return (
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }} role="row" aria-label={`Guess row ${rowIdx !== undefined ? rowIdx + 1 : ''}`}> 
        {Array(WORD_LENGTH)
          .fill(0)
          .map((_, i) => renderLetterTile(letters[i] || '', letterStates[i], i))}
      </Box>
    );
  };

  // Update stats at game over
  useEffect(() => {
    if (!gameState.gameOver) return;
    setShowStats(true);
    setStats((prevStats: WordlStats) => {
      const newStats = { ...prevStats };
      newStats.gamesPlayed++;
      if (gameState.won) {
        newStats.gamesWon++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.maxStreak) newStats.maxStreak = newStats.currentStreak;
        const guessesUsed = gameState.guesses.length;
        if (guessesUsed >= 1 && guessesUsed <= 6) {
          newStats.guessDistribution[guessesUsed - 1]++;
        }
      } else {
        newStats.currentStreak = 0;
      }
      saveStats(newStats);
      return newStats;
    });
  }, [gameState.gameOver]);

  // Mark onboarding as shown when dismissed
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('wordl-onboarding-shown', '1');
  };

  // In handleVirtualKey, add feedback for virtual taps
  const handleVirtualKey = (key: string) => {
    if (gameState.gameOver) return;
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 120);
    if (key === 'Backspace') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
    } else if (key === 'Enter') {
      if (gameState.currentGuess.length === WORD_LENGTH) {
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
    } else if (/^[A-Z]$/.test(key) && gameState.currentGuess.length < WORD_LENGTH) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key,
      }));
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden', '@media (max-width: 600px)': { height: '100dvh', minHeight: '100dvh', overflow: 'hidden' } }}>
      <AppHeader title="wordl" />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
            aria-label="how to play instructions"
          >
            <Box ref={onboardingRef} tabIndex={-1} sx={{ bgcolor: theme.palette.background.paper, p: 4, borderRadius: 2, minWidth: 320, maxWidth: 400, boxShadow: 8 }} onClick={e => e.stopPropagation()}>
              <Typography variant="h5" sx={{ mb: 2 }}>how to play</Typography>
              <Typography sx={{ mb: 2 }}>
                guess the <b>5-letter word</b> in 6 tries.<br /><br />
                each guess must be a valid 5-letter word. hit <b>enter</b> to submit.<br /><br />
                after each guess, the color of the tiles will show how close your guess was to the word:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ width: 36, height: 36, bgcolor: '#6AAA64', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, fontWeight: 'bold' }}>G</Box>
                <Typography sx={{ alignSelf: 'center' }}>= correct letter & position</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ width: 36, height: 36, bgcolor: '#C9B458', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, fontWeight: 'bold' }}>Y</Box>
                <Typography sx={{ alignSelf: 'center' }}>= correct letter, wrong position</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ width: 36, height: 36, bgcolor: '#787C7E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, fontWeight: 'bold' }}>A</Box>
                <Typography sx={{ alignSelf: 'center' }}>= not in the word</Typography>
              </Box>
              <Typography sx={{ mb: 2 }}>
                use your keyboard or tap the on-screen keys.<br />
                your stats are tracked locally.
              </Typography>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <button onClick={handleCloseOnboarding} style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: 6, border: 'none', background: theme.palette.primary.main, color: theme.palette.primary.contrastText, cursor: 'pointer' }} aria-label="start playing">start playing</button>
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ mb: 4 }} role="grid" aria-label="Wordl Guess Board">
          {gameState.guesses.map((guess, idx) => renderRow(guess, getLetterStates(guess), idx))}
          {!gameState.gameOver && renderRow(gameState.currentGuess, undefined, gameState.guesses.length)}
          {Array(MAX_GUESSES - gameState.guesses.length - (gameState.gameOver ? 0 : 1))
            .fill(0)
            .map((_, idx) => renderRow('', undefined, gameState.guesses.length + 1 + idx))}
        </Box>
        <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
          {gameState.gameOver ? (gameState.won ? 'you won!' : `game over! the word was ${gameState.targetWord}`) : ''}
        </div>
        {gameState.gameOver && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }} aria-live="polite">
              {gameState.won ? 'you won! 🎉' : `game over! the word was ${gameState.targetWord}`}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <button onClick={() => setShowStats(true)} style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: 6, border: 'none', background: theme.palette.primary.main, color: theme.palette.primary.contrastText, cursor: 'pointer' }} aria-label="show stats">show stats</button>
            </Box>
          </>
        )}
        {/* Stats Modal/Overlay */}
        {showStats && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            onClick={() => setShowStats(false)}
            role="dialog"
            aria-modal="true"
            aria-label="statistics"
          >
            <Box ref={statsRef} tabIndex={-1} sx={{ bgcolor: theme.palette.background.paper, p: 4, borderRadius: 2, minWidth: 320 }} onClick={e => e.stopPropagation()}>
              <Typography variant="h6" sx={{ mb: 2 }}>statistics</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.gamesPlayed}</Typography>
                  <Typography variant="body2">played</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.gamesWon}</Typography>
                  <Typography variant="body2">wins</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.currentStreak}</Typography>
                  <Typography variant="body2">current streak</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.maxStreak}</Typography>
                  <Typography variant="body2">max streak</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>guess distribution</Typography>
              <Box>
                {stats.guessDistribution.map((count: number, i: number) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ width: 24 }}>{i + 1}</Typography>
                    <Box sx={{ bgcolor: theme.palette.primary.main, height: 20, width: `${Math.max(8, count * 16)}px`, borderRadius: 1, mx: 1 }} />
                    <Typography>{count}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <button onClick={() => setShowStats(false)} style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: 6, border: 'none', background: theme.palette.secondary.main, color: theme.palette.secondary.contrastText, cursor: 'pointer' }} aria-label="close stats">close</button>
              </Box>
            </Box>
          </Box>
        )}
        {/* QWERTY Keyboard */}
        <Box
          sx={{
            mt: 2,
            userSelect: 'none',
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            '@media (max-width: 600px)': {
              maxWidth: '100vw',
              px: 1,
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1200,
              background: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
            },
          }}
          aria-label="On-screen keyboard"
        >
          {(() => {
            // QWERTY layout with Enter on a 4th row, Backspace at the end of row 3, and an empty space for spacing
            // This matches the checklist request
            const rows = [
              'QWERTYUIOP'.split(''),
              'ASDFGHJKL'.split(''),
              ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '', 'Backspace'],
              ['Enter'],
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

            // Responsive key sizes
            const KEY_WIDTH = 'clamp(32px, 7vw, 44px)';
            const SPECIAL_KEY_WIDTH = 'clamp(48px, 14vw, 80px)';
            const KEY_HEIGHT = 'clamp(40px, 8vw, 56px)';
            return rows.map((row, rowIdx) => (
              <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'center', mb: 1, gap: 1 }}>
                {row.map((key, i) => {
                  if (key === '') {
                    // Spacer for Backspace alignment
                    return <Box key={i} sx={{ width: KEY_WIDTH, height: KEY_HEIGHT }} />;
                  }
                  const isSpecial = key === 'Enter' || key === 'Backspace';
                  let display = key;
                  if (key === 'Backspace') display = '⌫';
                  if (key === 'Enter') display = '→';
                  const isActive = activeKey === key;
                  return (
                    <button
                      key={key}
                      aria-label={key === 'Enter' ? 'Enter' : key === 'Backspace' ? 'Backspace' : key}
                      onClick={() => handleVirtualKey(key)}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleVirtualKey(key);
                        }
                      }}
                      style={{
                        width: isSpecial ? SPECIAL_KEY_WIDTH : KEY_WIDTH,
                        height: KEY_HEIGHT,
                        margin: 0,
                        borderRadius: 8,
                        background: isActive ? '#FFD700' : (isSpecial ? '#AAB7B8' : colors[letterStatus[key] || 'empty']),
                        color: isSpecial ? '#222' : (letterStatus[key] && letterStatus[key] !== 'empty' ? '#fff' : '#000'),
                        fontWeight: 'bold',
                        fontSize: isSpecial ? '1.2rem' : '1.1rem',
                        boxShadow: isActive ? '0 0 8px 2px #FFD700' : '0 1px 2px rgba(0,0,0,0.08)',
                        border: 'none',
                        cursor: 'pointer',
                        userSelect: 'none',
                        flex: `0 0 ${isSpecial ? SPECIAL_KEY_WIDTH : KEY_WIDTH}`,
                        maxWidth: isSpecial ? SPECIAL_KEY_WIDTH : KEY_WIDTH,
                        minWidth: isSpecial ? SPECIAL_KEY_WIDTH : KEY_WIDTH,
                        transition: 'background 0.15s, box-shadow 0.15s, transform 0.12s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        touchAction: 'manipulation',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {display}
                    </button>
                  );
                })}
              </Box>
            ));
          })()}
        </Box>
        <Box sx={{ textAlign: 'right', width: '100%', maxWidth: 400, mb: 1 }}>
          <button onClick={() => setShowOnboarding(true)} style={{ fontSize: '0.95rem', padding: '4px 12px', borderRadius: 6, border: 'none', background: theme.palette.info.main, color: theme.palette.info.contrastText, cursor: 'pointer' }} aria-label="how to play">how to play</button>
        </Box>
      </Box>
    </Box>
  );
} 