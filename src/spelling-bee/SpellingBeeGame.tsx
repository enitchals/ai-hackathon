import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Chip, Paper, Container, Modal, IconButton } from '@mui/material';
import AppHeader from '../components/AppHeader';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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

const STORAGE_KEY = 'busy-bee-puzzle-v1';
const ONBOARDING_KEY = 'busy-bee-onboarding-shown';

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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return sessionStorage.getItem(ONBOARDING_KEY) !== '1';
  });

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

  // Onboarding overlay
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem(ONBOARDING_KEY, '1');
  };

  if (loading || !puzzle) return <Typography>Loading...</Typography>;

  // Prepare outer letters (exclude center)
  const outerLetters = puzzle.letters.filter(l => l !== puzzle.center);

  // Sort found words by length, then alphabetically
  const sortedFoundWords = [...puzzle.foundWords].sort((a, b) =>
    a.length !== b.length ? a.length - b.length : a.localeCompare(b)
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <AppHeader title="busy bee" showBackButton showThemePicker />
      <Container maxWidth="sm" sx={{ py: 4, flexGrow: 1 }}>
        <Box textAlign="center" mb={2}>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <IconButton aria-label="how to play" onClick={() => setShowOnboarding(true)} size="small">
              <InfoOutlinedIcon />
            </IconButton>
          </Box>
          {/* True hexagon letter layout with clickable letter buttons */}
          <Box position="relative" width={180} height={180} mx="auto" mb={2} aria-label="letter selection hexagon">
            {/* Top */}
            <Box position="absolute" left={70} top={0}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[0])} aria-label={`Add letter ${outerLetters[0].toUpperCase()}`}>{outerLetters[0].toUpperCase()}</Button>
            </Box>
            {/* Top right */}
            <Box position="absolute" left={120} top={35}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[1])} aria-label={`Add letter ${outerLetters[1].toUpperCase()}`}>{outerLetters[1].toUpperCase()}</Button>
            </Box>
            {/* Bottom right */}
            <Box position="absolute" left={120} top={105}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[2])} aria-label={`Add letter ${outerLetters[2].toUpperCase()}`}>{outerLetters[2].toUpperCase()}</Button>
            </Box>
            {/* Bottom */}
            <Box position="absolute" left={70} top={140}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[3])} aria-label={`Add letter ${outerLetters[3].toUpperCase()}`}>{outerLetters[3].toUpperCase()}</Button>
            </Box>
            {/* Bottom left */}
            <Box position="absolute" left={20} top={105}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[4])} aria-label={`Add letter ${outerLetters[4].toUpperCase()}`}>{outerLetters[4].toUpperCase()}</Button>
            </Box>
            {/* Top left */}
            <Box position="absolute" left={20} top={35}>
              <Button variant="contained" color="secondary" sx={{ fontSize: 24, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%' }} onClick={() => setGuess(guess + outerLetters[5])} aria-label={`Add letter ${outerLetters[5].toUpperCase()}`}>{outerLetters[5].toUpperCase()}</Button>
            </Box>
            {/* Center */}
            <Box position="absolute" left={70} top={70}>
              <Button variant="contained" color="primary" sx={{ fontWeight: 'bold', fontSize: 28, width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%', boxShadow: 3 }} onClick={() => setGuess(guess + puzzle.center)} aria-label={`Add center letter ${puzzle.center.toUpperCase()}`}>{puzzle.center.toUpperCase()}</Button>
            </Box>
          </Box>
          <Box mt={2} aria-label="word entry">
            <TextField
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGuess(); }}
              label="enter word"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
              inputProps={{ 'aria-label': 'word input' }}
            />
            <Button variant="contained" onClick={handleGuess} aria-label="submit word">submit</Button>
          </Box>
          {message && <Typography color="error" mt={1} aria-live="polite">{message.toLowerCase()}</Typography>}
          <Box mt={2}>
            <Button variant="outlined" onClick={handleNewGame} sx={{ mr: 1 }} aria-label="new game">new game</Button>
            <Button variant="outlined" onClick={() => setShowPangrams(true)} aria-label="i give up">i give up</Button>
          </Box>
        </Box>
        <Paper sx={{ p: 2, mb: 2 }} aria-label="found words list">
          <Typography variant="h6">found words:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {sortedFoundWords.map(w => <Chip key={w} label={w} color="success" />)}
          </Box>
        </Paper>
        {showPangrams && (
          <Paper sx={{ p: 2, mb: 2 }} aria-label="pangram list">
            <Typography variant="h6">pangram(s):</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {puzzle.pangrams.map(w => <Chip key={w} label={w} color="warning" />)}
            </Box>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button variant="outlined" onClick={() => setShowPangrams(false)} aria-label="close pangram list">close</Button>
            </Box>
          </Paper>
        )}
        <Modal open={showOnboarding} onClose={handleCloseOnboarding} aria-labelledby="busy-bee-onboarding-title" aria-modal="true">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, minWidth: 320, maxWidth: 400, boxShadow: 8 }}>
            <Typography id="busy-bee-onboarding-title" variant="h5" sx={{ mb: 2 }}>how to play busy bee</Typography>
            <Typography sx={{ mb: 2 }}>
              make as many words as you can using the 7 letters.<br /><br />
              each word must be at least 4 letters and must include the center letter.<br /><br />
              letters can be used more than once. find the pangram(s) that use all 7 letters for a bonus!
            </Typography>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button onClick={handleCloseOnboarding} variant="contained" aria-label="start playing">start playing</Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default SpellingBeeGame; 