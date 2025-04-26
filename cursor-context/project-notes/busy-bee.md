# Busy Bee (Spelling Bee Clone) – Project Outline

## Overview
Create a web-based clone of the Spelling Bee word puzzle game. Players are presented with 7 letters (one required center letter) and must form as many valid words as possible, always including the center letter. Words must be at least 4 letters long. Points are awarded for each word, with bonuses for pangrams (words using all 7 letters).

---

## Game Rules & Mechanics
- 7 letters are displayed in a hexagonal layout; one is always in the center and must be used in every word.
- Players form words using the given letters, each word must:
  - Be at least 4 letters long
  - Include the center letter
  - Use only the provided letters (letters can be reused)
  - Be a valid English word (from a dictionary)
- Pangram: a word using all 7 letters at least once
- Scoring:
  - 1 point per 4-letter word
  - 1 point per letter for words longer than 4 letters
  - Bonus points for pangrams (e.g., +7)
- No proper nouns, hyphenated words, or obscure words

---

## Data Requirements
- Comprehensive English word list (e.g., enable1, SOWPODS, or similar)
- Logic to select 7-letter sets that guarantee at least one pangram
- Optionally, a curated list of daily puzzles

---

## UI/UX Considerations
- Hexagonal letter layout with a distinct center letter
- Input area for word entry (keyboard and/or on-screen tapping)
- Display of found words and current score
- Feedback for invalid words (not in dictionary, missing center letter, etc.)
- Visual indicator for pangram discovery
- Option to shuffle outer letters
- Responsive design for mobile and desktop

---

## Core Logic & Validation
- Letter selection and puzzle generation (ensure at least one pangram)
- Word validation:
  - Check length
  - Check inclusion of center letter
  - Check against word list
  - Prevent duplicates
- Scoring calculation
- Pangram detection

---

## Scoring System
- 4-letter word: 1 point
- 5+ letter word: 1 point per letter
- Pangram: +7 bonus points (configurable)
- Display running total and possible max score

---

## Possible Extensions & Future Features
- Daily puzzle mode with leaderboard
- User accounts and progress tracking
- Hints or reveal features
- Dark mode and accessibility options
- Custom puzzle creation/sharing
- Analytics on most/least found words

---

## Next Steps
1. Select or prepare a suitable word list
2. Implement puzzle generator (with pangram guarantee)
3. Build core game logic and validation
4. Design and implement UI
5. Playtest and refine scoring/UX 