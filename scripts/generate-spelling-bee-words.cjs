const fs = require('fs');

(async () => {
  const wordListPath = (await import('word-list')).default;
  const words = fs.readFileSync(wordListPath, 'utf8').split('\n');

  // Only alphabetic, 4+ letters, max 7 unique letters
  const validWords = words.filter(word => {
    if (word.length < 4) return false;
    if (!/^[a-zA-Z]+$/.test(word)) return false;
    const unique = new Set(word.toLowerCase());
    return unique.size <= 7;
  });

  // Pangram candidates: exactly 7 unique letters, no repeats
  const pangramCandidates = validWords.filter(word => {
    const lower = word.toLowerCase();
    if (lower.length < 7) return false;
    const unique = new Set(lower);
    return unique.size === 7 && lower.length === 7;
  });

  // Write valid words
  fs.writeFileSync('src/spelling-bee/words.json', JSON.stringify(validWords, null, 2));
  // Write pangram candidates
  fs.writeFileSync('src/spelling-bee/pangrams.json', JSON.stringify(pangramCandidates, null, 2));

  // Letter frequency analysis for pangram candidates
  console.log('Pangram Candidates and Center Letter Suggestions:');
  pangramCandidates.slice(0, 20).forEach(word => { // Show only first 20 for brevity
    const freq = {};
    for (const c of word.toLowerCase()) freq[c] = (freq[c] || 0) + 1;
    const center = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    console.log(`${word}: center letter suggestion = '${center}', letter counts =`, freq);
  });

  console.log(`\nTotal valid words: ${validWords.length}`);
  console.log(`Total pangram candidates: ${pangramCandidates.length}`);
})(); 