import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Chip, Paper, Container } from '@mui/material';
import AppHeader from './AppHeader';

// Dynamic imports for large word lists
const pangramsPromise = import('../spelling-bee/pangrams.json');
const wordsPromise = import('../spelling-bee/words.json');

function getUniqueLetters(word: string) {
  return Array.from(new Set(word.toLowerCase().split('')));
}

function getLetterFrequency(word: string) {
  const freq: Record<string, number> = {};
  for (const c of word.toLowerCase()) freq[c] = (freq[c] || 0) + 1;
  return freq;
}

function pickCenterLetter(word: string) {
  const freq = getLetterFrequency(word);
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function getAllValidWords(words: string[], letters: string[], center: string) {
  return words.filter(word => {
    if (word.length < 4) return false;
    const lower = word.toLowerCase();
    if (!lower.includes(center)) return false;
    return lower.split('').every(l => letters.includes(l));
  });
}

function getAllPangrams(words: string[], letters: string[]) {
  return words.filter(word => {
    const unique = new Set(word.toLowerCase());
    return letters.every(l => unique.has(l)) && unique.size === 7;
  });
}

const STORAGE_KEY = 'spelling-bee-puzzle-v1';

interface Puzzle {
  letters: string[];
  center: string;
  pangrams: string[];
  validWords: string[];
  foundWords: string[];
}

const SpellingBeeGame: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [showPangrams, setShowPangrams] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load or generate puzzle
  useEffect(() => {
    async function loadPuzzle() {
      setLoading(true);
      const [pangramsData, wordsData] = await Promise.all([pangramsPromise, wordsPromise]);
      const pangrams: string[] = pangramsData.default;
      const words: string[] = wordsData.default;
      // Try to load from localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPuzzle(JSON.parse(saved));
        setLoading(false);
        return;
      }
      // Generate new puzzle
      const randomPangram = pangrams[Math.floor(Math.random() * pangrams.length)].toLowerCase();
      const letters = getUniqueLetters(randomPangram); // always 7 unique letters now
      const center = pickCenterLetter(randomPangram);
      const validWords = getAllValidWords(words, letters, center);
      const pangramWords = getAllPangrams(validWords, letters);
      const newPuzzle: Puzzle = {
        letters,
        center,
        pangrams: pangramWords,
        validWords,
        foundWords: [],
      };
      setPuzzle(newPuzzle);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPuzzle));
      setLoading(false);
    }
    loadPuzzle();
  }, []);

  // Handle guess submission
  const handleGuess = () => {
    if (!puzzle) return;
    const word = guess.toLowerCase();
    if (word.length < 4) {
      setMessage('Word too short!');
    } else if (!puzzle.validWords.includes(word)) {
      setMessage('Not a valid word!');
    } else if (puzzle.foundWords.includes(word)) {
      setMessage('Already found!');
    } else {
      const updated = { ...puzzle, foundWords: [...puzzle.foundWords, word] };
      setPuzzle(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setMessage('');
    }
    setGuess('');
  };

  // New game
  const handleNewGame = async () => {
    setLoading(true);
    const [pangramsData, wordsData] = await Promise.all([pangramsPromise, wordsPromise]);
    const pangrams: string[] = pangramsData.default;
    const words: string[] = wordsData.default;
    const randomPangram = pangrams[Math.floor(Math.random() * pangrams.length)].toLowerCase();
    const letters = getUniqueLetters(randomPangram); // always 7 unique letters now
    const center = pickCenterLetter(randomPangram);
    const validWords = getAllValidWords(words, letters, center);
    const pangramWords = getAllPangrams(validWords, letters);
    const newPuzzle: Puzzle = {
      letters,
      center,
      pangrams: pangramWords,
      validWords,
      foundWords: [],
    };
    setPuzzle(newPuzzle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPuzzle));
    setShowPangrams(false);
    setMessage('');
    setLoading(false);
  };

  if (loading || !puzzle) return <Typography>Loading...</Typography>;

  // Prepare outer letters (exclude center)
  const outerLetters = puzzle.letters.filter(l => l !== puzzle.center);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Spelling Bee" showBackButton showThemePicker />
      <Container maxWidth="sm" sx={{ py: 4, flexGrow: 1 }}>
        <Box textAlign="center" mb={2}>
          {/* True hexagon letter layout with clickable letter buttons */}
          <Box position="relative" width={180} height={180} mx="auto" mb={2}>
            {/* Top */}
            <Box position="absolute" left={70} top={0}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[0])}>{outerLetters[0].toUpperCase()}</Button>
            </Box>
            {/* Top right */}
            <Box position="absolute" left={120} top={35}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[1])}>{outerLetters[1].toUpperCase()}</Button>
            </Box>
            {/* Bottom right */}
            <Box position="absolute" left={120} top={105}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[2])}>{outerLetters[2].toUpperCase()}</Button>
            </Box>
            {/* Bottom */}
            <Box position="absolute" left={70} top={140}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[3])}>{outerLetters[3].toUpperCase()}</Button>
            </Box>
            {/* Bottom left */}
            <Box position="absolute" left={20} top={105}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[4])}>{outerLetters[4].toUpperCase()}</Button>
            </Box>
            {/* Top left */}
            <Box position="absolute" left={20} top={35}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[5])}>{outerLetters[5].toUpperCase()}</Button>
            </Box>
            {/* Center */}
            <Box position="absolute" left={70} top={70}>
              <Button variant="contained" color="primary" sx={{ fontWeight: 'bold', fontSize: 28, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%', boxShadow: 3 }} onClick={() => setGuess(guess + puzzle.center)}>{puzzle.center.toUpperCase()}</Button>
            </Box>
          </Box>
          <Box mt={2}>
            <TextField
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGuess(); }}
              label="Enter word"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Button variant="contained" onClick={handleGuess}>Submit</Button>
          </Box>
          {message && <Typography color="error" mt={1}>{message}</Typography>}
          <Box mt={2}>
            <Button variant="outlined" onClick={handleNewGame} sx={{ mr: 1 }}>New Game</Button>
            <Button variant="outlined" onClick={() => setShowPangrams(true)}>I give up, what's the pangram?</Button>
          </Box>
        </Box>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Found Words ({puzzle.foundWords.length}/{puzzle.validWords.length}):</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {puzzle.foundWords.map(w => <Chip key={w} label={w} color="success" />)}
          </Box>
        </Paper>
        {showPangrams && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Pangram(s):</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {puzzle.pangrams.map(w => <Chip key={w} label={w} color="warning" />)}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default SpellingBeeGame; 