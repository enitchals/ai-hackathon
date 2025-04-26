const fs = require('fs');

(async () => {
  const wordListPath = (await import('word-list')).default;
  const words = fs.readFileSync(wordListPath, 'utf8').split('\n');
  const fiveLetterWords = words.filter(word => word.length === 5 && /^[a-zA-Z]+$/.test(word));
  fs.writeFileSync('src/wordl/words-5.json', JSON.stringify(fiveLetterWords, null, 2));
  console.log(`Extracted ${fiveLetterWords.length} five-letter words to src/wordl/words-5.json`);
})(); 